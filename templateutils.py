import re
from google.appengine.ext import db


def key(obj):
    """Given a db.Key or db.Model, returns a db.Key."""
    return obj.key() if isinstance(obj, db.Model) else obj

def id(obj):
    """Given a db.Key or db.Model, returns an int ID or string name."""
    return key(obj).id_or_name()

def parents(obj):
    """A Jinja template filter that returns an iterable over each parent in
    the given object's datastore hierarchy.
    """
    parents = []
    parent = obj.parent()
    while parent:
        parents.append(parent)
        parent = parent.parent()
    return reversed(parents)

def humanize(s):
    """Breaks CamelCase or underscore_separated strings into friendly strings
    with spaces between the words.
    """
    pat = r'([A-Z][A-Z][a-z])|([a-z][A-Z])'
    sub = lambda m: m.group()[:1] + " " + m.group()[1:]
    return re.sub(pat, sub, s).replace('_', ' ')
