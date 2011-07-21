import inspect
import logging
import os
import sys
from collections import defaultdict
from functools import partial
import wsgiref.handlers

from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import users

from ext import jinja2

import views
import utils
import templateutils


# Defaults
DEFAULT_PREFIX = '/admin'
DEFAULT_STATIC_PREFIX = '/static/admin'
DEFAULT_PAGE_SIZE = 20
DEFAULT_SITE_TITLE = 'SimpleAdmin'

# Where are we located?
ADMIN_ROOT = os.path.dirname(__file__)
ADMIN_TEMPLATE_DIR = os.path.join(ADMIN_ROOT, 'templates')


class SimpleAdmin(object):
    """Keeps track of the manageable entities (models and their corresponding
    forms) for a site.

    Subclasses might want to override extra_context method to control the
    context given to the templates for each kind of object.  The delete_hooks,
    if given, should be a subclass of BaseDeleteHooks, and can be used to
    control how objects are deleted."""

    def __init__(self, prefix=None, static_prefix=None, extra_urls=None,
                 page_size=None, site_title=None, template_dir=None):

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

        self.extra_urls = extra_urls or []
        self.site_title = site_title or DEFAULT_SITE_TITLE
        self.template_dir = template_dir

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

        # Maximum number of objects to list in the item list on the dashboard
        self.page_size = page_size or DEFAULT_PAGE_SIZE

        # Create a Jinja environment to use when rendering templates
        self.jinja_env = self.create_jinja_env()

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
        if isinstance(item, db.Model):
            return '%s/%s/%s/' % (self.prefix, item.kind(), item.key())
        else:
            kind = item.kind() if isinstance(item, type) else item
            return '%s/%s/' % (self.prefix, kind)

    def children_for(self, kind):
        return self.parents.get(kind)

    def item_json(self, item):
        """Returns a JSON-serializable dict of the important parts of the
        given item.
        """
        return { 'str': unicode(item),
                 'url': self.item_url(item),
                 'key': str(item.key()) }

    @property
    def manageables(self):
        """Returns a list, sorted by name, of (name, form instance) tuples
        for each manageable entity.
        """
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

    def get_children(self, obj):
        child_kinds = self.children_for(obj.kind())
        children = {}
        for kind in child_kinds:
            lower_name = kind.lower()
            possible_names = [
                '%ss' % lower_name,
                '%s_set' % lower_name,
                'get_%ss' % lower_name]
            for name in possible_names:
                try:
                    getter = getattr(obj, name)
                except AttributeError:
                    continue
                else:
                    children[kind] = getter() if callable(getter) else getter
        return children

    ##########################################################################
    # Hooks
    ##########################################################################
    def pre_save(self, obj):
        """Called before putting the given object in the datastore. The object
        might not have a key, if it's new.
        """
        pass

    def post_save(self, obj):
        """Called after putting the given object in the datastore."""
        pass

    def pre_delete(self, key):
        """Called before deleting the object with the given key. Only the key
        is given, because we might not have the full object at the time.
        """
        pass

    def post_delete(self, key):
        """Called after deleting the object with the given key."""
        pass

    def extra_context(self, obj):
        """Called by each admin view to augment the template context for the
        given object.  Subclasses can override this method to augment the
        context for specific objects.
        """
        return {}

    def wrap_handler(self, request_handler):
        """Derives an eponymous sublcass from the given request handler (a
        webapp.RequestHandler class), adding an 'admin' attribute pointing to
        this SimpleAdmin object and prefilling the handler's special CONTEXT
        attribute with 'admin' and 'users' properties to make available to
        every template.

        Useful when specifying the handlers when initializing the
        WSGIApplication, because you don't have control over class
        initialization when using webapp's RequestHandlers.
        """

        # The default context that will be provided to every admin view
        # contains the admin site itself and the App Engine users module, as
        # well as whatever extra context is defined on the individual
        # view. See AdminHandler.render.

        extra_context = dict(request_handler.extra_context)
        extra_context.update({ 'admin': self,
                               'users': users })

        # Attributes for the derived class we're creating
        attrs = {
            'admin': self,
            'extra_context': extra_context,
        }

        # Create a class with the same name that's a subclass of the given
        # RequestHandler class
        return type(request_handler.__name__, (request_handler,), attrs)

    def create_jinja_env(self):
        """Creates and returns the Jinja Environment object we will use to
        render all templates. The template directories are a combination of
        the user-supplied template_dir and the base admin template directory.
        """
        template_dirs = [ADMIN_TEMPLATE_DIR]
        if self.template_dir:
            template_dirs[0:0] = [self.template_dir]

        env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(template_dirs),
            undefined=jinja2.Undefined,
            autoescape=True)

        for name, fn in inspect.getmembers(templateutils, callable):
            env.filters[name] = fn

        # Enabling this monkeypatch can help track down hard to find errors
        # that crop up during template rendering (since Jinja's own error
        # reporting is so unhelpful on AppEngine).
        real_handle_exception = env.handle_exception
        def handle_exception(self, *args, **kwargs):
            import logging, traceback
            logging.error('Template exception:\n%s', traceback.format_exc())
            real_handle_exception(self, *args, **kwargs)
        env.handle_exception = handle_exception

        return env

    def render_to_string(self, path, context=None):
        """Renders the template at the given path, which can be a single path
        or a list of paths to try, with the given context and returns the
        result.
        """
        template = self.jinja_env.get_or_select_template(path)
        return template.render(context or {})

    def create_wsgi_app(self, debug=False):
        """Creates and returns a WSGIApplication for this admin site."""

        # A shortcut for generating a URL pattern tuple for this particular
        # admin site.
        def url(pattern, handler):
            # The prefix will have a trailing slash, so the pattern does not
            # need a leading one. Also, the prefix's trailing slash should be
            # optional if the pattern is empty.
            pattern = pattern.lstrip('/') + ('' if pattern else '?')
            # Wrap the given handler with a derived subclass that will have
            # this admin instance and some default extra context for templates
            # added to it.
            handler = self.wrap_handler(handler)
            return ('%s/%s' % (self.prefix, pattern), handler)

        # The URL patterns below restrict themselves to matching the known set
        # of models
        kinds = '|'.join(self.names)

        # The base set of URLs.  Any extra URLs come at the beginning, and may
        # be clobbered by those generated for the admin site.
        urls = [url(pattern, view) for pattern, view in self.extra_urls]

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

        return webapp.WSGIApplication(urls, debug=debug)

    def run(self, debug=False):
        """A shortcut to easily run this admin site as a WSGIApplication,
        useful if it does not need to be wrapped in any middleware.
        """
        app = self.create_wsgi_app(debug=debug)
        wsgiref.handlers.CGIHandler().run(app)
