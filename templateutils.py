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
def meth(obj, method_name):
    """Returns the method with the given name from the given object. Designed
    to be used to pull methods off of an object without having Django's dumb
    template system call them. See also the `call` filter, below.
    """
    return getattr(obj, method_name)

@register.filter
def call(f, arg):
    """Calls the given callable with the given argument. Designed to be used
    in conjunction with the `meth` filter above to call single-arg methods on
    objects in template contexts.

    Usage example:

        {{ obj|meth:'method_name'|call:'argument' }}

    translates to

        obj.method_name('argument')

    This is ugly and dumb, I know.
    """
    return f(arg)
