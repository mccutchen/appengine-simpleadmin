import logging
import os
import sys
from collections import defaultdict
from functools import partial
import wsgiref.handlers

os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import users

import views
import utils


DEFAULT_PREFIX = '/admin'
DEFAULT_STATIC_PREFIX = '/static/admin'
DEFAULT_PAGE_SIZE = 20

# Where are we located?
ADMIN_ROOT = os.path.dirname(__file__)
PARENT_DIR = os.path.realpath(os.path.join(ADMIN_ROOT, '../'))

# Make sure we can add our template filters/tags
if PARENT_DIR not in sys.path:
    sys.path.append(PARENT_DIR)

webapp.template.register_template_library('simpleadmin.templateutils')


class SimpleAdmin(object):
    """Keeps track of the manageable entities (models and their corresponding
    forms) for a site.

    Subclasses might want to override extra_context method to control the
    context given to the templates for each kind of object.  The delete_hooks,
    if given, should be a subclass of BaseDeleteHooks, and can be used to
    control how objects are deleted."""

    def __init__(self, prefix=None, static_prefix=None, delete_hooks=None,
                 page_size=None):

        # The URL prefixes under which the admin app and its static resources
        # are mounted
        if prefix:
            self.prefix = prefix.rstrip('/')
        else:
            self.prefix = DEFAULT_PREFIX

        if static_prefix:
            self.static_prefix = static_prefix.rstrip('/')
        else:
            self.static_prefix = DEFAULT_STATIC_PREFIX

        # The names of the models we know how to manage, used as keys in the
        # dicts below
        self.names = set()

        # Keep track of what we know how to manage and how we can manage them,
        # all keyed on the names of the models we're managing.
        self.models = {}
        self.forms = {}
        self.filters = {}
        self.creatable = {}

        # Map parent names to child models, and vice versa
        self.parents = defaultdict(list)
        self.children = {}

        # Either custom or default delete hooks that control how objects are
        # deleted
        self.delete_hooks = delete_hooks() if delete_hooks \
            else BaseDeleteHooks()

        # Maximum number of objects to list in the item list on the dashboard
        self.page_size = page_size or DEFAULT_PAGE_SIZE

    def register(self, model, parent=None, form=None, filters=None,
                 creatable=True):
        """Registers the given model as a manageable entity, using the given
        form to create and edit instances."""
        name = model.kind()

        assert name not in self.names,\
            'Model %s already registered with the admin.' % name
        if parent is not None:
            assert parent.kind() in self.names,\
                'Parent model %s must be registered before child model %s' % (
                parent.kind(), name)

        # Create a form dynamically, if we aren't given one
        if form is None:
            form = utils.form_for_model(model)

        # Automtically use a prefix with the form, so it's (hopefully) safe to
        # use multiple forms on the same page
        form = partial(form, prefix=name)

        # Store the model and the form
        self.names.add(name)
        self.models[name] = model
        self.forms[name] = form
        self.filters[name] = filters or []
        self.creatable[name] = creatable

        if parent is not None:
            self.parents[parent.kind()].append(name)
            self.children[name] = parent.kind()

    def model_for(self, kind):
        return self.models[kind]

    def form_for(self, kind):
        return self.forms[kind]

    def filters_for(self, kind):
        return self.filters[kind]

    def item_url(self, item):
        return '%s/%s/%s/' % (self.prefix, item.kind(), item.key())

    def children_for(self, kind):
        return self.parents.get(kind)

    def item_json(self, item):
        """Returns a JSON-serializable dict of the important parts of the
        given item."""
        return { 'str': unicode(item),
                 'url': self.item_url(item),
                 'key': str(item.key()) }

    @property
    def manageables(self):
        """Returns a tuple, sorted by name, of (name, form instance) for each
        manageable entity."""
        return sorted((n, self.forms[n]()) for n in self.names)

    # @property
    # def parents(self):
    #     """Returns a dict mapping parent names to child's singular names for
    #     relationships we know how to manage (via our subcollections)."""
    #     return dict((parent, child.rstrip('s')) for (parent, child, view)
    #                 in self.subcollections)

    # @property
    # def children(self):
    #     """Returns a dict mapping child's singular names to parent names for
    #     relationships we know how to manage (via our subcollections)."""
    #     return dict((child.rstrip('s'), parent) for (parent, child, view)
    #                 in self.subcollections)

    def delete(self, kind, key):
        """Deletes the object of the given kind with the given key.  Lets this
        admin's delete hooks, which should return a list of keys, figure out
        which objects to actually delete."""
        hook = getattr(self.delete_hooks, 'delete_%s' % kind.lower())
        keys = hook(key)
        db.delete(keys)

    def post_save(self, obj):
        """Called after putting the given object in the datastore. By default,
        this simply kicks off indexing for searchable objects."""
        pass

    def post_image_update(self, obj):
        """Called after creating/updating/deleting an image on an object.
        Might be useful to, say, clear caches or something."""
        pass

    def extra_context(self, obj):
        """Called by each admin view to augment the template context for the
        given object.  Subclasses can override this method to augment the
        context for specific objects."""
        return {}

    def handler(self, request_handler):
        """Derives an eponymous sublcass from the given request handler (a
        webapp.RequestHandler class), adding an 'admin' attribute pointing to
        this SimpleAdmin object and prefilling the handler's special CONTEXT
        attribute with 'admin' and 'users' properties to make available to
        every template.

        Useful when specifying the handlers when initializing the
        WSGIApplication, because you don't have control over class
        initialization when using webapp's RequestHandlers."""

        # The default context that will be provided to every admin view
        # contains the admin site itself and the App Engine users module, as
        # well as whatever extra context is defined on the individual
        # view. See KIHandler.render.
        CONTEXT = { 'admin': self,
                    'users': users }
        CONTEXT.update(getattr(request_handler, 'CONTEXT', {}))

        # Attributes for the derived class we're creating
        attrs = {
            'admin': self,
            'CONTEXT': CONTEXT,
        }

        # Create a class with the same name that's a subclass of the given
        # RequestHandler class
        return type(request_handler.__name__, (request_handler,), attrs)

    def run(self, debug=True, extra_urls=None):
        """Creates and runs the WSGIApplication for this admin site."""

        # A shortcut for generating a URL pattern tuple for this particular
        # admin site.
        def url(pattern, view):
            # Automatically surrounds the given pattern with the prefix from
            # which the admin is being served Also ensures that the given view
            # has an admin property added to it pointing to this admin
            # instance.
            return ('%s/%s' % (self.prefix, pattern.lstrip('/')),
                    self.handler(view))

        # The URL patterns below restrict themselves to matching the known set
        # of models
        kinds = '|'.join(self.names)

        # The base set of URLs.  Any extra URLs come at the beginning, and may
        # be clobbered by those generated for the admin site.
        if extra_urls is None:
            urls = []
        else:
            urls = [url(pattern, view) for pattern, view in extra_urls]

        # Standard admin URLs.
        urls += [
            url(r'', views.Dashboard),
            url(r'(%s)/' % kinds, views.Collection),
            url(r'(%s)/([\w-]+)/' % kinds, views.Item),
            # Webapp framework doesn't unquote URLs before matching them, so
            # we have to urlquote our patterns. %2C is a comma.
            url(r'(%s)/([\w-]+%%2C\w[\w%%2C-]+)/' % kinds, views.BulkItems),
            ]

        # Add URL patterns for filters
        for kind, filters in self.filters.items():
            if not filters: continue
            pattern = 'filter/(%s)/(%s)/' % (kind, '|'.join(filters))
            urls.append(url(pattern, views.ItemFilter))

        if self.parents:
            def parenturl((parent, children)):
                pattern = r'%s/([\w-]+)/%s/' % (parent, '|'.join(children))
                return url(pattern, views.Subcollection)
            urls.extend(map(parenturl, self.parents.iteritems()))

        # Create and run the application
        application = webapp.WSGIApplication(urls, debug=debug)
        wsgiref.handlers.CGIHandler().run(application)


class BaseDeleteHooks(object):
    """Provides a place to store hooks to be called to delete objects of a
    certain kind. Each hook should be a method named delete_{kind} and should
    return a list of keys to be deleted.

    The default delete hook just returns the key that was given (ie, just
    deletes the given object)."""

    def __getattr__(self, name):
        return self.default_hook

    def default_hook(self, key):
        """By default, just delete the given object."""
        return [key]
