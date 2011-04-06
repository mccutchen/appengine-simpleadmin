import logging
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
        offset = self.request.params.get('offset')
        page = self.paginate(model_class.all(), offset)
        self.respond_json(page)

    def post(self, kind):
        form_class = self.admin.form_for(kind)
        form = form_class(self.request.POST, self.get_uploaded_files())
        if form.is_valid():
            obj = form.save()
            self.admin.post_save(obj)
            self.respond_json(self.admin.item_json(obj), status_code=201)
        else:
            resp = { 'errors': dict(form.errors.items()) }
            self.respond_json(resp, status_code=400)


class Subcollection(AdminHandler):
    pass


class Item(AdminHandler):
    """An individual item.  GET gets an editable view of the item, PUT updates
    the item, DELETE deletes the item."""

    def get(self, kind, key, form=None, status=200):
        obj = entity_or_404(key)
        form_class = self.admin.form_for(kind)

        if form is None:
            # Gather up the image fields, so we can provide an initial value of
            # True to the form if the field already has image data init it
            img_fields = [k for k,v in obj.properties().items()
                          if isinstance(v, db.BlobProperty)]
            img_urls = dict((f, '%s/%s/%s/img/%s/' % (self.admin.prefix,
                                                      kind, key, f))
                            for f in img_fields if getattr(obj, f))
            form = form_class(instance=obj, initial=img_urls)

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
        else:
            item_template = 'item'

        # First try a custom template for the given item, fall back on the
        # generic item template
        templates = ('admin/%s.html' % kind.lower(),
                     'admin/%s.html' % item_template)
        self.render_jinja(templates, context, status_code=status)

    def post(self, kind, key):
        obj = entity_or_404(key)
        form_class = self.admin.form_for(kind)
        files = self.get_uploaded_files()
        form = form_class(self.request.POST, files, instance=obj)
        if form.is_valid():
            # A short reference for form.cleaned_data
            data = form.cleaned_data

            # If the object has a content_type field, it might have an
            # associated BlobProperty containing some file data (usually an
            # image), and we should automatically update the content_type
            # field based on the content type of the uploaded file (if there
            # is one), but only if a content type wasn't already given.
            if hasattr(obj, 'content_type') and 'content_type' not in data:
                for field, prop in obj.properties().iteritems():
                    if isinstance(prop, db.BlobProperty):
                        newval = data.get(field)
                        # This will be True if it's an uploaded file object
                        if hasattr(newval, 'content_type'):
                            logging.info(
                                'Automagic content type for %s: %s',
                                newval, newval.content_type)
                            data['content_type'] = newval.content_type
                            break

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

            # Now, finally, save the object
            obj.put()

            # Run any post_save hooks
            self.admin.post_save(obj)

            # If we got any file uploads, it's (probably) an image for this
            # object, so call the callback
            if files:
                self.admin.post_image_update(obj)
            self.redirect('.')
        else:
            return self.get(kind, key, form, 400)

    def delete(self, kind, key):
        try:
            self.admin.delete(kind, key)
            self.respond_json('OK')
        except Exception, e:
            self.respond_json(str(e), 400)


class ItemFilter(AdminHandler):
    """Allows items to be filtered by a particular field, if they have been
    registered with that field in the admin site."""

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
    Otherwise, it is assumed to be a key name."""

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


class ItemSearch(AdminHandler):
    """Allows items to be searched."""

    def get(self, kind):
        model_class = self.admin.model_for(kind)
        q = self.request.get('q')
        if q and hasattr(model_class, 'search'):
            results = model_class.search(q)
            # Return a dict with all the data needed for pagination (though we
            # won't be paging through this, for now)
            resp = { 'items': map(self.admin.item_json, results),
                     'next': None,
                     'count': len(results) }
            self.respond_json(resp)
        else:
            self.respond_json('No query given', status_code=400)


class ItemImage(AdminHandler):
    """Allows an image for an item to be retrieved, given an item's key and the
    name of a field on the item with image content."""

    def get(self, kind, key, field):
        obj = entity_or_404(key)
        img = getattr(obj, field, None)
        if img:
            content_type = getattr(obj, 'content_type', 'image/jpeg')
            self.response.headers['Content-Type'] = str(content_type)
            self.response.out.write(img)
        else:
            self.response.out.write(
                '%s %s has no image in its %s field.' % (kind, obj, field))
            self.error(404)

    def post(self, kind, key, field):
        obj = entity_or_404(key)
        img = self.uploaded_files.get(field)
        if img:
            setattr(obj, field, img.read())
            if hasattr(obj, 'content_type'):
                obj.content_type = img.content_type
            obj.put()
            self.admin.post_save(obj)
            self.admin.post_image_update(obj)
            uri = '%s/%s/%s/img/%s/' % (self.admin.prefix, kind, key, field)
            resp = { 'uri': uri }
            self.respond_json(resp, status_code=201)
        else:
            self.respond_json('Unknown field', status_code=404)

    def delete(self, kind, key, field):
        obj = entity_or_404(key)
        if hasattr(obj, field):
            setattr(obj, field, None)
            obj.put()
            self.admin.post_image_update(obj)
            self.respond_json('OK')
        else:
            self.respond_json('Unknown field', status_code=400)


class BulkItems(AdminHandler):
    """Allows multiple items to be operated on at once."""

    def delete(self, kind, keys):
        import urllib
        keys = urllib.unquote(keys).split(',')
        try:
            for key in keys:
                self.admin.delete(kind, key)
            self.respond_json('OK')
        except Exception, e:
            logging.error('Bulk delete error: %s' % e)
            self.respond_json(str(e), status_code=400)

