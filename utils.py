import logging

from google.appengine.ext import db
from google.appengine.ext.db import djangoforms

from django.utils import simplejson as json
#from django.utils.functional import Promise
#from django.utils.encoding import force_unicode


class Http404(Exception):
    """A custom exception that can be raised to exit a view method early with
    an HTTP 404 error response."""
    pass


class LazyEncoder(json.JSONEncoder):
    """Correctly serializes "lazy" Django objects, like forms' ErrorDicts.
    From http://docs.djangoproject.com/en/dev/topics/serialization/#id2"""
    def default(self, obj):
        if isinstance(obj, Promise):
            return force_unicode(obj)
        return super(LazyEncoder, self).default(obj)


def entity_or_404(key):
    """Retrieves the entity with the given key from the datastore, or raises
    an HTTP 404 error if the object does not exist."""
    try:
        obj = db.get(key)
        if obj:
            return obj
    except:
        pass
    raise Http404('Object not found')

def form_for_model(model):
    """Creates a ModelForm class for the given model class."""
    meta = type('Meta', (), { "model": model, })
    name = '%sForm' % model.__name__
    bases = (djangoforms.ModelForm,)
    attrs = { "Meta": meta }
    return type(name, bases, attrs)

def required_props(forminstance):
    """Takes an instance of a ModelForm and returns a dictionary mapping the
    required fields for the associated model to their values as extracted from
    the form's cleaned data.  Assumes the form is bound and valid."""
    props = forminstance._meta.model.properties()
    data = forminstance.cleaned_data
    required_data = dict(
        (name, prop.make_value_from_form(data[name]))
        for name, prop in props.items() if prop.required)

def order_entities(entities, field, order, commit=True):
    """Updates the specified field, which should be the name of an
    IntegerField, on the given entities based on the order in which those
    entities' datastore keys appear in the given order list, which should be a
    list of key strings.

    If commit is True, saves the entities back to the datastore."""
    # Update the appropriate field on each entity based on where its key
    # appears in the given order.
    keyfunc = lambda ent: str(ent.key())
    for entity, pos in calculate_positions(entities, order, keyfunc):
        setattr(entity, field, pos)

    if commit:
        db.put(entities)

    return entities

def calculate_positions(items, order, keyfunc=None, pad=10):
    """Takes a list of items in arbitrary order and a list specifying the
    order in which those items should appear and returns a list of two-tuples
    of (item, position) where position is an int specifying the new position
    the item should have.  If an item does not appear in the order list, it
    will be positioned at the end in the order in which it appears in the
    items list.

    If keyfunc is given, it should be a function that takes an item from the
    list and returns the key that is expected to be in the order list.

    The pad arg is a multiple that determines how much space should be
    left between calculated positions, if any, with padding=1 leaving no
    space.

    Designed to work with datastore entities that have some sort of
    db.IntegerProperty defining their order.

    Example:

        >>> items = ['d', 'b', 'a', 'g', 'c']
        >>> order = ['a', 'b', 'c', 'd']
        >>> list(calculate_positions(items, order))
        [('d', 30), ('b', 10), ('a', 0), ('g', 70), ('c', 20)]
    """
    # If no keyfunc is provided, just use the identity function
    if keyfunc is None or not callable(keyfunc):
        keyfunc = lambda item: item

    total = len(order)
    for i, item in enumerate(items):
        key = keyfunc(item)
        yield (item, (order.index(key) if key in order else total + i) * pad)
