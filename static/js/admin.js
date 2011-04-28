Clientcide.setAssetLocation("/static/assets");

// Make sure we have the KI namespace
var KI = KI || {};

// A namespace for stuff specific to the backend
KI.Backend = {
    uploaders: $A([])
};

KI.Backend.Pager = function(list, url, params) {
    var kind = list.get('class');
    url = url || (kind + '/');
    params = params || {};

    var controls = list.getParent().getElement('p.controls');
    var next = controls.getElement('a.next');

    next.addEvent('click', function(e) {
        e.stop();
        var offset = this.get('offset');
        if (offset && offset != '')
            getPage(this.get('offset'));
    });

    var spinner = new Spinner(list, {
        img: false,
        message: 'Getting ' + kind + 's...',
        destroyOnHide: false
    });

    var req = new Request.JSON({
        url: url,

        onRequest: function() { spinner.show(true); },
        onComplete: function() { spinner.hide(false); },

        onSuccess: function(data) {
            list.getChildren('li').dispose();
            data.items.each(function(item) {
                addItemToList(item, list, true);
            });
            controls.getElement('span.count>span').set('html', data.count);
            next.set('offset', data.next);
            if (data.next && data.next != '')
                next.removeClass('disabled');
            else
                next.addClass('disabled');
        },

        onFailure: function(xhr) {
            console.error('Unable to load ' + kind + ':\n' + xhr.responseText);
        }
    });

    function getPage(offset) {
        offset = offset || '';
        params['offset'] = offset;
        req.get(params);
    }
    getPage();
};

// Generic sortable support
KI.Backend.Sortable = function(list) {
    // If we got more than one argument, make the rest of them sortable
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments);
        arguments.callee.apply(null, args.slice(1));
    }

    // Make sure we have something to sort
    if (!list) return;

    list.addClass('sortable');

    // The list should be wrapped in a form with an appropriate action,
    // from which we can build a request object to use
    var form = list.getParent('form');
    var req = new Request.JSON({
        url: form.action,
        onSuccess: function(s) {
            console.log('Successful request: %s', s);
        },
        onFailure: function(xhr) {
            console.log('Failed request: %o', xhr);
        }
    });

    // Creates an ordered, comma-separated list of the keys of the items in
    // the list, suitable for giving to the request handler
    function getOrder() {
        return list.getChildren('li').map(function(el) {
            return el.id;
        }).join(',');
    };

    // Get the initial sort order, so we can avoid unnecessary requests
    var order = getOrder();

    // Create a new MooTools/Clientcide Sortables object to do the hard work
    var sortables = new Sortables(list, {
        handle: '.handle',
        constrain: true,
        clone: true,
        revert: true,
        opacity: .7,

        onStart: function(element, clone) {
            clone.addClass('dragging');
        },
        onComplete: function(element, clone) {
            var newOrder = getOrder();
            if (newOrder != order) {
                console.log('New order: %s', newOrder);
                req.post({'order': newOrder});
                order = newOrder;
            } else {
                console.log('Same order: %s, %s', newOrder, order);
            }
        }
    });
    console.log('Created sortable: ', sortables);
    console.log('On list: ', list);
};

// // Set up the tabs
// window.addEvent('domready', function() {
//     new TabSwapper({
//         selectedClass: 'active',
//         deselectedClass: '',
//         tabs: $$('#tabs li'),
//         clickers: $$('#tabs li'),
//         sections: $$('div.panel'),
//         /*remember what the last tab the user clicked was*/
//         cookieName: 'key-premium-management-tab',
//         /*use transitions to fade across*/
//         smooth: true,
//         smoothSize: true
//     });
// });
// 
// // Separate tab handler for child-tab pages
// window.addEvent('domready', function() {
//     new TabSwapper({
//         selectedClass: 'active',
//         deselectedClass: '',
//         tabs: $$('#child-tabs li'),
//         clickers: $$('#child-tabs li'),
//         sections: $$('div.child-panel')
//     });
// });

// Load item lists dynamically
window.addEvent('domready', function() {
    $$('div.panel>div.items>form>ul').each(function(list) {
        //KI.Backend.Pager(list);
    });
});

// Handle filters
window.addEvent('domready', function() {
    $$('div.panel>div.items>div.filters>h3').addEvent('click', function(e) {
        this.getParent().toggleClass('hidden');
    });

    $$('div.panel>div.items>div.filters form').addEvent('submit', function(e) {
        e.stop();
        var list = this.getParent('div.items').getElement('form.bulk>ul');
        var url = this.action;
        var q = this['q'].value;
        KI.Backend.Pager(list, url, { q: q });
    });
});


// Handle new items via Ajax
window.addEvent('domready', function() {
    $$('div.new-item>form').each(function(form) {
        var itemList = form.getParent().
            getPrevious('div.items').
            getFirst('form').
            getFirst('ul');
        KI.Backend.uploaders.extend(addFileUploaders(form));
        addNewItemHandler(form, itemList, true);
    });
});

// Handle new items from the parent item's page
window.addEvent('domready', function() {
    $$('div.new.child.item>form').each(function(form) {
        var itemKind = form.id.replace(/-form$/, '');
        var itemList = $(itemKind + '-itemList');
        KI.Backend.uploaders.extend(addFileUploaders(form));
        addNewItemHandler(form, itemList, false);
    });
});

// Handle deletion of individual items on the item's page
window.addEvent('domready', function() {
    $$('div.item>form').each(function(form) {
        var deleteButton = form.getElement('a.delete.item');
        if (!deleteButton) return;
        deleteButton.addEvent('click', function(e) {
            e.stop();

            if (!confirm('Are you sure you want to delete this item?'))
                return false;

            return new Request({
                url: form.action,
                method: 'delete',
                emulation: false,
                onSuccess: function(txt, xml) {
                    window.location = '/backend/';
                },
                onFailure: function(xhr) {
                    alert('Unable to delete: ' + xhr.responseText);
                }
            }).send();
        });
    });
});

// Show and hide the "new child item" form dynamically
window.addEvent('domready', function() {
    $$('div.child>p.add').each(function(el) {
        var initialValue = el.get('text');
        var newItemContainer = el.getNext('div.new');
        el.addEvent('click', function() {
            var text = (el.get('text') == initialValue) ?
                'Finished' : initialValue;
            el.set('text', text);
            newItemContainer.toggle();
            new Fx.Scroll(window).toElement(newItemContainer);
        });
    });
});

// Handle bulk deleting from the dashboard
window.addEvent('domready', function() {
    $$('div.items form.bulk').each(function(form) {
        form.addEvent('submit', function(e) {
            e.stop();
            var toDelete = [], toDeleteKeys = [];
            form.getElements('input').each(function(el) {
                if (el.checked) {
                    toDelete.push(el);
                    toDeleteKeys.push(el.value);
                }
            });

            new Request({
                url: form.action + toDeleteKeys.join(',') + '/',
                method: 'delete',
                emulation: false,
                onRequest: function() {
                    if(!confirm('Are you sure you want to delete these items?'))
                        this.cancel();
                },
                onSuccess: function(txt, xml) {
                    toDelete.each(function(el) {
                        el.getParent('li').dispose();
                    });
                    resetForm(form);
                },
                onFailure: function(xhr) {
                    alert('Could not delete items.');
                }
            }).send();

            resetForm(form);
        });
    });
});

// Handle deleting images from individual image fields
window.addEvent('domready', function() {
    $$('div.image.field a.delete').addEvent('click', function(e) {
        e.stop();
        var link = this;
        new Request({
            url: link.href,
            method: 'delete',
            emulation: false,

            onRequest: function() {
                if (!confirm('Are you sure you want to delete this image?'))
                    this.cancel();
            },
            onSuccess: function(txt, xml) {
                link.getPrevious('img').destroy();
                link.destroy();
            },
            onFailure: function(xhr) {
                alert('Could not delete image.\n\n' + xhr.responseText);
            }
        }).send();
    });
});

// Create plupload uploaders
window.addEvent('domready', function() {

    // Easy negative indexing, a la Python
    function nth(xs, n) { return xs.slice(n)[0]; }

    // Pull the current item's datastore key out of the URL
    var key = nth(window.location.pathname.split('/'), -2);

    $$('.BlobImageRef').each(function(el) {
        if (el.getParent('div.new.child.item')) {
            el.getParent('tr').destroy();
        } else {
            var field = nth(el.id.split('-'), -1);
            new Request.JSON({
                url: '/admin/blobs/pre/',
                onSuccess: function(resp) {
                    preparePlupload(resp.url, key, field, el);
                },
                onFailure: function() {
                    alert('Could not get an upload URL for ' + field);
                }
            }).get();
        }
    });
});


// Initializes a plupload uploader for a form field. To do this, we need the
// special upload URL, the entity's key, the name of the image field on the
// entity, and the HTML element containing the field on the page.
function preparePlupload(url, key, field, parent) {
    // Create plupload object and link to form button
    var button = parent.getElement('input[type="button"]');
    var uploader = new plupload.Uploader({
        runtimes : 'html5',
        browse_button : button.id,
        container: parent.id,
        multipart:true,
        multi_selection:false,
        url : url,
        file_data_name:'file',
        multipart_params: { key: key, field: field },
        filters : [
            {title : "Image files", extensions : "jpg,jpeg,gif,png"}
        ]
    });

    uploader.bind('QueueChanged', function(up, file) {
        uploader.start();
    });

    uploader.bind('FileUploaded', function(up, file, response) {
        var data = JSON.decode(response.response);
        var key = data.message;

        // Pull apart the old image's URL and replace the key for the old
        // image with the key for the new one.
        var img = parent.getElement('img');
        var parts = img.src.split('/');
        var oldKey = parts.pop();
        parts.push(key);

        console.log('Uploaded new image: %s (old: %s)', key, oldKey);
        console.log('Old src:', img.src);

        // Update the image and the form field with their new values
        img.src = parts.join('/');
        console.log('New src:', img.src);
        parent.getElement('input[type="hidden"]').value = key;
    });

    uploader.bind('Error', function(up, err) {
        console.log('Plupload error:', err);
        if (err.code == -700) {
            alert('Invalid file extension');
        }
    });

    uploader.init();
}

function addFormHandler(form, options) {
    $(form).addEvent('submit', function(e) {
        e.stop();
        this.set('send', options);
        this.send();
    });
}

function addNewItemHandler(form, itemList, deletable) {
    // Needed for error reporting
    var prefix = $(form).id.replace(/-form$/, '');
    var getField = function(name) {
        return $(form[name] || form[prefix + '-' + name]);
    };

    var spinner = new Spinner(form, {
        img: false,
        message: 'Sending ' + prefix + ' data to server...',
        destroyOnHide: true
    });

    // Gather up the Ajax file uploaders that are a part of this form, for use
    // after the form has been submitted
    var uploadFields = form.getElements('td>.uploader');
    var uploaders = KI.Backend.uploaders.filter(function(uploader) {
        return uploadFields.contains(uploader._button);
    });

    function doUploads(url) {
        // Submits the file uploaders for this form to a URL based on the
        // response after the new item has been created.
        uploaders.filter(function(uploader) {
            return uploader._input.value;
        }).each(function(uploader) {
            var action = url + 'img/' + uploader._settings.name + '/';
            uploader._settings.action = action;
            console.log('Submitting file upload: ', uploader);
            uploader.submit();
        });
    };

    addFormHandler(form, {
        onRequest: function() {
            // When a form is submitted, remove its error messages and reset
            // its inputs to non-error classes
            console.log('Submitting form via Ajax: ', form);
            form.getElements('p.error').dispose();
            form.getElements('.error').removeClass('error');
            spinner.show(false);
        },

        onSuccess: function(txt, xml) {
            console.log('Successful form submission: ', txt);
            // Once we've successfully created a new item, we can send any
            // Ajax file uploads to it now
            var resp = JSON.decode(txt);
            doUploads(resp.url);

            // Add the new item to the list of items
            var newItem = addItemToList(resp, itemList, deletable);
            newItem.highlight();
            new Fx.Scroll(window).toElement(itemList);
            resetForm(form);
        },

        onFailure: function(xhr) {
            console.log('Failed form submission: ', xhr);
            spinner.hide();
            new Fx.Scroll(window).toElement(form.getParent());

            // Stick an overall error message into the top of the form
            var globalMsg = new Element('p', {
                'class': 'error',
                'html': 'Please fix the errors below'
            });
            form.grab(globalMsg, 'top');

            // Do we have an error we expect to be able to handle?
            if (xhr.status >= 400 && xhr.status < 500) {
                var resp = JSON.decode(xhr.responseText);

                // Annotate each field with an error message, if applicable
                for (var fieldName in resp.errors) {
                    var msg = resp.errors[fieldName].join(' ');
                    var field = getField(fieldName);
                    field.addClass('error');
                    var err = new Element('p', { 'class': 'error', 'html': msg });
                    field.getParent().grab(err);
                }
            }

            // Otherwise, we have a 500 error from the server, and we don't
            // know what to do about it
            else {
                globalMsg.set('html', '<b>Server Error:</b> ' + xhr.responseText);
            }
        },

        onComplete: function() {
            // Upon successful form submission, wait for any possible Ajax
            // file uploads to finish before clearing the spinner
            console.log('Finished form submission');

            function reallyFinish() {
                // We're done waiting, so we hid the spinner, stop checking on
                // it and re-enable each file uploader.
                clearInterval(timer);
                spinner.hide();
                uploaders.each(function(uploader) {
                    uploader.enable();
                });
                console.log('Actually finished with everything.');
            }

            function wait() {
                // Check to see if any of the uploaders are still enabled,
                // which means we need to wait for them to finish
                var notDone = uploaders.filter(function(uploader) {
                    return uploader._input.value && !uploader.finished;
                });
                console.log('Waiting for file uploads: ', notDone);
                if (notDone.length == 0) {
                    clearInterval(timer);
                    reallyFinish();
                }
            }

            // Start polling the uploaders
            var timer = setInterval(wait, 100);
        }
    });
}

function addFileUploaders(form) {
    var uploaders = [];
    $(form).getElements('.uploader').each(function(el) {
        var msg = 'Choose an image to upload';
        el.innerHTML = msg;
        uploaders.push(
            new AjaxUpload(el, {
                action: null,
                name: el.id.replace(/^uploader:/, ''),
                autoSubmit: false,

                onChange: function(file, ext) {
                    if (!ext || !/^(jpe?g|gif|png)$/.test(ext)) {
                        alert('Invalid image selected.');
                        return false;
                    }
                    this._button.innerHTML = file;
                    // Custom property used to monitor the status of each
                    // ajax uploader
                    this.finished = false;
                    return true;
                },
                onSubmit: function(file, ext) {
                    console.log('Submitting %s', file);
                },
                onComplete: function(file, resp) {
                    console.log('Finished uploading %s: %o', file, resp);
                    el.innerHTML = msg;
                    this.action = null;
                    this.finished = true;
                }
            })
        );
    });
    return uploaders;
}

function resetForm(form) {
    // Do a native form reset
    form.reset();
    // Clear out any CKEditor fields
    getRichTextEditors(form).each(function(editor) {
        editor.setData('');
    });
    // Focus the first form element
    focusFirst(form);
}

function focusFirst(form) {
    // Focus the first form element
    for (var i = 0; i < form.length; i++) {
        var el = form.elements[i];
        if (el.type != 'hidden' && !el.disabled && !el.readOnly) {
            el.focus();
            break;
        }
    }
}

function getRichTextEditors(form) {
    var realFields = form.getElements('textarea');
    return $H(CKEDITOR.instances).filter(function(editor){
        return realFields.contains(editor.element.$);
    });
}

function addItemToList(item, itemList, deletable) {
    var newItem = new Element('li', { 'class': 'added' });
    var link = new Element('a', { href: item.url, html: item.str });
    console.log(link);
    if (deletable) {
        var check = new Element('input', {
            type: 'checkbox',
            value: item.key,
            name: 'keys'
        });
        newItem.adopt(check, link);
    } else {
        newItem.grab(link);
    }
    itemList.getChildren('li.empty').each(function(el) { el.dispose(); });
    itemList.grab(newItem);
    return newItem;
}

// Set up a dummy console.log if one isn't available
if (!console) {
    var console = { log: function() {} };
}
