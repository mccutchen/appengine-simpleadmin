import logging
import os

from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template

from django.utils import simplejson as json

from utils import Http404, LazyEncoder, order_entities


class AdminHandler(webapp.RequestHandler):

    extra_context = {}

    def render(self, paths, context=None, status=200,
               content_type='text/html'):
        """Renders the given template with the given context into the
        response, setting the status code and content type. Paths can be a
        single template path or a list of paths, in which case the first to be
        found will be used.

        Any extra_context defined on the handler will be added to the given
        context dict before rendering.
        """
        # Figure out what the final context to pass to the template should be,
        # based on the given context and the class's extra_context attribute
        final_context = dict(self.extra_context)
        final_context.update(context or {})
        content = self.admin.render_to_string(paths, final_context)
        return self.respond(content, status, content_type)

    def respond(self, content, status=200, content_type='text/html'):
        """Shortcut method for sending the given content back to the client
        with the given status code and content type.
        """
        self.response.set_status(status)
        self.response.headers['Content-Type'] = content_type
        self.response.out.write(content)

    def respond_json(self, stuff, status=200,
                     content_type='application/json'):
        """Shortcut for JSON-encoding the given stuff, which can be anything
        that is JSON-encodable, and sending it back to the client.
        """
        self.respond(json.dumps(stuff, cls=LazyEncoder), status, content_type)

    def handle_exception(self, exception, debug_mode):
        """Custom exception handler that knows how to handle raised Http404
        exceptions."""
        if isinstance(exception, Http404):
            self.error(404)
            self.response.out.write('Object not found.')
            return
        logging.error('Admin exception caught: %r' % exception)
        return super(AdminHandler, self).handle_exception(
            exception, debug_mode)

    def paginate(self, query, offset):
        """Tries to intelligently paginate through all the items of a
        particular time.  See this article for an explanation:
        http://code.google.com/appengine/articles/paging.html"""
        next = offset or ''
        limit = self.admin.page_size

        items = query.order('__key__')
        count = items.count()

        # If we have an offset, filter on it so that we only get items that
        # come after it
        if offset:
            items = items.filter('__key__ >=', db.Key(offset))

        # Fetch one more item than we want.  If we get limit+1 results, that
        # means there's at least one more page of results.
        items = items.fetch(limit + 1)
        if len(items) == limit + 1:
            next = str(items[-1].key())
            items = items[:limit]

        # Return a dict with all the data needed for pagination
        return { 'items': items,
                 'next': next,
                 'count': count }


class ItemOrderHandler(AdminHandler):
    """A request handler that attempts to provide a generic way to handle the
    updating of the order of a set of objects, assuming that those objects are
    ordered by a specific IntegerProperty field.

    Expects to receive POSTs containing an 'order' param that is a comma
    separated list of the keys of the items in the desired order.

    Subclasses MUST implement the get_parent and get_objects methods."""

    # The name of the field on which the items are ordered.  Must be an
    # IntegerProperty field.
    order_by_field = None

    def post(self, *args):
        """Updates the order of the objects whose keys are POSTed to this
        handler in the 'order' param as comma-separated list in the desired
        final order.  Does the updating of the objects by setting the field
        specified in order_by_field, which should be an IntegerProperty, to an
        appropriate value given those objects' position in the 'order'
        param."""
        parent = self.get_parent(*args)
        objs = self.get_objects(parent)
        # The desired order should be given as a comma-separated list of
        # datastore key strings
        order = self.request.POST.get('order', '').split(',')
        # Use our utility function to do the ordering
        order_entities(objs, self.order_by_field, order)
        self.respond_json('OK')

    def get_parent(self, *args):
        """Should return the parent object, if any, based on the arguments
        passed to the request handler. May return None if no parent is
        needed."""
        raise NotImplemented

    def get_objects(self, parent):
        """Should return an iterable over the objects associated with the
        given parent that are kept in order."""
        raise NotImplemented
