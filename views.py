import logging
import urllib

from google.appengine.ext import db

from handlers import AdminHandler
from utils import entity_or_404


class Dashboard(AdminHandler):
    """A view that includes all of the data that we know how to manage."""

    def get(self):
        self.render('admin/index.html')


class Collection(AdminHandler):
    """A collection of items.  GETting the collection yields a page of items
    in that collection, POSTing to the collection adds a new item."""

    def get(self, kind):
        model_class = self.admin.model_for(kind)
        form_class = self.admin.form_for(kind)

        # TODO: Actually handle pagination
        offset = self.request.params.get('offset')
        page = self.paginate(model_class.all(), offset)

        context = {
            'kind': kind,
            'form': form_class(),
            'items': page['items'],
            'count': page['count'],
            'next': page['next'],
            'offset': offset,
            }
        self.render('admin/item_list.html', context)

    def post(self, kind):
        form_class = self.admin.form_for(kind)
        form = form_class(self.request.POST, self.get_uploaded_files())
        if form.is_valid():
            obj = form.save(commit=False)
            self.admin.pre_save(obj)
            obj.put()
            self.admin.post_save(obj)
            self.respond_json(self.admin.item_json(obj), status_code=201)
        else:
            resp = { 'errors': dict(form.errors.items()) }
            self.respond_json(resp, status_code=400)


class Subcollection(AdminHandler):
    pass


class Item(AdminHandler):
    """An individual item.  GET gets an editable view of the item, PUT updates
    the item, DELETE deletes the item.
    """

    def get(self, kind, key, form=None, status=200):
        obj = entity_or_404(key)
        form_class = self.admin.form_for(kind)

        if form is None:
            form = form_class(instance=obj)

        # Every item template gets the following context
        context = {
            'type': kind,
            'form': form,
            'obj': obj,
            }

        # Add in any extra context for this item
        context.update(self.admin.extra_context(obj))

        # Figure out which default item template we should use based on
        # whether this item can have children.
        if kind in self.admin.parents:
            item_template = 'item_with_children'
            context['children'] = self.admin.get_children(obj)
        else:
            item_template = 'item'

        # First try a custom template for the given item, fall back on the
        # generic item template
        templates = ('admin/%s.html' % kind.lower(),
                     'admin/%s.html' % item_template)
        self.render(templates, context, status=status)

    def post(self, kind, key):
        obj = entity_or_404(key)
        form_class = self.admin.form_for(kind)
        form = form_class(self.request.POST, instance=obj)
        if form.is_valid():
            # A short reference for form.cleaned_data
            data = form.cleaned_data

            # Get the form to update the object without saving it to the
            # datastore, so we can work around a bug below.
            obj = form.save(commit=False)

            # UGLY HACK: Due to App Engine SDK Issue 599, fields that should
            # be set to None on form.save() (e.g. setting a ReferenceProperty
            # to None using a dropdown) will not be updated.  So we might have
            # to save them twice.  More info:
            # http://code.google.com/p/googleappengine/issues/detail?id=599
            for field, value in data.iteritems():
                if value is None and getattr(obj, field) is not None:
                    logging.info('Working around App Engine bug 599')
                    setattr(obj, field, None)

            # Now, finally, save the object and run any hooks
            self.admin.pre_save(obj)
            obj.put()
            self.admin.post_save(obj)
            self.redirect('.')
        else:
            return self.get(kind, key, form, 400)

    def delete(self, kind, key):
        key = db.Key(key)
        self.admin.pre_delete(key)
        try:
            db.delete(key)
        except Exception, e:
            logging.error('Error deleting %s: %s', key, e)
            self.respond_json(str(e), 400)
        else:
            self.admin.post_delete(key)
            self.respond_json('OK')


class ItemFilter(AdminHandler):
    """Allows items to be filtered by a particular field, if they have been
    registered with that field in the admin site.
    """

    def get(self, kind, field):
        model_class = self.admin.model_for(kind)
        page = None

        # If we got the special '__id__' field, dispatch to the ItemIdFilter
        # view, which knows how to handle it.
        if field == '__id__':
            idview = ItemIdFilter()
            idview.initialize(self.request, self.response)
            idview.admin = self.admin
            return idview.get(kind)

        # Otherwise, we build a query to use based on the field we're querying
        # and the query given by the user.
        q = self._get_query(getattr(model_class, field, None))
        if q:
            query = model_class.all().filter('%s =' % field, q)
            page = self.paginate(query, None)

        # Did we actually get a page of results to return?
        if page:
            self.respond_json(page)
        else:
            self.respond_json('No query given', status_code=400)

    def _get_query(self, field):
        """Tries to determine what to use in the filter query based on the
        kind of field being queried against."""
        q = self.request.get('q')
        # If we're querying against a ReferenceProperty or a list of datastore
        # keys, we need to try to turn the given query into a db.Key object
        if isinstance(field, db.ReferenceProperty) or (
            isinstance(field, db.ListProperty) and field.item_type == db.Key):
            try:
                q = db.Key(q)
            except:
                q = None
        elif isinstance(field, db.IntegerProperty):
            try:
                q = int(q)
            except:
                q = None
        # Otherwise, we just return it as-is. TODO: Need to support numbers,
        # keys in list properties, etc?
        return q


class ItemIdFilter(AdminHandler):
    """A special-case filter for looking up items by their key IDs or key
    names.  If the given `q` query is numeric, it is assumed to be a key ID.
    Otherwise, it is assumed to be a key name.
    """

    def get(self, kind):
        q = self.request.get('q')
        if q.isdigit():
            q = int(q)
        key = db.Key.from_path(kind, q)
        item = db.get(key)
        # This is the same data structure returned by self.paginate,
        # as expected by the template.
        page = {
            'items': [self.admin.item_json(item)] if item else [],
            'next': None,
            'count': 1 if item else 0 }
        self.respond_json(page)


class BulkItems(AdminHandler):
    """Allows multiple items to be operated on at once."""

    def delete(self, kind, keys):
        try:
            keys = map(db.Key, urllib.unquote(keys).split(','))
        except Exception, e:
            logging.error('Invalid key(s): %s', e)
            self.respond_json(str(e), status=400)
        else:
            map(self.admin.pre_delete, keys)
            try:
                db.delete(keys)
            except Exception, e:
                logging.error('Bulk delete error: %s', e)
                self.respond_json(str(e), status=400)
            else:
                map(self.admin.post_delete, keys)
                self.respond_json('OK')
