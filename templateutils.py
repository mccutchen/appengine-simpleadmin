import re
from google.appengine.ext.webapp.template import create_template_register

register = create_template_register()

@register.filter
def parents(obj):
    """A Jinja template filter that returns an iterable over each parent in
    the given object's datastore hierarchy."""
    parents = []
    parent = obj.parent()
    while parent:
        parents.append(parent)
        parent = parent.parent()
    return reversed(parents)

@register.filter
def humanize(s):
    """Breaks CamelCase or underscore_separated strings into friendly strings
    with spaces between the words."""
    pat = r'([A-Z][A-Z][a-z])|([a-z][A-Z])'
    sub = lambda m: m.group()[:1] + " " + m.group()[1:]
    return re.sub(pat, sub, s).replace('_', ' ')

@register.filter
def f(func, arg):
    return func(arg)