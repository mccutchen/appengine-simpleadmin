"""Custom form fields and widgets aimed for use in the admin backend."""

import logging
import settings

from google.appengine.ext import db
from google.appengine.ext import blobstore
from google.appengine.api import images

from django import forms


##############################################################################
# Widgets
##############################################################################

class ReferencePropertyInput(forms.TextInput):
    """Renders a ReferenceProperty as its own string representation followed
    by a text input containing its key.  This allows you to set a
    ReferenceProperty knowing only its datastore key.  Useful, e.g., when a
    ReferenceProperty might have many thousands of possible choices, which
    would be extremely unwieldy with the default ModelChoiceField's select
    widget."""

    def render(self, name, value, attrs):
        base = super(self.__class__, self).render(name, value, attrs)
        entity = db.get(value) if value else None
        template = u"""
<span class="ReferenceProperty">
    <span class="entity">%(entity)s</span>
    <span class="key">Key: %(key)s</span>
</span>"""
        return template % dict(entity=entity, key=base)


class CSVTextarea(forms.Textarea):
    """A widget that renders a list of values as comma-separated strings in a
    textarea."""

    def value_from_datadict(self, data, files, name):
        value = data.get(name, None)
        return [x.strip() for x in value.split(',')] if value else []

    def render(self, name, value, attrs):
        """This receives the value as a newline-separated string."""
        csv = value.replace('\n', ', ') if value else ''
        return super(CSVTextarea, self).render(name, csv, attrs)


class KeyListPropertyInput(forms.Textarea):
    """A widget that renders a list of datastore keys as a <ul> containing the
    string representation of each entity in the key list, followed by a
    <textarea> containing the keys as comma-separated values."""

    def value_from_datadict(self, data, files, name):
        """The list of keys should be submitted as a comma-separated list of
        datastore key strings.  We just extract them from the data and return
        a list of strings, which must be changed into a list of db.Key objects
        by this widget's field's clean() method."""
        csv = data.get(name, None)
        if csv:
            return [key.strip() for key in csv.split(',')]
        return None

    def render(self, name, value, attrs):
        if value:
            csv = ', '.join(map(str, value))
            try:
                entities = db.get(value)
            except Exception, e:
                entities = []
        else:
            csv = ''
            entities = ['<i>None</i>']

        base = super(self.__class__, self).render(name, csv, attrs)
        template = u"""
<span class="KeyListPropertyInput">
    <ul class="entities">
        %(items)s
    </ul>
    <span class="keys">
        Comma-separated keys:<br>
        %(base)s
    </span>
</span>
"""
        item_template = u"""\t<li>%s</li>"""
        items = '\n'.join(item_template % entity for entity in entities)
        return template % dict(base=base, items=items)


class CoreImageInput(forms.FileInput):
    """A widget that will render a field containing the key of an image on the
    imaging server as a thumbnail of that image and an upload button.

    TODO: It would probably be good for this to support deleting of images,
    but I'm not sure at the moment the best way to handle that."""

    def __init__(self, size=None, **kwargs):
        super(CoreImageInput, self).__init__(**kwargs)
        self.size = size if size is not None else 200

    def render(self, name, value, attrs):
        # Get the default rendering of the widget
        base = super(self.__class__, self).render(name, None, attrs=attrs)

        # Wrap it in a special <span> so that it can be replaced by an Ajax
        # uploader, if necessary, with an id of "uploader:fieldname"
        wrapper = '<span id="uploader:%s" class="">%s</span>'
        name = name.split('-')[-1]
        base = wrapper % (name, base)

        # If we've already got an image, display it above the widget, along
        # with a button to delete it
        if value:
            template = """
<div class="image field">
    <img src="%(src)s" class="preview">
    <!--<a href="%(src)s" class="delete" title="Delete image?">&#10008;</a>-->
    %(widget)s
</div>"""
            src = 'http://%s/thumbs/%s/%s/%s' % (
                settings.APPS['keyimages'], self.size, self.size, value)
            return template % dict(src=src, widget=base)

        return base


class BlobImageRefInput(forms.TextInput):
    """Renders an image_ref field (as used with the HasBlobImages mixin) as a
    thumbnail.  Provides read-only access, at the moment."""

    def render(self, name, value, attrs):
        attrs['type'] = 'hidden'

        # If we have a value, it should be either a BlobInfo object (the
        # normal case) or the string key of a BlobInfo object (if we're
        # re-rendering a form after a validation error)
        if value:
            key = value if isinstance(value, basestring) else str(value.key())
            base = super(BlobImageRefInput, self).render(name, key, attrs)
            url = images.get_serving_url(key, size=300)

        # Otherwise, we just render the widget with a placeholder image.
        else:
            base = super(BlobImageRefInput, self).render(name, value, attrs)
            url = '/static/admin/img/placeholder.png'

        template = u"""
<span class="BlobImageRef" id="BlobImageRef-%(name)s">
    <span class="image"><img src="%(url)s"></span>
    %(base)s
    <input type="button" value="Upload Image" id="BlobImageRef-%(name)s-btn">
</span>"""
        return template % dict(base=base, url=url, name=name)


##############################################################################
# Fields
##############################################################################

class KeyListPropertyField(forms.CharField):
    """A custom form field for handling a ListProperty containing Key
    references. Renders itself using the KeyListPropertyInput widget.

    That widget will return a list of datastore key strings as its value, so
    the clean() method needs to turn those strings into actual db.Key objects
    to be stored in this field's corresponding ListProperty."""

    widget = KeyListPropertyInput

    def clean(self, value):
        """Try to transform each string in the given value, which should be a
        list of datastore keys, into actual db.Key objects."""
        if value:
            try:
                return map(db.Key, filter(None, value))
            except Exception, e:
                raise forms.ValidationError(unicode(e))
        return value


class BlobImageRefField(forms.CharField):
    """A form field representing an image_ref_url field (as used with the
    HasBlobImages mixin). Automatically uses the appropriate widget to display
    the image as a thumbnail."""

    widget = BlobImageRefInput

    def clean(self, value):
        """If we get a value, it should be a datastore key as a string. So we
        convert it to a real key."""
        if value:
            try:
                return blobstore.BlobKey(value)
            except Exception, e:
                raise forms.ValidationError(unicode(e))
        return value


class CSVField(forms.CharField):
    """A custom form field for handling a ListProperty containing
    strings. TODO: Take custom converter callback to allow string values to be
    converted to other types."""

    widget = CSVTextarea(attrs={'rows':2})

    def __init__(self, *args, **kwargs):
        kwargs.update({'help_text': 'Separated by commas'})
        super(CSVField, self).__init__(*args, **kwargs)

    def clean(self, value):
        return value
