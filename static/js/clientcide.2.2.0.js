//MooTools, <http://mootools.net>, My Object Oriented (JavaScript) Tools. Copyright (c) 2006-2009 Valerio Proietti, <http://mad4milk.net>, MIT Style License.
//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>, Valerio Proietti <http://mad4milk.net> & the MooTools team <http://mootools.net/developers>, MIT Style License.
/* Clientcide Copyright (c) 2006-2009, http://www.clientcide.com/wiki/cnet-libraries#license*/

//Contents: Core, Browser, Array, Function, Number, String, Hash, Event, Class, Class.Extras, Element, Element.Event, Element.Style, Element.Dimensions, Selectors, DomReady, JSON, Cookie, Swiff, Fx, Fx.CSS, Fx.Tween, Fx.Morph, Fx.Transitions, Request, Request.HTML, Request.JSON, More, Lang, Log, Depender, Class.Refactor, Class.Binds, Class.Occlude, Chain.Wait, Array.Extras, Date, Date.Extras, Hash.Extras, String.Extras, String.QueryString, URI, URI.Relative, Element.Forms, Elements.From, Element.Delegation, Element.Measure, Element.Pin, Element.Position, Element.Shortcuts, Form.Request, Form.Request.Append, Form.Validator, Form.Validator.Inline, Form.Validator.Extras, OverText, Fx.Elements, Fx.Accordion, Fx.Move, Fx.Reveal, Fx.Scroll, Fx.Slide, Fx.SmoothScroll, Fx.Sort, Drag, Drag.Move, Slider, Sortables, Request.JSONP, Request.Queue, Request.Periodical, Assets, Color, Group, Hash.Cookie, IframeShim, HtmlTable, HtmlTable.Zebra, HtmlTable.Sort, HtmlTable.Select, Keyboard, Mask, Scroller, Tips, Spinner, Date.English.US, Form.Validator.English, Date.Catalan, Date.Czech, Date.Danish, Date.Dutch, Date.English.GB, Date.Estonian, Date.French, Date.Italian, Date.Norwegian, Date.Polish, Date.Portuguese.BR, Date.Russian, Date.Spanish, Date.Swedish, Date.Ukrainian, Form.Validator.Arabic, Form.Validator.Catalan, Form.Validator.Czech, Form.Validator.Chinese, Form.Validator.Dutch, Form.Validator.Estonian, Form.Validator.French, Form.Validator.Italian, Form.Validator.Norwegian, Form.Validator.Polish, Form.Validator.Portuguese, Form.Validator.Portuguese.BR, Form.Validator.Russian, Form.Validator.Spanish, Form.Validator.Swedish, Form.Validator.Ukrainian, Clientcide, Class.ToElement, dbug, StyleWriter, StickyWin, StickyWin.Fx, StickyWin.Modal, StickyWin.UI, StickyWin.Ajax, StickyWin.Alert, StickyWin.Confirm, TabSwapper, Confirmer

//This lib: http://www.clientcide.com/js/build.php?requireLibs[]=mootools-core&requireLibs[]=mootools-more&require[]=Clientcide&require[]=StickyWin&require[]=StickyWin.Fx&require[]=StickyWin.Modal&require[]=StickyWin.Ajax&require[]=StickyWin.Confirm&require[]=TabSwapper&require[]=Confirmer&compression=none

/*
---

script: Core.js

description: The core of MooTools, contains all the base functions and the Native and Hash implementations. Required by all the other scripts.

license: MIT-style license.

copyright: Copyright (c) 2006-2008 [Valerio Proietti](http://mad4milk.net/).

authors: The MooTools production team (http://mootools.net/developers/)

inspiration:
- Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
- Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)

provides: [Mootools, Native, Hash.base, Array.each, $util]

...
*/

var MooTools = {
    'version': '1.2.4',
    'build': '0d9113241a90b9cd5643b926795852a2026710d4'
};

var Native = function(options){
    options = options || {};
    var name = options.name;
    var legacy = options.legacy;
    var protect = options.protect;
    var methods = options.implement;
    var generics = options.generics;
    var initialize = options.initialize;
    var afterImplement = options.afterImplement || function(){};
    var object = initialize || legacy;
    generics = generics !== false;

    object.constructor = Native;
    object.$family = {name: 'native'};
    if (legacy && initialize) object.prototype = legacy.prototype;
    object.prototype.constructor = object;

    if (name){
        var family = name.toLowerCase();
        object.prototype.$family = {name: family};
        Native.typize(object, family);
    }

    var add = function(obj, name, method, force){
        if (!protect || force || !obj.prototype[name]) obj.prototype[name] = method;
        if (generics) Native.genericize(obj, name, protect);
        afterImplement.call(obj, name, method);
        return obj;
    };

    object.alias = function(a1, a2, a3){
        if (typeof a1 == 'string'){
            var pa1 = this.prototype[a1];
            if ((a1 = pa1)) return add(this, a2, a1, a3);
        }
        for (var a in a1) this.alias(a, a1[a], a2);
        return this;
    };

    object.implement = function(a1, a2, a3){
        if (typeof a1 == 'string') return add(this, a1, a2, a3);
        for (var p in a1) add(this, p, a1[p], a2);
        return this;
    };

    if (methods) object.implement(methods);

    return object;
};

Native.genericize = function(object, property, check){
    if ((!check || !object[property]) && typeof object.prototype[property] == 'function') object[property] = function(){
        var args = Array.prototype.slice.call(arguments);
        return object.prototype[property].apply(args.shift(), args);
    };
};

Native.implement = function(objects, properties){
    for (var i = 0, l = objects.length; i < l; i++) objects[i].implement(properties);
};

Native.typize = function(object, family){
    if (!object.type) object.type = function(item){
        return ($type(item) === family);
    };
};

(function(){
    var natives = {'Array': Array, 'Date': Date, 'Function': Function, 'Number': Number, 'RegExp': RegExp, 'String': String};
    for (var n in natives) new Native({name: n, initialize: natives[n], protect: true});

    var types = {'boolean': Boolean, 'native': Native, 'object': Object};
    for (var t in types) Native.typize(types[t], t);

    var generics = {
        'Array': ["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", "sort", "splice", "toString", "unshift", "valueOf"],
        'String': ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "valueOf"]
    };
    for (var g in generics){
        for (var i = generics[g].length; i--;) Native.genericize(natives[g], generics[g][i], true);
    }
})();

var Hash = new Native({

    name: 'Hash',

    initialize: function(object){
        if ($type(object) == 'hash') object = $unlink(object.getClean());
        for (var key in object) this[key] = object[key];
        return this;
    }

});

Hash.implement({

    forEach: function(fn, bind){
        for (var key in this){
            if (this.hasOwnProperty(key)) fn.call(bind, this[key], key, this);
        }
    },

    getClean: function(){
        var clean = {};
        for (var key in this){
            if (this.hasOwnProperty(key)) clean[key] = this[key];
        }
        return clean;
    },

    getLength: function(){
        var length = 0;
        for (var key in this){
            if (this.hasOwnProperty(key)) length++;
        }
        return length;
    }

});

Hash.alias('forEach', 'each');

Array.implement({

    forEach: function(fn, bind){
        for (var i = 0, l = this.length; i < l; i++) fn.call(bind, this[i], i, this);
    }

});

Array.alias('forEach', 'each');

function $A(iterable){
    if (iterable.item){
        var l = iterable.length, array = new Array(l);
        while (l--) array[l] = iterable[l];
        return array;
    }
    return Array.prototype.slice.call(iterable);
};

function $arguments(i){
    return function(){
        return arguments[i];
    };
};

function $chk(obj){
    return !!(obj || obj === 0);
};

function $clear(timer){
    clearTimeout(timer);
    clearInterval(timer);
    return null;
};

function $defined(obj){
    return (obj != undefined);
};

function $each(iterable, fn, bind){
    var type = $type(iterable);
    ((type == 'arguments' || type == 'collection' || type == 'array') ? Array : Hash).each(iterable, fn, bind);
};

function $empty(){};

function $extend(original, extended){
    for (var key in (extended || {})) original[key] = extended[key];
    return original;
};

function $H(object){
    return new Hash(object);
};

function $lambda(value){
    return ($type(value) == 'function') ? value : function(){
        return value;
    };
};

function $merge(){
    var args = Array.slice(arguments);
    args.unshift({});
    return $mixin.apply(null, args);
};

function $mixin(mix){
    for (var i = 1, l = arguments.length; i < l; i++){
        var object = arguments[i];
        if ($type(object) != 'object') continue;
        for (var key in object){
            var op = object[key], mp = mix[key];
            mix[key] = (mp && $type(op) == 'object' && $type(mp) == 'object') ? $mixin(mp, op) : $unlink(op);
        }
    }
    return mix;
};

function $pick(){
    for (var i = 0, l = arguments.length; i < l; i++){
        if (arguments[i] != undefined) return arguments[i];
    }
    return null;
};

function $random(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
};

function $splat(obj){
    var type = $type(obj);
    return (type) ? ((type != 'array' && type != 'arguments') ? [obj] : obj) : [];
};

var $time = Date.now || function(){
    return +new Date;
};

function $try(){
    for (var i = 0, l = arguments.length; i < l; i++){
        try {
            return arguments[i]();
        } catch(e){}
    }
    return null;
};

function $type(obj){
    if (obj == undefined) return false;
    if (obj.$family) return (obj.$family.name == 'number' && !isFinite(obj)) ? false : obj.$family.name;
    if (obj.nodeName){
        switch (obj.nodeType){
            case 1: return 'element';
            case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
        }
    } else if (typeof obj.length == 'number'){
        if (obj.callee) return 'arguments';
        else if (obj.item) return 'collection';
    }
    return typeof obj;
};

function $unlink(object){
    var unlinked;
    switch ($type(object)){
        case 'object':
            unlinked = {};
            for (var p in object) unlinked[p] = $unlink(object[p]);
        break;
        case 'hash':
            unlinked = new Hash(object);
        break;
        case 'array':
            unlinked = [];
            for (var i = 0, l = object.length; i < l; i++) unlinked[i] = $unlink(object[i]);
        break;
        default: return object;
    }
    return unlinked;
};
/*
---

script: Browser.js

description: The Browser Core. Contains Browser initialization, Window and Document, and the Browser Hash.

license: MIT-style license.

requires: 
- /Native
- /$util

provides: [Browser, Window, Document, $exec]

...
*/

var Browser = $merge({

    Engine: {name: 'unknown', version: 0},

    Platform: {name: (window.orientation != undefined) ? 'ipod' : (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()},

    Features: {xpath: !!(document.evaluate), air: !!(window.runtime), query: !!(document.querySelector)},

    Plugins: {},

    Engines: {

        presto: function(){
            return (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925));
        },

        trident: function(){
            return (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? ((document.querySelectorAll) ? 6 : 5) : 4);
        },

        webkit: function(){
            return (navigator.taintEnabled) ? false : ((Browser.Features.xpath) ? ((Browser.Features.query) ? 525 : 420) : 419);
        },

        gecko: function(){
            return (!document.getBoxObjectFor && window.mozInnerScreenX == null) ? false : ((document.getElementsByClassName) ? 19 : 18);
        }

    }

}, Browser || {});

Browser.Platform[Browser.Platform.name] = true;

Browser.detect = function(){

    for (var engine in this.Engines){
        var version = this.Engines[engine]();
        if (version){
            this.Engine = {name: engine, version: version};
            this.Engine[engine] = this.Engine[engine + version] = true;
            break;
        }
    }

    return {name: engine, version: version};

};

Browser.detect();

Browser.Request = function(){
    return $try(function(){
        return new XMLHttpRequest();
    }, function(){
        return new ActiveXObject('MSXML2.XMLHTTP');
    }, function(){
        return new ActiveXObject('Microsoft.XMLHTTP');
    });
};

Browser.Features.xhr = !!(Browser.Request());

Browser.Plugins.Flash = (function(){
    var version = ($try(function(){
        return navigator.plugins['Shockwave Flash'].description;
    }, function(){
        return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
    }) || '0 r0').match(/\d+/g);
    return {version: parseInt(version[0] || 0 + '.' + version[1], 10) || 0, build: parseInt(version[2], 10) || 0};
})();

function $exec(text){
    if (!text) return text;
    if (window.execScript){
        window.execScript(text);
    } else {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script[(Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerText' : 'text'] = text;
        document.head.appendChild(script);
        document.head.removeChild(script);
    }
    return text;
};

Native.UID = 1;

var $uid = (Browser.Engine.trident) ? function(item){
    return (item.uid || (item.uid = [Native.UID++]))[0];
} : function(item){
    return item.uid || (item.uid = Native.UID++);
};

var Window = new Native({

    name: 'Window',

    legacy: (Browser.Engine.trident) ? null: window.Window,

    initialize: function(win){
        $uid(win);
        if (!win.Element){
            win.Element = $empty;
            if (Browser.Engine.webkit) win.document.createElement("iframe"); //fixes safari 2
            win.Element.prototype = (Browser.Engine.webkit) ? window["[[DOMElement.prototype]]"] : {};
        }
        win.document.window = win;
        return $extend(win, Window.Prototype);
    },

    afterImplement: function(property, value){
        window[property] = Window.Prototype[property] = value;
    }

});

Window.Prototype = {$family: {name: 'window'}};

new Window(window);

var Document = new Native({

    name: 'Document',

    legacy: (Browser.Engine.trident) ? null: window.Document,

    initialize: function(doc){
        $uid(doc);
        doc.head = doc.getElementsByTagName('head')[0];
        doc.html = doc.getElementsByTagName('html')[0];
        if (Browser.Engine.trident && Browser.Engine.version <= 4) $try(function(){
            doc.execCommand("BackgroundImageCache", false, true);
        });
        if (Browser.Engine.trident) doc.window.attachEvent('onunload', function(){
            doc.window.detachEvent('onunload', arguments.callee);
            doc.head = doc.html = doc.window = null;
        });
        return $extend(doc, Document.Prototype);
    },

    afterImplement: function(property, value){
        document[property] = Document.Prototype[property] = value;
    }

});

Document.Prototype = {$family: {name: 'document'}};

new Document(document);
/*
---

script: Array.js

description: Contains Array Prototypes like each, contains, and erase.

license: MIT-style license.

requires:
- /$util
- /Array.each

provides: [Array]

...
*/

Array.implement({

    every: function(fn, bind){
        for (var i = 0, l = this.length; i < l; i++){
            if (!fn.call(bind, this[i], i, this)) return false;
        }
        return true;
    },

    filter: function(fn, bind){
        var results = [];
        for (var i = 0, l = this.length; i < l; i++){
            if (fn.call(bind, this[i], i, this)) results.push(this[i]);
        }
        return results;
    },

    clean: function(){
        return this.filter($defined);
    },

    indexOf: function(item, from){
        var len = this.length;
        for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
            if (this[i] === item) return i;
        }
        return -1;
    },

    map: function(fn, bind){
        var results = [];
        for (var i = 0, l = this.length; i < l; i++) results[i] = fn.call(bind, this[i], i, this);
        return results;
    },

    some: function(fn, bind){
        for (var i = 0, l = this.length; i < l; i++){
            if (fn.call(bind, this[i], i, this)) return true;
        }
        return false;
    },

    associate: function(keys){
        var obj = {}, length = Math.min(this.length, keys.length);
        for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
        return obj;
    },

    link: function(object){
        var result = {};
        for (var i = 0, l = this.length; i < l; i++){
            for (var key in object){
                if (object[key](this[i])){
                    result[key] = this[i];
                    delete object[key];
                    break;
                }
            }
        }
        return result;
    },

    contains: function(item, from){
        return this.indexOf(item, from) != -1;
    },

    extend: function(array){
        for (var i = 0, j = array.length; i < j; i++) this.push(array[i]);
        return this;
    },
    
    getLast: function(){
        return (this.length) ? this[this.length - 1] : null;
    },

    getRandom: function(){
        return (this.length) ? this[$random(0, this.length - 1)] : null;
    },

    include: function(item){
        if (!this.contains(item)) this.push(item);
        return this;
    },

    combine: function(array){
        for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
        return this;
    },

    erase: function(item){
        for (var i = this.length; i--; i){
            if (this[i] === item) this.splice(i, 1);
        }
        return this;
    },

    empty: function(){
        this.length = 0;
        return this;
    },

    flatten: function(){
        var array = [];
        for (var i = 0, l = this.length; i < l; i++){
            var type = $type(this[i]);
            if (!type) continue;
            array = array.concat((type == 'array' || type == 'collection' || type == 'arguments') ? Array.flatten(this[i]) : this[i]);
        }
        return array;
    },

    hexToRgb: function(array){
        if (this.length != 3) return null;
        var rgb = this.map(function(value){
            if (value.length == 1) value += value;
            return value.toInt(16);
        });
        return (array) ? rgb : 'rgb(' + rgb + ')';
    },

    rgbToHex: function(array){
        if (this.length < 3) return null;
        if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
        var hex = [];
        for (var i = 0; i < 3; i++){
            var bit = (this[i] - 0).toString(16);
            hex.push((bit.length == 1) ? '0' + bit : bit);
        }
        return (array) ? hex : '#' + hex.join('');
    }

});
/*
---

script: Function.js

description: Contains Function Prototypes like create, bind, pass, and delay.

license: MIT-style license.

requires:
- /Native
- /$util

provides: [Function]

...
*/

Function.implement({

    extend: function(properties){
        for (var property in properties) this[property] = properties[property];
        return this;
    },

    create: function(options){
        var self = this;
        options = options || {};
        return function(event){
            var args = options.arguments;
            args = (args != undefined) ? $splat(args) : Array.slice(arguments, (options.event) ? 1 : 0);
            if (options.event) args = [event || window.event].extend(args);
            var returns = function(){
                return self.apply(options.bind || null, args);
            };
            if (options.delay) return setTimeout(returns, options.delay);
            if (options.periodical) return setInterval(returns, options.periodical);
            if (options.attempt) return $try(returns);
            return returns();
        };
    },

    run: function(args, bind){
        return this.apply(bind, $splat(args));
    },

    pass: function(args, bind){
        return this.create({bind: bind, arguments: args});
    },

    bind: function(bind, args){
        return this.create({bind: bind, arguments: args});
    },

    bindWithEvent: function(bind, args){
        return this.create({bind: bind, arguments: args, event: true});
    },

    attempt: function(args, bind){
        return this.create({bind: bind, arguments: args, attempt: true})();
    },

    delay: function(delay, bind, args){
        return this.create({bind: bind, arguments: args, delay: delay})();
    },

    periodical: function(periodical, bind, args){
        return this.create({bind: bind, arguments: args, periodical: periodical})();
    }

});
/*
---

script: Number.js

description: Contains Number Prototypes like limit, round, times, and ceil.

license: MIT-style license.

requires:
- /Native
- /$util

provides: [Number]

...
*/

Number.implement({

    limit: function(min, max){
        return Math.min(max, Math.max(min, this));
    },

    round: function(precision){
        precision = Math.pow(10, precision || 0);
        return Math.round(this * precision) / precision;
    },

    times: function(fn, bind){
        for (var i = 0; i < this; i++) fn.call(bind, i, this);
    },

    toFloat: function(){
        return parseFloat(this);
    },

    toInt: function(base){
        return parseInt(this, base || 10);
    }

});

Number.alias('times', 'each');

(function(math){
    var methods = {};
    math.each(function(name){
        if (!Number[name]) methods[name] = function(){
            return Math[name].apply(null, [this].concat($A(arguments)));
        };
    });
    Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);
/*
---

script: String.js

description: Contains String Prototypes like camelCase, capitalize, test, and toInt.

license: MIT-style license.

requires:
- /Native

provides: [String]

...
*/

String.implement({

    test: function(regex, params){
        return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(this);
    },

    contains: function(string, separator){
        return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
    },

    trim: function(){
        return this.replace(/^\s+|\s+$/g, '');
    },

    clean: function(){
        return this.replace(/\s+/g, ' ').trim();
    },

    camelCase: function(){
        return this.replace(/-\D/g, function(match){
            return match.charAt(1).toUpperCase();
        });
    },

    hyphenate: function(){
        return this.replace(/[A-Z]/g, function(match){
            return ('-' + match.charAt(0).toLowerCase());
        });
    },

    capitalize: function(){
        return this.replace(/\b[a-z]/g, function(match){
            return match.toUpperCase();
        });
    },

    escapeRegExp: function(){
        return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
    },

    toInt: function(base){
        return parseInt(this, base || 10);
    },

    toFloat: function(){
        return parseFloat(this);
    },

    hexToRgb: function(array){
        var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
        return (hex) ? hex.slice(1).hexToRgb(array) : null;
    },

    rgbToHex: function(array){
        var rgb = this.match(/\d{1,3}/g);
        return (rgb) ? rgb.rgbToHex(array) : null;
    },

    stripScripts: function(option){
        var scripts = '';
        var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
            scripts += arguments[1] + '\n';
            return '';
        });
        if (option === true) $exec(scripts);
        else if ($type(option) == 'function') option(scripts, text);
        return text;
    },

    substitute: function(object, regexp){
        return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
            if (match.charAt(0) == '\\') return match.slice(1);
            return (object[name] != undefined) ? object[name] : '';
        });
    }

});
/*
---

script: Hash.js

description: Contains Hash Prototypes. Provides a means for overcoming the JavaScript practical impossibility of extending native Objects.

license: MIT-style license.

requires:
- /Hash.base

provides: [Hash]

...
*/

Hash.implement({

    has: Object.prototype.hasOwnProperty,

    keyOf: function(value){
        for (var key in this){
            if (this.hasOwnProperty(key) && this[key] === value) return key;
        }
        return null;
    },

    hasValue: function(value){
        return (Hash.keyOf(this, value) !== null);
    },

    extend: function(properties){
        Hash.each(properties || {}, function(value, key){
            Hash.set(this, key, value);
        }, this);
        return this;
    },

    combine: function(properties){
        Hash.each(properties || {}, function(value, key){
            Hash.include(this, key, value);
        }, this);
        return this;
    },

    erase: function(key){
        if (this.hasOwnProperty(key)) delete this[key];
        return this;
    },

    get: function(key){
        return (this.hasOwnProperty(key)) ? this[key] : null;
    },

    set: function(key, value){
        if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
        return this;
    },

    empty: function(){
        Hash.each(this, function(value, key){
            delete this[key];
        }, this);
        return this;
    },

    include: function(key, value){
        if (this[key] == undefined) this[key] = value;
        return this;
    },

    map: function(fn, bind){
        var results = new Hash;
        Hash.each(this, function(value, key){
            results.set(key, fn.call(bind, value, key, this));
        }, this);
        return results;
    },

    filter: function(fn, bind){
        var results = new Hash;
        Hash.each(this, function(value, key){
            if (fn.call(bind, value, key, this)) results.set(key, value);
        }, this);
        return results;
    },

    every: function(fn, bind){
        for (var key in this){
            if (this.hasOwnProperty(key) && !fn.call(bind, this[key], key)) return false;
        }
        return true;
    },

    some: function(fn, bind){
        for (var key in this){
            if (this.hasOwnProperty(key) && fn.call(bind, this[key], key)) return true;
        }
        return false;
    },

    getKeys: function(){
        var keys = [];
        Hash.each(this, function(value, key){
            keys.push(key);
        });
        return keys;
    },

    getValues: function(){
        var values = [];
        Hash.each(this, function(value){
            values.push(value);
        });
        return values;
    },

    toQueryString: function(base){
        var queryString = [];
        Hash.each(this, function(value, key){
            if (base) key = base + '[' + key + ']';
            var result;
            switch ($type(value)){
                case 'object': result = Hash.toQueryString(value, key); break;
                case 'array':
                    var qs = {};
                    value.each(function(val, i){
                        qs[i] = val;
                    });
                    result = Hash.toQueryString(qs, key);
                break;
                default: result = key + '=' + encodeURIComponent(value);
            }
            if (value != undefined) queryString.push(result);
        });

        return queryString.join('&');
    }

});

Hash.alias({keyOf: 'indexOf', hasValue: 'contains'});
/*
---

script: Event.js

description: Contains the Event Class, to make the event object cross-browser.

license: MIT-style license.

requires:
- /Window
- /Document
- /Hash
- /Array
- /Function
- /String

provides: [Event]

...
*/

var Event = new Native({

    name: 'Event',

    initialize: function(event, win){
        win = win || window;
        var doc = win.document;
        event = event || win.event;
        if (event.$extended) return event;
        this.$extended = true;
        var type = event.type;
        var target = event.target || event.srcElement;
        while (target && target.nodeType == 3) target = target.parentNode;

        if (type.test(/key/)){
            var code = event.which || event.keyCode;
            var key = Event.Keys.keyOf(code);
            if (type == 'keydown'){
                var fKey = code - 111;
                if (fKey > 0 && fKey < 13) key = 'f' + fKey;
            }
            key = key || String.fromCharCode(code).toLowerCase();
        } else if (type.match(/(click|mouse|menu)/i)){
            doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
            var page = {
                x: event.pageX || event.clientX + doc.scrollLeft,
                y: event.pageY || event.clientY + doc.scrollTop
            };
            var client = {
                x: (event.pageX) ? event.pageX - win.pageXOffset : event.clientX,
                y: (event.pageY) ? event.pageY - win.pageYOffset : event.clientY
            };
            if (type.match(/DOMMouseScroll|mousewheel/)){
                var wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
            }
            var rightClick = (event.which == 3) || (event.button == 2);
            var related = null;
            if (type.match(/over|out/)){
                switch (type){
                    case 'mouseover': related = event.relatedTarget || event.fromElement; break;
                    case 'mouseout': related = event.relatedTarget || event.toElement;
                }
                if (!(function(){
                    while (related && related.nodeType == 3) related = related.parentNode;
                    return true;
                }).create({attempt: Browser.Engine.gecko})()) related = false;
            }
        }

        return $extend(this, {
            event: event,
            type: type,

            page: page,
            client: client,
            rightClick: rightClick,

            wheel: wheel,

            relatedTarget: related,
            target: target,

            code: code,
            key: key,

            shift: event.shiftKey,
            control: event.ctrlKey,
            alt: event.altKey,
            meta: event.metaKey
        });
    }

});

Event.Keys = new Hash({
    'enter': 13,
    'up': 38,
    'down': 40,
    'left': 37,
    'right': 39,
    'esc': 27,
    'space': 32,
    'backspace': 8,
    'tab': 9,
    'delete': 46
});

Event.implement({

    stop: function(){
        return this.stopPropagation().preventDefault();
    },

    stopPropagation: function(){
        if (this.event.stopPropagation) this.event.stopPropagation();
        else this.event.cancelBubble = true;
        return this;
    },

    preventDefault: function(){
        if (this.event.preventDefault) this.event.preventDefault();
        else this.event.returnValue = false;
        return this;
    }

});
/*
---

script: Class.js

description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.

license: MIT-style license.

requires:
- /$util
- /Native
- /Array
- /String
- /Function
- /Number
- /Hash

provides: [Class]

...
*/

function Class(params){
    
    if (params instanceof Function) params = {initialize: params};
    
    var newClass = function(){
        Object.reset(this);
        if (newClass._prototyping) return this;
        this._current = $empty;
        var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
        delete this._current; delete this.caller;
        return value;
    }.extend(this);
    
    newClass.implement(params);
    
    newClass.constructor = Class;
    newClass.prototype.constructor = newClass;

    return newClass;

};

Function.prototype.protect = function(){
    this._protected = true;
    return this;
};

Object.reset = function(object, key){
        
    if (key == null){
        for (var p in object) Object.reset(object, p);
        return object;
    }
    
    delete object[key];
    
    switch ($type(object[key])){
        case 'object':
            var F = function(){};
            F.prototype = object[key];
            var i = new F;
            object[key] = Object.reset(i);
        break;
        case 'array': object[key] = $unlink(object[key]); break;
    }
    
    return object;
    
};

new Native({name: 'Class', initialize: Class}).extend({

    instantiate: function(F){
        F._prototyping = true;
        var proto = new F;
        delete F._prototyping;
        return proto;
    },
    
    wrap: function(self, key, method){
        if (method._origin) method = method._origin;
        
        return function(){
            if (method._protected && this._current == null) throw new Error('The method "' + key + '" cannot be called.');
            var caller = this.caller, current = this._current;
            this.caller = current; this._current = arguments.callee;
            var result = method.apply(this, arguments);
            this._current = current; this.caller = caller;
            return result;
        }.extend({_owner: self, _origin: method, _name: key});

    }
    
});

Class.implement({
    
    implement: function(key, value){
        
        if ($type(key) == 'object'){
            for (var p in key) this.implement(p, key[p]);
            return this;
        }
        
        var mutator = Class.Mutators[key];
        
        if (mutator){
            value = mutator.call(this, value);
            if (value == null) return this;
        }
        
        var proto = this.prototype;

        switch ($type(value)){
            
            case 'function':
                if (value._hidden) return this;
                proto[key] = Class.wrap(this, key, value);
            break;
            
            case 'object':
                var previous = proto[key];
                if ($type(previous) == 'object') $mixin(previous, value);
                else proto[key] = $unlink(value);
            break;
            
            case 'array':
                proto[key] = $unlink(value);
            break;
            
            default: proto[key] = value;

        }
        
        return this;

    }
    
});

Class.Mutators = {
    
    Extends: function(parent){

        this.parent = parent;
        this.prototype = Class.instantiate(parent);

        this.implement('parent', function(){
            var name = this.caller._name, previous = this.caller._owner.parent.prototype[name];
            if (!previous) throw new Error('The method "' + name + '" has no parent.');
            return previous.apply(this, arguments);
        }.protect());

    },

    Implements: function(items){
        $splat(items).each(function(item){
            if (item instanceof Function) item = Class.instantiate(item);
            this.implement(item);
        }, this);

    }
    
};
/*
---

script: Class.Extras.js

description: Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

license: MIT-style license.

requires:
- /Class

provides: [Chain, Events, Options]

...
*/

var Chain = new Class({

    $chain: [],

    chain: function(){
        this.$chain.extend(Array.flatten(arguments));
        return this;
    },

    callChain: function(){
        return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : false;
    },

    clearChain: function(){
        this.$chain.empty();
        return this;
    }

});

var Events = new Class({

    $events: {},

    addEvent: function(type, fn, internal){
        type = Events.removeOn(type);
        if (fn != $empty){
            this.$events[type] = this.$events[type] || [];
            this.$events[type].include(fn);
            if (internal) fn.internal = true;
        }
        return this;
    },

    addEvents: function(events){
        for (var type in events) this.addEvent(type, events[type]);
        return this;
    },

    fireEvent: function(type, args, delay){
        type = Events.removeOn(type);
        if (!this.$events || !this.$events[type]) return this;
        this.$events[type].each(function(fn){
            fn.create({'bind': this, 'delay': delay, 'arguments': args})();
        }, this);
        return this;
    },

    removeEvent: function(type, fn){
        type = Events.removeOn(type);
        if (!this.$events[type]) return this;
        if (!fn.internal) this.$events[type].erase(fn);
        return this;
    },

    removeEvents: function(events){
        var type;
        if ($type(events) == 'object'){
            for (type in events) this.removeEvent(type, events[type]);
            return this;
        }
        if (events) events = Events.removeOn(events);
        for (type in this.$events){
            if (events && events != type) continue;
            var fns = this.$events[type];
            for (var i = fns.length; i--; i) this.removeEvent(type, fns[i]);
        }
        return this;
    }

});

Events.removeOn = function(string){
    return string.replace(/^on([A-Z])/, function(full, first){
        return first.toLowerCase();
    });
};

var Options = new Class({

    setOptions: function(){
        this.options = $merge.run([this.options].extend(arguments));
        if (!this.addEvent) return this;
        for (var option in this.options){
            if ($type(this.options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
            this.addEvent(option, this.options[option]);
            delete this.options[option];
        }
        return this;
    }

});
/*
---

script: Element.js

description: One of the most important items in MooTools. Contains the dollar function, the dollars function, and an handful of cross-browser, time-saver methods to let you easily work with HTML Elements.

license: MIT-style license.

requires:
- /Window
- /Document
- /Array
- /String
- /Function
- /Number
- /Hash

provides: [Element, Elements, $, $$, Iframe]

...
*/

var Element = new Native({

    name: 'Element',

    legacy: window.Element,

    initialize: function(tag, props){
        var konstructor = Element.Constructors.get(tag);
        if (konstructor) return konstructor(props);
        if (typeof tag == 'string') return document.newElement(tag, props);
        return document.id(tag).set(props);
    },

    afterImplement: function(key, value){
        Element.Prototype[key] = value;
        if (Array[key]) return;
        Elements.implement(key, function(){
            var items = [], elements = true;
            for (var i = 0, j = this.length; i < j; i++){
                var returns = this[i][key].apply(this[i], arguments);
                items.push(returns);
                if (elements) elements = ($type(returns) == 'element');
            }
            return (elements) ? new Elements(items) : items;
        });
    }

});

Element.Prototype = {$family: {name: 'element'}};

Element.Constructors = new Hash;

var IFrame = new Native({

    name: 'IFrame',

    generics: false,

    initialize: function(){
        var params = Array.link(arguments, {properties: Object.type, iframe: $defined});
        var props = params.properties || {};
        var iframe = document.id(params.iframe);
        var onload = props.onload || $empty;
        delete props.onload;
        props.id = props.name = $pick(props.id, props.name, iframe ? (iframe.id || iframe.name) : 'IFrame_' + $time());
        iframe = new Element(iframe || 'iframe', props);
        var onFrameLoad = function(){
            var host = $try(function(){
                return iframe.contentWindow.location.host;
            });
            if (!host || host == window.location.host){
                var win = new Window(iframe.contentWindow);
                new Document(iframe.contentWindow.document);
                $extend(win.Element.prototype, Element.Prototype);
            }
            onload.call(iframe.contentWindow, iframe.contentWindow.document);
        };
        var contentWindow = $try(function(){
            return iframe.contentWindow;
        });
        ((contentWindow && contentWindow.document.body) || window.frames[props.id]) ? onFrameLoad() : iframe.addListener('load', onFrameLoad);
        return iframe;
    }

});

var Elements = new Native({

    initialize: function(elements, options){
        options = $extend({ddup: true, cash: true}, options);
        elements = elements || [];
        if (options.ddup || options.cash){
            var uniques = {}, returned = [];
            for (var i = 0, l = elements.length; i < l; i++){
                var el = document.id(elements[i], !options.cash);
                if (options.ddup){
                    if (uniques[el.uid]) continue;
                    uniques[el.uid] = true;
                }
                if (el) returned.push(el);
            }
            elements = returned;
        }
        return (options.cash) ? $extend(elements, this) : elements;
    }

});

Elements.implement({

    filter: function(filter, bind){
        if (!filter) return this;
        return new Elements(Array.filter(this, (typeof filter == 'string') ? function(item){
            return item.match(filter);
        } : filter, bind));
    }

});

Document.implement({

    newElement: function(tag, props){
        if (Browser.Engine.trident && props){
            ['name', 'type', 'checked'].each(function(attribute){
                if (!props[attribute]) return;
                tag += ' ' + attribute + '="' + props[attribute] + '"';
                if (attribute != 'checked') delete props[attribute];
            });
            tag = '<' + tag + '>';
        }
        return document.id(this.createElement(tag)).set(props);
    },

    newTextNode: function(text){
        return this.createTextNode(text);
    },

    getDocument: function(){
        return this;
    },

    getWindow: function(){
        return this.window;
    },
    
    id: (function(){
        
        var types = {

            string: function(id, nocash, doc){
                id = doc.getElementById(id);
                return (id) ? types.element(id, nocash) : null;
            },
            
            element: function(el, nocash){
                $uid(el);
                if (!nocash && !el.$family && !(/^object|embed$/i).test(el.tagName)){
                    var proto = Element.Prototype;
                    for (var p in proto) el[p] = proto[p];
                };
                return el;
            },
            
            object: function(obj, nocash, doc){
                if (obj.toElement) return types.element(obj.toElement(doc), nocash);
                return null;
            }
            
        };

        types.textnode = types.whitespace = types.window = types.document = $arguments(0);
        
        return function(el, nocash, doc){
            if (el && el.$family && el.uid) return el;
            var type = $type(el);
            return (types[type]) ? types[type](el, nocash, doc || document) : null;
        };

    })()

});

if (window.$ == null) Window.implement({
    $: function(el, nc){
        return document.id(el, nc, this.document);
    }
});

Window.implement({

    $$: function(selector){
        if (arguments.length == 1 && typeof selector == 'string') return this.document.getElements(selector);
        var elements = [];
        var args = Array.flatten(arguments);
        for (var i = 0, l = args.length; i < l; i++){
            var item = args[i];
            switch ($type(item)){
                case 'element': elements.push(item); break;
                case 'string': elements.extend(this.document.getElements(item, true));
            }
        }
        return new Elements(elements);
    },

    getDocument: function(){
        return this.document;
    },

    getWindow: function(){
        return this;
    }

});

Native.implement([Element, Document], {

    getElement: function(selector, nocash){
        return document.id(this.getElements(selector, true)[0] || null, nocash);
    },

    getElements: function(tags, nocash){
        tags = tags.split(',');
        var elements = [];
        var ddup = (tags.length > 1);
        tags.each(function(tag){
            var partial = this.getElementsByTagName(tag.trim());
            (ddup) ? elements.extend(partial) : elements = partial;
        }, this);
        return new Elements(elements, {ddup: ddup, cash: !nocash});
    }

});

(function(){

var collected = {}, storage = {};
var props = {input: 'checked', option: 'selected', textarea: (Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerHTML' : 'value'};

var get = function(uid){
    return (storage[uid] || (storage[uid] = {}));
};

var clean = function(item, retain){
    if (!item) return;
    var uid = item.uid;
    if (Browser.Engine.trident){
        if (item.clearAttributes){
            var clone = retain && item.cloneNode(false);
            item.clearAttributes();
            if (clone) item.mergeAttributes(clone);
        } else if (item.removeEvents){
            item.removeEvents();
        }
        if ((/object/i).test(item.tagName)){
            for (var p in item){
                if (typeof item[p] == 'function') item[p] = $empty;
            }
            Element.dispose(item);
        }
    }    
    if (!uid) return;
    collected[uid] = storage[uid] = null;
};

var purge = function(){
    Hash.each(collected, clean);
    if (Browser.Engine.trident) $A(document.getElementsByTagName('object')).each(clean);
    if (window.CollectGarbage) CollectGarbage();
    collected = storage = null;
};

var walk = function(element, walk, start, match, all, nocash){
    var el = element[start || walk];
    var elements = [];
    while (el){
        if (el.nodeType == 1 && (!match || Element.match(el, match))){
            if (!all) return document.id(el, nocash);
            elements.push(el);
        }
        el = el[walk];
    }
    return (all) ? new Elements(elements, {ddup: false, cash: !nocash}) : null;
};

var attributes = {
    'html': 'innerHTML',
    'class': 'className',
    'for': 'htmlFor',
    'defaultValue': 'defaultValue',
    'text': (Browser.Engine.trident || (Browser.Engine.webkit && Browser.Engine.version < 420)) ? 'innerText' : 'textContent'
};
var bools = ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readonly', 'multiple', 'selected', 'noresize', 'defer'];
var camels = ['value', 'type', 'defaultValue', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly', 'rowSpan', 'tabIndex', 'useMap'];

bools = bools.associate(bools);

Hash.extend(attributes, bools);
Hash.extend(attributes, camels.associate(camels.map(String.toLowerCase)));

var inserters = {

    before: function(context, element){
        if (element.parentNode) element.parentNode.insertBefore(context, element);
    },

    after: function(context, element){
        if (!element.parentNode) return;
        var next = element.nextSibling;
        (next) ? element.parentNode.insertBefore(context, next) : element.parentNode.appendChild(context);
    },

    bottom: function(context, element){
        element.appendChild(context);
    },

    top: function(context, element){
        var first = element.firstChild;
        (first) ? element.insertBefore(context, first) : element.appendChild(context);
    }

};

inserters.inside = inserters.bottom;

Hash.each(inserters, function(inserter, where){

    where = where.capitalize();

    Element.implement('inject' + where, function(el){
        inserter(this, document.id(el, true));
        return this;
    });

    Element.implement('grab' + where, function(el){
        inserter(document.id(el, true), this);
        return this;
    });

});

Element.implement({

    set: function(prop, value){
        switch ($type(prop)){
            case 'object':
                for (var p in prop) this.set(p, prop[p]);
                break;
            case 'string':
                var property = Element.Properties.get(prop);
                (property && property.set) ? property.set.apply(this, Array.slice(arguments, 1)) : this.setProperty(prop, value);
        }
        return this;
    },

    get: function(prop){
        var property = Element.Properties.get(prop);
        return (property && property.get) ? property.get.apply(this, Array.slice(arguments, 1)) : this.getProperty(prop);
    },

    erase: function(prop){
        var property = Element.Properties.get(prop);
        (property && property.erase) ? property.erase.apply(this) : this.removeProperty(prop);
        return this;
    },

    setProperty: function(attribute, value){
        var key = attributes[attribute];
        if (value == undefined) return this.removeProperty(attribute);
        if (key && bools[attribute]) value = !!value;
        (key) ? this[key] = value : this.setAttribute(attribute, '' + value);
        return this;
    },

    setProperties: function(attributes){
        for (var attribute in attributes) this.setProperty(attribute, attributes[attribute]);
        return this;
    },

    getProperty: function(attribute){
        var key = attributes[attribute];
        var value = (key) ? this[key] : this.getAttribute(attribute, 2);
        return (bools[attribute]) ? !!value : (key) ? value : value || null;
    },

    getProperties: function(){
        var args = $A(arguments);
        return args.map(this.getProperty, this).associate(args);
    },

    removeProperty: function(attribute){
        var key = attributes[attribute];
        (key) ? this[key] = (key && bools[attribute]) ? false : '' : this.removeAttribute(attribute);
        return this;
    },

    removeProperties: function(){
        Array.each(arguments, this.removeProperty, this);
        return this;
    },

    hasClass: function(className){
        return this.className.contains(className, ' ');
    },

    addClass: function(className){
        if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
        return this;
    },

    removeClass: function(className){
        this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
        return this;
    },

    toggleClass: function(className){
        return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
    },

    adopt: function(){
        Array.flatten(arguments).each(function(element){
            element = document.id(element, true);
            if (element) this.appendChild(element);
        }, this);
        return this;
    },

    appendText: function(text, where){
        return this.grab(this.getDocument().newTextNode(text), where);
    },

    grab: function(el, where){
        inserters[where || 'bottom'](document.id(el, true), this);
        return this;
    },

    inject: function(el, where){
        inserters[where || 'bottom'](this, document.id(el, true));
        return this;
    },

    replaces: function(el){
        el = document.id(el, true);
        el.parentNode.replaceChild(this, el);
        return this;
    },

    wraps: function(el, where){
        el = document.id(el, true);
        return this.replaces(el).grab(el, where);
    },

    getPrevious: function(match, nocash){
        return walk(this, 'previousSibling', null, match, false, nocash);
    },

    getAllPrevious: function(match, nocash){
        return walk(this, 'previousSibling', null, match, true, nocash);
    },

    getNext: function(match, nocash){
        return walk(this, 'nextSibling', null, match, false, nocash);
    },

    getAllNext: function(match, nocash){
        return walk(this, 'nextSibling', null, match, true, nocash);
    },

    getFirst: function(match, nocash){
        return walk(this, 'nextSibling', 'firstChild', match, false, nocash);
    },

    getLast: function(match, nocash){
        return walk(this, 'previousSibling', 'lastChild', match, false, nocash);
    },

    getParent: function(match, nocash){
        return walk(this, 'parentNode', null, match, false, nocash);
    },

    getParents: function(match, nocash){
        return walk(this, 'parentNode', null, match, true, nocash);
    },
    
    getSiblings: function(match, nocash){
        return this.getParent().getChildren(match, nocash).erase(this);
    },

    getChildren: function(match, nocash){
        return walk(this, 'nextSibling', 'firstChild', match, true, nocash);
    },

    getWindow: function(){
        return this.ownerDocument.window;
    },

    getDocument: function(){
        return this.ownerDocument;
    },

    getElementById: function(id, nocash){
        var el = this.ownerDocument.getElementById(id);
        if (!el) return null;
        for (var parent = el.parentNode; parent != this; parent = parent.parentNode){
            if (!parent) return null;
        }
        return document.id(el, nocash);
    },

    getSelected: function(){
        return new Elements($A(this.options).filter(function(option){
            return option.selected;
        }));
    },

    getComputedStyle: function(property){
        if (this.currentStyle) return this.currentStyle[property.camelCase()];
        var computed = this.getDocument().defaultView.getComputedStyle(this, null);
        return (computed) ? computed.getPropertyValue([property.hyphenate()]) : null;
    },

    toQueryString: function(){
        var queryString = [];
        this.getElements('input, select, textarea', true).each(function(el){
            if (!el.name || el.disabled || el.type == 'submit' || el.type == 'reset' || el.type == 'file') return;
            var value = (el.tagName.toLowerCase() == 'select') ? Element.getSelected(el).map(function(opt){
                return opt.value;
            }) : ((el.type == 'radio' || el.type == 'checkbox') && !el.checked) ? null : el.value;
            $splat(value).each(function(val){
                if (typeof val != 'undefined') queryString.push(el.name + '=' + encodeURIComponent(val));
            });
        });
        return queryString.join('&');
    },

    clone: function(contents, keepid){
        contents = contents !== false;
        var clone = this.cloneNode(contents);
        var clean = function(node, element){
            if (!keepid) node.removeAttribute('id');
            if (Browser.Engine.trident){
                node.clearAttributes();
                node.mergeAttributes(element);
                node.removeAttribute('uid');
                if (node.options){
                    var no = node.options, eo = element.options;
                    for (var j = no.length; j--;) no[j].selected = eo[j].selected;
                }
            }
            var prop = props[element.tagName.toLowerCase()];
            if (prop && element[prop]) node[prop] = element[prop];
        };

        if (contents){
            var ce = clone.getElementsByTagName('*'), te = this.getElementsByTagName('*');
            for (var i = ce.length; i--;) clean(ce[i], te[i]);
        }

        clean(clone, this);
        return document.id(clone);
    },

    destroy: function(){
        Element.empty(this);
        Element.dispose(this);
        clean(this, true);
        return null;
    },

    empty: function(){
        $A(this.childNodes).each(function(node){
            Element.destroy(node);
        });
        return this;
    },

    dispose: function(){
        return (this.parentNode) ? this.parentNode.removeChild(this) : this;
    },

    hasChild: function(el){
        el = document.id(el, true);
        if (!el) return false;
        if (Browser.Engine.webkit && Browser.Engine.version < 420) return $A(this.getElementsByTagName(el.tagName)).contains(el);
        return (this.contains) ? (this != el && this.contains(el)) : !!(this.compareDocumentPosition(el) & 16);
    },

    match: function(tag){
        return (!tag || (tag == this) || (Element.get(this, 'tag') == tag));
    }

});

Native.implement([Element, Window, Document], {

    addListener: function(type, fn){
        if (type == 'unload'){
            var old = fn, self = this;
            fn = function(){
                self.removeListener('unload', fn);
                old();
            };
        } else {
            collected[this.uid] = this;
        }
        if (this.addEventListener) this.addEventListener(type, fn, false);
        else this.attachEvent('on' + type, fn);
        return this;
    },

    removeListener: function(type, fn){
        if (this.removeEventListener) this.removeEventListener(type, fn, false);
        else this.detachEvent('on' + type, fn);
        return this;
    },

    retrieve: function(property, dflt){
        var storage = get(this.uid), prop = storage[property];
        if (dflt != undefined && prop == undefined) prop = storage[property] = dflt;
        return $pick(prop);
    },

    store: function(property, value){
        var storage = get(this.uid);
        storage[property] = value;
        return this;
    },

    eliminate: function(property){
        var storage = get(this.uid);
        delete storage[property];
        return this;
    }

});

window.addListener('unload', purge);

})();

Element.Properties = new Hash;

Element.Properties.style = {

    set: function(style){
        this.style.cssText = style;
    },

    get: function(){
        return this.style.cssText;
    },

    erase: function(){
        this.style.cssText = '';
    }

};

Element.Properties.tag = {

    get: function(){
        return this.tagName.toLowerCase();
    }

};

Element.Properties.html = (function(){
    var wrapper = document.createElement('div');

    var translations = {
        table: [1, '<table>', '</table>'],
        select: [1, '<select>', '</select>'],
        tbody: [2, '<table><tbody>', '</tbody></table>'],
        tr: [3, '<table><tbody><tr>', '</tr></tbody></table>']
    };
    translations.thead = translations.tfoot = translations.tbody;

    var html = {
        set: function(){
            var html = Array.flatten(arguments).join('');
            var wrap = Browser.Engine.trident && translations[this.get('tag')];
            if (wrap){
                var first = wrapper;
                first.innerHTML = wrap[1] + html + wrap[2];
                for (var i = wrap[0]; i--;) first = first.firstChild;
                this.empty().adopt(first.childNodes);
            } else {
                this.innerHTML = html;
            }
        }
    };

    html.erase = html.set;

    return html;
})();

if (Browser.Engine.webkit && Browser.Engine.version < 420) Element.Properties.text = {
    get: function(){
        if (this.innerText) return this.innerText;
        var temp = this.ownerDocument.newElement('div', {html: this.innerHTML}).inject(this.ownerDocument.body);
        var text = temp.innerText;
        temp.destroy();
        return text;
    }
};
/*
---

script: Element.Event.js

description: Contains Element methods for dealing with events. This file also includes mouseenter and mouseleave custom Element Events.

license: MIT-style license.

requires: 
- /Element
- /Event

provides: [Element.Event]

...
*/

Element.Properties.events = {set: function(events){
    this.addEvents(events);
}};

Native.implement([Element, Window, Document], {

    addEvent: function(type, fn){
        var events = this.retrieve('events', {});
        events[type] = events[type] || {'keys': [], 'values': []};
        if (events[type].keys.contains(fn)) return this;
        events[type].keys.push(fn);
        var realType = type, custom = Element.Events.get(type), condition = fn, self = this;
        if (custom){
            if (custom.onAdd) custom.onAdd.call(this, fn);
            if (custom.condition){
                condition = function(event){
                    if (custom.condition.call(this, event)) return fn.call(this, event);
                    return true;
                };
            }
            realType = custom.base || realType;
        }
        var defn = function(){
            return fn.call(self);
        };
        var nativeEvent = Element.NativeEvents[realType];
        if (nativeEvent){
            if (nativeEvent == 2){
                defn = function(event){
                    event = new Event(event, self.getWindow());
                    if (condition.call(self, event) === false) event.stop();
                };
            }
            this.addListener(realType, defn);
        }
        events[type].values.push(defn);
        return this;
    },

    removeEvent: function(type, fn){
        var events = this.retrieve('events');
        if (!events || !events[type]) return this;
        var pos = events[type].keys.indexOf(fn);
        if (pos == -1) return this;
        events[type].keys.splice(pos, 1);
        var value = events[type].values.splice(pos, 1)[0];
        var custom = Element.Events.get(type);
        if (custom){
            if (custom.onRemove) custom.onRemove.call(this, fn);
            type = custom.base || type;
        }
        return (Element.NativeEvents[type]) ? this.removeListener(type, value) : this;
    },

    addEvents: function(events){
        for (var event in events) this.addEvent(event, events[event]);
        return this;
    },

    removeEvents: function(events){
        var type;
        if ($type(events) == 'object'){
            for (type in events) this.removeEvent(type, events[type]);
            return this;
        }
        var attached = this.retrieve('events');
        if (!attached) return this;
        if (!events){
            for (type in attached) this.removeEvents(type);
            this.eliminate('events');
        } else if (attached[events]){
            while (attached[events].keys[0]) this.removeEvent(events, attached[events].keys[0]);
            attached[events] = null;
        }
        return this;
    },

    fireEvent: function(type, args, delay){
        var events = this.retrieve('events');
        if (!events || !events[type]) return this;
        events[type].keys.each(function(fn){
            fn.create({'bind': this, 'delay': delay, 'arguments': args})();
        }, this);
        return this;
    },

    cloneEvents: function(from, type){
        from = document.id(from);
        var fevents = from.retrieve('events');
        if (!fevents) return this;
        if (!type){
            for (var evType in fevents) this.cloneEvents(from, evType);
        } else if (fevents[type]){
            fevents[type].keys.each(function(fn){
                this.addEvent(type, fn);
            }, this);
        }
        return this;
    }

});

Element.NativeEvents = {
    click: 2, dblclick: 2, mouseup: 2, mousedown: 2, contextmenu: 2, //mouse buttons
    mousewheel: 2, DOMMouseScroll: 2, //mouse wheel
    mouseover: 2, mouseout: 2, mousemove: 2, selectstart: 2, selectend: 2, //mouse movement
    keydown: 2, keypress: 2, keyup: 2, //keyboard
    focus: 2, blur: 2, change: 2, reset: 2, select: 2, submit: 2, //form elements
    load: 1, unload: 1, beforeunload: 2, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
    error: 1, abort: 1, scroll: 1 //misc
};

(function(){

var $check = function(event){
    var related = event.relatedTarget;
    if (related == undefined) return true;
    if (related === false) return false;
    return ($type(this) != 'document' && related != this && related.prefix != 'xul' && !this.hasChild(related));
};

Element.Events = new Hash({

    mouseenter: {
        base: 'mouseover',
        condition: $check
    },

    mouseleave: {
        base: 'mouseout',
        condition: $check
    },

    mousewheel: {
        base: (Browser.Engine.gecko) ? 'DOMMouseScroll' : 'mousewheel'
    }

});

})();
/*
---

script: Element.Style.js

description: Contains methods for interacting with the styles of Elements in a fashionable way.

license: MIT-style license.

requires:
- /Element

provides: [Element.Style]

...
*/

Element.Properties.styles = {set: function(styles){
    this.setStyles(styles);
}};

Element.Properties.opacity = {

    set: function(opacity, novisibility){
        if (!novisibility){
            if (opacity == 0){
                if (this.style.visibility != 'hidden') this.style.visibility = 'hidden';
            } else {
                if (this.style.visibility != 'visible') this.style.visibility = 'visible';
            }
        }
        if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
        if (Browser.Engine.trident) this.style.filter = (opacity == 1) ? '' : 'alpha(opacity=' + opacity * 100 + ')';
        this.style.opacity = opacity;
        this.store('opacity', opacity);
    },

    get: function(){
        return this.retrieve('opacity', 1);
    }

};

Element.implement({

    setOpacity: function(value){
        return this.set('opacity', value, true);
    },

    getOpacity: function(){
        return this.get('opacity');
    },

    setStyle: function(property, value){
        switch (property){
            case 'opacity': return this.set('opacity', parseFloat(value));
            case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
        }
        property = property.camelCase();
        if ($type(value) != 'string'){
            var map = (Element.Styles.get(property) || '@').split(' ');
            value = $splat(value).map(function(val, i){
                if (!map[i]) return '';
                return ($type(val) == 'number') ? map[i].replace('@', Math.round(val)) : val;
            }).join(' ');
        } else if (value == String(Number(value))){
            value = Math.round(value);
        }
        this.style[property] = value;
        return this;
    },

    getStyle: function(property){
        switch (property){
            case 'opacity': return this.get('opacity');
            case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
        }
        property = property.camelCase();
        var result = this.style[property];
        if (!$chk(result)){
            result = [];
            for (var style in Element.ShortStyles){
                if (property != style) continue;
                for (var s in Element.ShortStyles[style]) result.push(this.getStyle(s));
                return result.join(' ');
            }
            result = this.getComputedStyle(property);
        }
        if (result){
            result = String(result);
            var color = result.match(/rgba?\([\d\s,]+\)/);
            if (color) result = result.replace(color[0], color[0].rgbToHex());
        }
        if (Browser.Engine.presto || (Browser.Engine.trident && !$chk(parseInt(result, 10)))){
            if (property.test(/^(height|width)$/)){
                var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
                values.each(function(value){
                    size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
                }, this);
                return this['offset' + property.capitalize()] - size + 'px';
            }
            if ((Browser.Engine.presto) && String(result).test('px')) return result;
            if (property.test(/(border(.+)Width|margin|padding)/)) return '0px';
        }
        return result;
    },

    setStyles: function(styles){
        for (var style in styles) this.setStyle(style, styles[style]);
        return this;
    },

    getStyles: function(){
        var result = {};
        Array.flatten(arguments).each(function(key){
            result[key] = this.getStyle(key);
        }, this);
        return result;
    }

});

Element.Styles = new Hash({
    left: '@px', top: '@px', bottom: '@px', right: '@px',
    width: '@px', height: '@px', maxWidth: '@px', maxHeight: '@px', minWidth: '@px', minHeight: '@px',
    backgroundColor: 'rgb(@, @, @)', backgroundPosition: '@px @px', color: 'rgb(@, @, @)',
    fontSize: '@px', letterSpacing: '@px', lineHeight: '@px', clip: 'rect(@px @px @px @px)',
    margin: '@px @px @px @px', padding: '@px @px @px @px', border: '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
    borderWidth: '@px @px @px @px', borderStyle: '@ @ @ @', borderColor: 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
    zIndex: '@', 'zoom': '@', fontWeight: '@', textIndent: '@px', opacity: '@'
});

Element.ShortStyles = {margin: {}, padding: {}, border: {}, borderWidth: {}, borderStyle: {}, borderColor: {}};

['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
    var Short = Element.ShortStyles;
    var All = Element.Styles;
    ['margin', 'padding'].each(function(style){
        var sd = style + direction;
        Short[style][sd] = All[sd] = '@px';
    });
    var bd = 'border' + direction;
    Short.border[bd] = All[bd] = '@px @ rgb(@, @, @)';
    var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
    Short[bd] = {};
    Short.borderWidth[bdw] = Short[bd][bdw] = All[bdw] = '@px';
    Short.borderStyle[bds] = Short[bd][bds] = All[bds] = '@';
    Short.borderColor[bdc] = Short[bd][bdc] = All[bdc] = 'rgb(@, @, @)';
});
/*
---

script: Element.Dimensions.js

description: Contains methods to work with size, scroll, or positioning of Elements and the window object.

license: MIT-style license.

credits:
- Element positioning based on the [qooxdoo](http://qooxdoo.org/) code and smart browser fixes, [LGPL License](http://www.gnu.org/licenses/lgpl.html).
- Viewport dimensions based on [YUI](http://developer.yahoo.com/yui/) code, [BSD License](http://developer.yahoo.com/yui/license.html).

requires:
- /Element

provides: [Element.Dimensions]

...
*/

(function(){

Element.implement({

    scrollTo: function(x, y){
        if (isBody(this)){
            this.getWindow().scrollTo(x, y);
        } else {
            this.scrollLeft = x;
            this.scrollTop = y;
        }
        return this;
    },

    getSize: function(){
        if (isBody(this)) return this.getWindow().getSize();
        return {x: this.offsetWidth, y: this.offsetHeight};
    },

    getScrollSize: function(){
        if (isBody(this)) return this.getWindow().getScrollSize();
        return {x: this.scrollWidth, y: this.scrollHeight};
    },

    getScroll: function(){
        if (isBody(this)) return this.getWindow().getScroll();
        return {x: this.scrollLeft, y: this.scrollTop};
    },

    getScrolls: function(){
        var element = this, position = {x: 0, y: 0};
        while (element && !isBody(element)){
            position.x += element.scrollLeft;
            position.y += element.scrollTop;
            element = element.parentNode;
        }
        return position;
    },

    getOffsetParent: function(){
        var element = this;
        if (isBody(element)) return null;
        if (!Browser.Engine.trident) return element.offsetParent;
        while ((element = element.parentNode) && !isBody(element)){
            if (styleString(element, 'position') != 'static') return element;
        }
        return null;
    },

    getOffsets: function(){
        if (this.getBoundingClientRect){
            var bound = this.getBoundingClientRect(),
                html = document.id(this.getDocument().documentElement),
                htmlScroll = html.getScroll(),
                elemScrolls = this.getScrolls(),
                elemScroll = this.getScroll(),
                isFixed = (styleString(this, 'position') == 'fixed');

            return {
                x: bound.left.toInt() + elemScrolls.x - elemScroll.x + ((isFixed) ? 0 : htmlScroll.x) - html.clientLeft,
                y: bound.top.toInt()  + elemScrolls.y - elemScroll.y + ((isFixed) ? 0 : htmlScroll.y) - html.clientTop
            };
        }

        var element = this, position = {x: 0, y: 0};
        if (isBody(this)) return position;

        while (element && !isBody(element)){
            position.x += element.offsetLeft;
            position.y += element.offsetTop;

            if (Browser.Engine.gecko){
                if (!borderBox(element)){
                    position.x += leftBorder(element);
                    position.y += topBorder(element);
                }
                var parent = element.parentNode;
                if (parent && styleString(parent, 'overflow') != 'visible'){
                    position.x += leftBorder(parent);
                    position.y += topBorder(parent);
                }
            } else if (element != this && Browser.Engine.webkit){
                position.x += leftBorder(element);
                position.y += topBorder(element);
            }

            element = element.offsetParent;
        }
        if (Browser.Engine.gecko && !borderBox(this)){
            position.x -= leftBorder(this);
            position.y -= topBorder(this);
        }
        return position;
    },

    getPosition: function(relative){
        if (isBody(this)) return {x: 0, y: 0};
        var offset = this.getOffsets(),
                scroll = this.getScrolls();
        var position = {
            x: offset.x - scroll.x,
            y: offset.y - scroll.y
        };
        var relativePosition = (relative && (relative = document.id(relative))) ? relative.getPosition() : {x: 0, y: 0};
        return {x: position.x - relativePosition.x, y: position.y - relativePosition.y};
    },

    getCoordinates: function(element){
        if (isBody(this)) return this.getWindow().getCoordinates();
        var position = this.getPosition(element),
                size = this.getSize();
        var obj = {
            left: position.x,
            top: position.y,
            width: size.x,
            height: size.y
        };
        obj.right = obj.left + obj.width;
        obj.bottom = obj.top + obj.height;
        return obj;
    },

    computePosition: function(obj){
        return {
            left: obj.x - styleNumber(this, 'margin-left'),
            top: obj.y - styleNumber(this, 'margin-top')
        };
    },

    setPosition: function(obj){
        return this.setStyles(this.computePosition(obj));
    }

});


Native.implement([Document, Window], {

    getSize: function(){
        if (Browser.Engine.presto || Browser.Engine.webkit){
            var win = this.getWindow();
            return {x: win.innerWidth, y: win.innerHeight};
        }
        var doc = getCompatElement(this);
        return {x: doc.clientWidth, y: doc.clientHeight};
    },

    getScroll: function(){
        var win = this.getWindow(), doc = getCompatElement(this);
        return {x: win.pageXOffset || doc.scrollLeft, y: win.pageYOffset || doc.scrollTop};
    },

    getScrollSize: function(){
        var doc = getCompatElement(this), min = this.getSize();
        return {x: Math.max(doc.scrollWidth, min.x), y: Math.max(doc.scrollHeight, min.y)};
    },

    getPosition: function(){
        return {x: 0, y: 0};
    },

    getCoordinates: function(){
        var size = this.getSize();
        return {top: 0, left: 0, bottom: size.y, right: size.x, height: size.y, width: size.x};
    }

});

// private methods

var styleString = Element.getComputedStyle;

function styleNumber(element, style){
    return styleString(element, style).toInt() || 0;
};

function borderBox(element){
    return styleString(element, '-moz-box-sizing') == 'border-box';
};

function topBorder(element){
    return styleNumber(element, 'border-top-width');
};

function leftBorder(element){
    return styleNumber(element, 'border-left-width');
};

function isBody(element){
    return (/^(?:body|html)$/i).test(element.tagName);
};

function getCompatElement(element){
    var doc = element.getDocument();
    return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
};

})();

//aliases
Element.alias('setPosition', 'position'); //compatability

Native.implement([Window, Document, Element], {

    getHeight: function(){
        return this.getSize().y;
    },

    getWidth: function(){
        return this.getSize().x;
    },

    getScrollTop: function(){
        return this.getScroll().y;
    },

    getScrollLeft: function(){
        return this.getScroll().x;
    },

    getScrollHeight: function(){
        return this.getScrollSize().y;
    },

    getScrollWidth: function(){
        return this.getScrollSize().x;
    },

    getTop: function(){
        return this.getPosition().y;
    },

    getLeft: function(){
        return this.getPosition().x;
    }

});
/*
---

script: Selectors.js

description: Adds advanced CSS-style querying capabilities for targeting HTML Elements. Includes pseudo selectors.

license: MIT-style license.

requires:
- /Element

provides: [Selectors]

...
*/

Native.implement([Document, Element], {

    getElements: function(expression, nocash){
        expression = expression.split(',');
        var items, local = {};
        for (var i = 0, l = expression.length; i < l; i++){
            var selector = expression[i], elements = Selectors.Utils.search(this, selector, local);
            if (i != 0 && elements.item) elements = $A(elements);
            items = (i == 0) ? elements : (items.item) ? $A(items).concat(elements) : items.concat(elements);
        }
        return new Elements(items, {ddup: (expression.length > 1), cash: !nocash});
    }

});

Element.implement({

    match: function(selector){
        if (!selector || (selector == this)) return true;
        var tagid = Selectors.Utils.parseTagAndID(selector);
        var tag = tagid[0], id = tagid[1];
        if (!Selectors.Filters.byID(this, id) || !Selectors.Filters.byTag(this, tag)) return false;
        var parsed = Selectors.Utils.parseSelector(selector);
        return (parsed) ? Selectors.Utils.filter(this, parsed, {}) : true;
    }

});

var Selectors = {Cache: {nth: {}, parsed: {}}};

Selectors.RegExps = {
    id: (/#([\w-]+)/),
    tag: (/^(\w+|\*)/),
    quick: (/^(\w+|\*)$/),
    splitter: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),
    combined: (/\.([\w-]+)|\[(\w+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g)
};

Selectors.Utils = {

    chk: function(item, uniques){
        if (!uniques) return true;
        var uid = $uid(item);
        if (!uniques[uid]) return uniques[uid] = true;
        return false;
    },

    parseNthArgument: function(argument){
        if (Selectors.Cache.nth[argument]) return Selectors.Cache.nth[argument];
        var parsed = argument.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
        if (!parsed) return false;
        var inta = parseInt(parsed[1], 10);
        var a = (inta || inta === 0) ? inta : 1;
        var special = parsed[2] || false;
        var b = parseInt(parsed[3], 10) || 0;
        if (a != 0){
            b--;
            while (b < 1) b += a;
            while (b >= a) b -= a;
        } else {
            a = b;
            special = 'index';
        }
        switch (special){
            case 'n': parsed = {a: a, b: b, special: 'n'}; break;
            case 'odd': parsed = {a: 2, b: 0, special: 'n'}; break;
            case 'even': parsed = {a: 2, b: 1, special: 'n'}; break;
            case 'first': parsed = {a: 0, special: 'index'}; break;
            case 'last': parsed = {special: 'last-child'}; break;
            case 'only': parsed = {special: 'only-child'}; break;
            default: parsed = {a: (a - 1), special: 'index'};
        }

        return Selectors.Cache.nth[argument] = parsed;
    },

    parseSelector: function(selector){
        if (Selectors.Cache.parsed[selector]) return Selectors.Cache.parsed[selector];
        var m, parsed = {classes: [], pseudos: [], attributes: []};
        while ((m = Selectors.RegExps.combined.exec(selector))){
            var cn = m[1], an = m[2], ao = m[3], av = m[5], pn = m[6], pa = m[7];
            if (cn){
                parsed.classes.push(cn);
            } else if (pn){
                var parser = Selectors.Pseudo.get(pn);
                if (parser) parsed.pseudos.push({parser: parser, argument: pa});
                else parsed.attributes.push({name: pn, operator: '=', value: pa});
            } else if (an){
                parsed.attributes.push({name: an, operator: ao, value: av});
            }
        }
        if (!parsed.classes.length) delete parsed.classes;
        if (!parsed.attributes.length) delete parsed.attributes;
        if (!parsed.pseudos.length) delete parsed.pseudos;
        if (!parsed.classes && !parsed.attributes && !parsed.pseudos) parsed = null;
        return Selectors.Cache.parsed[selector] = parsed;
    },

    parseTagAndID: function(selector){
        var tag = selector.match(Selectors.RegExps.tag);
        var id = selector.match(Selectors.RegExps.id);
        return [(tag) ? tag[1] : '*', (id) ? id[1] : false];
    },

    filter: function(item, parsed, local){
        var i;
        if (parsed.classes){
            for (i = parsed.classes.length; i--; i){
                var cn = parsed.classes[i];
                if (!Selectors.Filters.byClass(item, cn)) return false;
            }
        }
        if (parsed.attributes){
            for (i = parsed.attributes.length; i--; i){
                var att = parsed.attributes[i];
                if (!Selectors.Filters.byAttribute(item, att.name, att.operator, att.value)) return false;
            }
        }
        if (parsed.pseudos){
            for (i = parsed.pseudos.length; i--; i){
                var psd = parsed.pseudos[i];
                if (!Selectors.Filters.byPseudo(item, psd.parser, psd.argument, local)) return false;
            }
        }
        return true;
    },

    getByTagAndID: function(ctx, tag, id){
        if (id){
            var item = (ctx.getElementById) ? ctx.getElementById(id, true) : Element.getElementById(ctx, id, true);
            return (item && Selectors.Filters.byTag(item, tag)) ? [item] : [];
        } else {
            return ctx.getElementsByTagName(tag);
        }
    },

    search: function(self, expression, local){
        var splitters = [];

        var selectors = expression.trim().replace(Selectors.RegExps.splitter, function(m0, m1, m2){
            splitters.push(m1);
            return ':)' + m2;
        }).split(':)');

        var items, filtered, item;

        for (var i = 0, l = selectors.length; i < l; i++){

            var selector = selectors[i];

            if (i == 0 && Selectors.RegExps.quick.test(selector)){
                items = self.getElementsByTagName(selector);
                continue;
            }

            var splitter = splitters[i - 1];

            var tagid = Selectors.Utils.parseTagAndID(selector);
            var tag = tagid[0], id = tagid[1];

            if (i == 0){
                items = Selectors.Utils.getByTagAndID(self, tag, id);
            } else {
                var uniques = {}, found = [];
                for (var j = 0, k = items.length; j < k; j++) found = Selectors.Getters[splitter](found, items[j], tag, id, uniques);
                items = found;
            }

            var parsed = Selectors.Utils.parseSelector(selector);

            if (parsed){
                filtered = [];
                for (var m = 0, n = items.length; m < n; m++){
                    item = items[m];
                    if (Selectors.Utils.filter(item, parsed, local)) filtered.push(item);
                }
                items = filtered;
            }

        }

        return items;

    }

};

Selectors.Getters = {

    ' ': function(found, self, tag, id, uniques){
        var items = Selectors.Utils.getByTagAndID(self, tag, id);
        for (var i = 0, l = items.length; i < l; i++){
            var item = items[i];
            if (Selectors.Utils.chk(item, uniques)) found.push(item);
        }
        return found;
    },

    '>': function(found, self, tag, id, uniques){
        var children = Selectors.Utils.getByTagAndID(self, tag, id);
        for (var i = 0, l = children.length; i < l; i++){
            var child = children[i];
            if (child.parentNode == self && Selectors.Utils.chk(child, uniques)) found.push(child);
        }
        return found;
    },

    '+': function(found, self, tag, id, uniques){
        while ((self = self.nextSibling)){
            if (self.nodeType == 1){
                if (Selectors.Utils.chk(self, uniques) && Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
                break;
            }
        }
        return found;
    },

    '~': function(found, self, tag, id, uniques){
        while ((self = self.nextSibling)){
            if (self.nodeType == 1){
                if (!Selectors.Utils.chk(self, uniques)) break;
                if (Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
            }
        }
        return found;
    }

};

Selectors.Filters = {

    byTag: function(self, tag){
        return (tag == '*' || (self.tagName && self.tagName.toLowerCase() == tag));
    },

    byID: function(self, id){
        return (!id || (self.id && self.id == id));
    },

    byClass: function(self, klass){
        return (self.className && self.className.contains && self.className.contains(klass, ' '));
    },

    byPseudo: function(self, parser, argument, local){
        return parser.call(self, argument, local);
    },

    byAttribute: function(self, name, operator, value){
        var result = Element.prototype.getProperty.call(self, name);
        if (!result) return (operator == '!=');
        if (!operator || value == undefined) return true;
        switch (operator){
            case '=': return (result == value);
            case '*=': return (result.contains(value));
            case '^=': return (result.substr(0, value.length) == value);
            case '$=': return (result.substr(result.length - value.length) == value);
            case '!=': return (result != value);
            case '~=': return result.contains(value, ' ');
            case '|=': return result.contains(value, '-');
        }
        return false;
    }

};

Selectors.Pseudo = new Hash({

    // w3c pseudo selectors

    checked: function(){
        return this.checked;
    },
    
    empty: function(){
        return !(this.innerText || this.textContent || '').length;
    },

    not: function(selector){
        return !Element.match(this, selector);
    },

    contains: function(text){
        return (this.innerText || this.textContent || '').contains(text);
    },

    'first-child': function(){
        return Selectors.Pseudo.index.call(this, 0);
    },

    'last-child': function(){
        var element = this;
        while ((element = element.nextSibling)){
            if (element.nodeType == 1) return false;
        }
        return true;
    },

    'only-child': function(){
        var prev = this;
        while ((prev = prev.previousSibling)){
            if (prev.nodeType == 1) return false;
        }
        var next = this;
        while ((next = next.nextSibling)){
            if (next.nodeType == 1) return false;
        }
        return true;
    },

    'nth-child': function(argument, local){
        argument = (argument == undefined) ? 'n' : argument;
        var parsed = Selectors.Utils.parseNthArgument(argument);
        if (parsed.special != 'n') return Selectors.Pseudo[parsed.special].call(this, parsed.a, local);
        var count = 0;
        local.positions = local.positions || {};
        var uid = $uid(this);
        if (!local.positions[uid]){
            var self = this;
            while ((self = self.previousSibling)){
                if (self.nodeType != 1) continue;
                count ++;
                var position = local.positions[$uid(self)];
                if (position != undefined){
                    count = position + count;
                    break;
                }
            }
            local.positions[uid] = count;
        }
        return (local.positions[uid] % parsed.a == parsed.b);
    },

    // custom pseudo selectors

    index: function(index){
        var element = this, count = 0;
        while ((element = element.previousSibling)){
            if (element.nodeType == 1 && ++count > index) return false;
        }
        return (count == index);
    },

    even: function(argument, local){
        return Selectors.Pseudo['nth-child'].call(this, '2n+1', local);
    },

    odd: function(argument, local){
        return Selectors.Pseudo['nth-child'].call(this, '2n', local);
    },
    
    selected: function(){
        return this.selected;
    },
    
    enabled: function(){
        return (this.disabled === false);
    }

});
/*
---

script: DomReady.js

description: Contains the custom event domready.

license: MIT-style license.

requires:
- /Element.Event

provides: [DomReady]

...
*/

Element.Events.domready = {

    onAdd: function(fn){
        if (Browser.loaded) fn.call(this);
    }

};

(function(){

    var domready = function(){
        if (Browser.loaded) return;
        Browser.loaded = true;
        window.fireEvent('domready');
        document.fireEvent('domready');
    };
    
    window.addEvent('load', domready);

    if (Browser.Engine.trident){
        var temp = document.createElement('div');
        (function(){
            ($try(function(){
                temp.doScroll(); // Technique by Diego Perini
                return document.id(temp).inject(document.body).set('html', 'temp').dispose();
            })) ? domready() : arguments.callee.delay(50);
        })();
    } else if (Browser.Engine.webkit && Browser.Engine.version < 525){
        (function(){
            (['loaded', 'complete'].contains(document.readyState)) ? domready() : arguments.callee.delay(50);
        })();
    } else {
        document.addEvent('DOMContentLoaded', domready);
    }

})();
/*
---

script: JSON.js

description: JSON encoder and decoder.

license: MIT-style license.

See Also: <http://www.json.org/>

requires:
- /Array
- /String
- /Number
- /Function
- /Hash

provides: [JSON]

...
*/

var JSON = new Hash(this.JSON && {
    stringify: JSON.stringify,
    parse: JSON.parse
}).extend({
    
    $specialChars: {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'},

    $replaceChars: function(chr){
        return JSON.$specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
    },

    encode: function(obj){
        switch ($type(obj)){
            case 'string':
                return '"' + obj.replace(/[\x00-\x1f\\"]/g, JSON.$replaceChars) + '"';
            case 'array':
                return '[' + String(obj.map(JSON.encode).clean()) + ']';
            case 'object': case 'hash':
                var string = [];
                Hash.each(obj, function(value, key){
                    var json = JSON.encode(value);
                    if (json) string.push(JSON.encode(key) + ':' + json);
                });
                return '{' + string + '}';
            case 'number': case 'boolean': return String(obj);
            case false: return 'null';
        }
        return null;
    },

    decode: function(string, secure){
        if ($type(string) != 'string' || !string.length) return null;
        if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
        return eval('(' + string + ')');
    }

});

Native.implement([Hash, Array, String, Number], {

    toJSON: function(){
        return JSON.encode(this);
    }

});
/*
---

script: Cookie.js

description: Class for creating, reading, and deleting browser Cookies.

license: MIT-style license.

credits:
- Based on the functions by Peter-Paul Koch (http://quirksmode.org).

requires:
- /Options

provides: [Cookie]

...
*/

var Cookie = new Class({

    Implements: Options,

    options: {
        path: false,
        domain: false,
        duration: false,
        secure: false,
        document: document
    },

    initialize: function(key, options){
        this.key = key;
        this.setOptions(options);
    },

    write: function(value){
        value = encodeURIComponent(value);
        if (this.options.domain) value += '; domain=' + this.options.domain;
        if (this.options.path) value += '; path=' + this.options.path;
        if (this.options.duration){
            var date = new Date();
            date.setTime(date.getTime() + this.options.duration * 24 * 60 * 60 * 1000);
            value += '; expires=' + date.toGMTString();
        }
        if (this.options.secure) value += '; secure';
        this.options.document.cookie = this.key + '=' + value;
        return this;
    },

    read: function(){
        var value = this.options.document.cookie.match('(?:^|;)\\s*' + this.key.escapeRegExp() + '=([^;]*)');
        return (value) ? decodeURIComponent(value[1]) : null;
    },

    dispose: function(){
        new Cookie(this.key, $merge(this.options, {duration: -1})).write('');
        return this;
    }

});

Cookie.write = function(key, value, options){
    return new Cookie(key, options).write(value);
};

Cookie.read = function(key){
    return new Cookie(key).read();
};

Cookie.dispose = function(key, options){
    return new Cookie(key, options).dispose();
};
/*
---

script: Swiff.js

description: Wrapper for embedding SWF movies. Supports External Interface Communication.

license: MIT-style license.

credits: 
- Flash detection & Internet Explorer + Flash Player 9 fix inspired by SWFObject.

requires:
- /Options
- /$util

provides: [Swiff]

...
*/

var Swiff = new Class({

    Implements: [Options],

    options: {
        id: null,
        height: 1,
        width: 1,
        container: null,
        properties: {},
        params: {
            quality: 'high',
            allowScriptAccess: 'always',
            wMode: 'transparent',
            swLiveConnect: true
        },
        callBacks: {},
        vars: {}
    },

    toElement: function(){
        return this.object;
    },

    initialize: function(path, options){
        this.instance = 'Swiff_' + $time();

        this.setOptions(options);
        options = this.options;
        var id = this.id = options.id || this.instance;
        var container = document.id(options.container);

        Swiff.CallBacks[this.instance] = {};

        var params = options.params, vars = options.vars, callBacks = options.callBacks;
        var properties = $extend({height: options.height, width: options.width}, options.properties);

        var self = this;

        for (var callBack in callBacks){
            Swiff.CallBacks[this.instance][callBack] = (function(option){
                return function(){
                    return option.apply(self.object, arguments);
                };
            })(callBacks[callBack]);
            vars[callBack] = 'Swiff.CallBacks.' + this.instance + '.' + callBack;
        }

        params.flashVars = Hash.toQueryString(vars);
        if (Browser.Engine.trident){
            properties.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
            params.movie = path;
        } else {
            properties.type = 'application/x-shockwave-flash';
            properties.data = path;
        }
        var build = '<object id="' + id + '"';
        for (var property in properties) build += ' ' + property + '="' + properties[property] + '"';
        build += '>';
        for (var param in params){
            if (params[param]) build += '<param name="' + param + '" value="' + params[param] + '" />';
        }
        build += '</object>';
        this.object = ((container) ? container.empty() : new Element('div')).set('html', build).firstChild;
    },

    replaces: function(element){
        element = document.id(element, true);
        element.parentNode.replaceChild(this.toElement(), element);
        return this;
    },

    inject: function(element){
        document.id(element, true).appendChild(this.toElement());
        return this;
    },

    remote: function(){
        return Swiff.remote.apply(Swiff, [this.toElement()].extend(arguments));
    }

});

Swiff.CallBacks = {};

Swiff.remote = function(obj, fn){
    var rs = obj.CallFunction('<invoke name="' + fn + '" returntype="javascript">' + __flash__argumentsToXML(arguments, 2) + '</invoke>');
    return eval(rs);
};
/*
---

script: Fx.js

description: Contains the basic animation logic to be extended by all other Fx Classes.

license: MIT-style license.

requires:
- /Chain
- /Events
- /Options

provides: [Fx]

...
*/

var Fx = new Class({

    Implements: [Chain, Events, Options],

    options: {
        /*
        onStart: $empty,
        onCancel: $empty,
        onComplete: $empty,
        */
        fps: 50,
        unit: false,
        duration: 500,
        link: 'ignore'
    },

    initialize: function(options){
        this.subject = this.subject || this;
        this.setOptions(options);
        this.options.duration = Fx.Durations[this.options.duration] || this.options.duration.toInt();
        var wait = this.options.wait;
        if (wait === false) this.options.link = 'cancel';
    },

    getTransition: function(){
        return function(p){
            return -(Math.cos(Math.PI * p) - 1) / 2;
        };
    },

    step: function(){
        var time = $time();
        if (time < this.time + this.options.duration){
            var delta = this.transition((time - this.time) / this.options.duration);
            this.set(this.compute(this.from, this.to, delta));
        } else {
            this.set(this.compute(this.from, this.to, 1));
            this.complete();
        }
    },

    set: function(now){
        return now;
    },

    compute: function(from, to, delta){
        return Fx.compute(from, to, delta);
    },

    check: function(){
        if (!this.timer) return true;
        switch (this.options.link){
            case 'cancel': this.cancel(); return true;
            case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
        }
        return false;
    },

    start: function(from, to){
        if (!this.check(from, to)) return this;
        this.from = from;
        this.to = to;
        this.time = 0;
        this.transition = this.getTransition();
        this.startTimer();
        this.onStart();
        return this;
    },

    complete: function(){
        if (this.stopTimer()) this.onComplete();
        return this;
    },

    cancel: function(){
        if (this.stopTimer()) this.onCancel();
        return this;
    },

    onStart: function(){
        this.fireEvent('start', this.subject);
    },

    onComplete: function(){
        this.fireEvent('complete', this.subject);
        if (!this.callChain()) this.fireEvent('chainComplete', this.subject);
    },

    onCancel: function(){
        this.fireEvent('cancel', this.subject).clearChain();
    },

    pause: function(){
        this.stopTimer();
        return this;
    },

    resume: function(){
        this.startTimer();
        return this;
    },

    stopTimer: function(){
        if (!this.timer) return false;
        this.time = $time() - this.time;
        this.timer = $clear(this.timer);
        return true;
    },

    startTimer: function(){
        if (this.timer) return false;
        this.time = $time() - this.time;
        this.timer = this.step.periodical(Math.round(1000 / this.options.fps), this);
        return true;
    }

});

Fx.compute = function(from, to, delta){
    return (to - from) * delta + from;
};

Fx.Durations = {'short': 250, 'normal': 500, 'long': 1000};
/*
---

script: Fx.CSS.js

description: Contains the CSS animation logic. Used by Fx.Tween, Fx.Morph, Fx.Elements.

license: MIT-style license.

requires:
- /Fx
- /Element.Style

provides: [Fx.CSS]

...
*/

Fx.CSS = new Class({

    Extends: Fx,

    //prepares the base from/to object

    prepare: function(element, property, values){
        values = $splat(values);
        var values1 = values[1];
        if (!$chk(values1)){
            values[1] = values[0];
            values[0] = element.getStyle(property);
        }
        var parsed = values.map(this.parse);
        return {from: parsed[0], to: parsed[1]};
    },

    //parses a value into an array

    parse: function(value){
        value = $lambda(value)();
        value = (typeof value == 'string') ? value.split(' ') : $splat(value);
        return value.map(function(val){
            val = String(val);
            var found = false;
            Fx.CSS.Parsers.each(function(parser, key){
                if (found) return;
                var parsed = parser.parse(val);
                if ($chk(parsed)) found = {value: parsed, parser: parser};
            });
            found = found || {value: val, parser: Fx.CSS.Parsers.String};
            return found;
        });
    },

    //computes by a from and to prepared objects, using their parsers.

    compute: function(from, to, delta){
        var computed = [];
        (Math.min(from.length, to.length)).times(function(i){
            computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
        });
        computed.$family = {name: 'fx:css:value'};
        return computed;
    },

    //serves the value as settable

    serve: function(value, unit){
        if ($type(value) != 'fx:css:value') value = this.parse(value);
        var returned = [];
        value.each(function(bit){
            returned = returned.concat(bit.parser.serve(bit.value, unit));
        });
        return returned;
    },

    //renders the change to an element

    render: function(element, property, value, unit){
        element.setStyle(property, this.serve(value, unit));
    },

    //searches inside the page css to find the values for a selector

    search: function(selector){
        if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
        var to = {};
        Array.each(document.styleSheets, function(sheet, j){
            var href = sheet.href;
            if (href && href.contains('://') && !href.contains(document.domain)) return;
            var rules = sheet.rules || sheet.cssRules;
            Array.each(rules, function(rule, i){
                if (!rule.style) return;
                var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
                    return m.toLowerCase();
                }) : null;
                if (!selectorText || !selectorText.test('^' + selector + '$')) return;
                Element.Styles.each(function(value, style){
                    if (!rule.style[style] || Element.ShortStyles[style]) return;
                    value = String(rule.style[style]);
                    to[style] = (value.test(/^rgb/)) ? value.rgbToHex() : value;
                });
            });
        });
        return Fx.CSS.Cache[selector] = to;
    }

});

Fx.CSS.Cache = {};

Fx.CSS.Parsers = new Hash({

    Color: {
        parse: function(value){
            if (value.match(/^#[0-9a-f]{3,6}$/i)) return value.hexToRgb(true);
            return ((value = value.match(/(\d+),\s*(\d+),\s*(\d+)/))) ? [value[1], value[2], value[3]] : false;
        },
        compute: function(from, to, delta){
            return from.map(function(value, i){
                return Math.round(Fx.compute(from[i], to[i], delta));
            });
        },
        serve: function(value){
            return value.map(Number);
        }
    },

    Number: {
        parse: parseFloat,
        compute: Fx.compute,
        serve: function(value, unit){
            return (unit) ? value + unit : value;
        }
    },

    String: {
        parse: $lambda(false),
        compute: $arguments(1),
        serve: $arguments(0)
    }

});
/*
---

script: Fx.Tween.js

description: Formerly Fx.Style, effect to transition any CSS property for an element.

license: MIT-style license.

requires: 
- /Fx.CSS

provides: [Fx.Tween, Element.fade, Element.highlight]

...
*/

Fx.Tween = new Class({

    Extends: Fx.CSS,

    initialize: function(element, options){
        this.element = this.subject = document.id(element);
        this.parent(options);
    },

    set: function(property, now){
        if (arguments.length == 1){
            now = property;
            property = this.property || this.options.property;
        }
        this.render(this.element, property, now, this.options.unit);
        return this;
    },

    start: function(property, from, to){
        if (!this.check(property, from, to)) return this;
        var args = Array.flatten(arguments);
        this.property = this.options.property || args.shift();
        var parsed = this.prepare(this.element, this.property, args);
        return this.parent(parsed.from, parsed.to);
    }

});

Element.Properties.tween = {

    set: function(options){
        var tween = this.retrieve('tween');
        if (tween) tween.cancel();
        return this.eliminate('tween').store('tween:options', $extend({link: 'cancel'}, options));
    },

    get: function(options){
        if (options || !this.retrieve('tween')){
            if (options || !this.retrieve('tween:options')) this.set('tween', options);
            this.store('tween', new Fx.Tween(this, this.retrieve('tween:options')));
        }
        return this.retrieve('tween');
    }

};

Element.implement({

    tween: function(property, from, to){
        this.get('tween').start(arguments);
        return this;
    },

    fade: function(how){
        var fade = this.get('tween'), o = 'opacity', toggle;
        how = $pick(how, 'toggle');
        switch (how){
            case 'in': fade.start(o, 1); break;
            case 'out': fade.start(o, 0); break;
            case 'show': fade.set(o, 1); break;
            case 'hide': fade.set(o, 0); break;
            case 'toggle':
                var flag = this.retrieve('fade:flag', this.get('opacity') == 1);
                fade.start(o, (flag) ? 0 : 1);
                this.store('fade:flag', !flag);
                toggle = true;
            break;
            default: fade.start(o, arguments);
        }
        if (!toggle) this.eliminate('fade:flag');
        return this;
    },

    highlight: function(start, end){
        if (!end){
            end = this.retrieve('highlight:original', this.getStyle('background-color'));
            end = (end == 'transparent') ? '#fff' : end;
        }
        var tween = this.get('tween');
        tween.start('background-color', start || '#ffff88', end).chain(function(){
            this.setStyle('background-color', this.retrieve('highlight:original'));
            tween.callChain();
        }.bind(this));
        return this;
    }

});
/*
---

script: Fx.Morph.js

description: Formerly Fx.Styles, effect to transition any number of CSS properties for an element using an object of rules, or CSS based selector rules.

license: MIT-style license.

requires:
- /Fx.CSS

provides: [Fx.Morph]

...
*/

Fx.Morph = new Class({

    Extends: Fx.CSS,

    initialize: function(element, options){
        this.element = this.subject = document.id(element);
        this.parent(options);
    },

    set: function(now){
        if (typeof now == 'string') now = this.search(now);
        for (var p in now) this.render(this.element, p, now[p], this.options.unit);
        return this;
    },

    compute: function(from, to, delta){
        var now = {};
        for (var p in from) now[p] = this.parent(from[p], to[p], delta);
        return now;
    },

    start: function(properties){
        if (!this.check(properties)) return this;
        if (typeof properties == 'string') properties = this.search(properties);
        var from = {}, to = {};
        for (var p in properties){
            var parsed = this.prepare(this.element, p, properties[p]);
            from[p] = parsed.from;
            to[p] = parsed.to;
        }
        return this.parent(from, to);
    }

});

Element.Properties.morph = {

    set: function(options){
        var morph = this.retrieve('morph');
        if (morph) morph.cancel();
        return this.eliminate('morph').store('morph:options', $extend({link: 'cancel'}, options));
    },

    get: function(options){
        if (options || !this.retrieve('morph')){
            if (options || !this.retrieve('morph:options')) this.set('morph', options);
            this.store('morph', new Fx.Morph(this, this.retrieve('morph:options')));
        }
        return this.retrieve('morph');
    }

};

Element.implement({

    morph: function(props){
        this.get('morph').start(props);
        return this;
    }

});
/*
---

script: Fx.Transitions.js

description: Contains a set of advanced transitions to be used with any of the Fx Classes.

license: MIT-style license.

credits:
- Easing Equations by Robert Penner, <http://www.robertpenner.com/easing/>, modified and optimized to be used with MooTools.

requires:
- /Fx

provides: [Fx.Transitions]

...
*/

Fx.implement({

    getTransition: function(){
        var trans = this.options.transition || Fx.Transitions.Sine.easeInOut;
        if (typeof trans == 'string'){
            var data = trans.split(':');
            trans = Fx.Transitions;
            trans = trans[data[0]] || trans[data[0].capitalize()];
            if (data[1]) trans = trans['ease' + data[1].capitalize() + (data[2] ? data[2].capitalize() : '')];
        }
        return trans;
    }

});

Fx.Transition = function(transition, params){
    params = $splat(params);
    return $extend(transition, {
        easeIn: function(pos){
            return transition(pos, params);
        },
        easeOut: function(pos){
            return 1 - transition(1 - pos, params);
        },
        easeInOut: function(pos){
            return (pos <= 0.5) ? transition(2 * pos, params) / 2 : (2 - transition(2 * (1 - pos), params)) / 2;
        }
    });
};

Fx.Transitions = new Hash({

    linear: $arguments(0)

});

Fx.Transitions.extend = function(transitions){
    for (var transition in transitions) Fx.Transitions[transition] = new Fx.Transition(transitions[transition]);
};

Fx.Transitions.extend({

    Pow: function(p, x){
        return Math.pow(p, x[0] || 6);
    },

    Expo: function(p){
        return Math.pow(2, 8 * (p - 1));
    },

    Circ: function(p){
        return 1 - Math.sin(Math.acos(p));
    },

    Sine: function(p){
        return 1 - Math.sin((1 - p) * Math.PI / 2);
    },

    Back: function(p, x){
        x = x[0] || 1.618;
        return Math.pow(p, 2) * ((x + 1) * p - x);
    },

    Bounce: function(p){
        var value;
        for (var a = 0, b = 1; 1; a += b, b /= 2){
            if (p >= (7 - 4 * a) / 11){
                value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
                break;
            }
        }
        return value;
    },

    Elastic: function(p, x){
        return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
    }

});

['Quad', 'Cubic', 'Quart', 'Quint'].each(function(transition, i){
    Fx.Transitions[transition] = new Fx.Transition(function(p){
        return Math.pow(p, [i + 2]);
    });
});
/*
---

script: Request.js

description: Powerful all purpose Request Class. Uses XMLHTTPRequest.

license: MIT-style license.

requires:
- /Element
- /Chain
- /Events
- /Options
- /Browser

provides: [Request]

...
*/

var Request = new Class({

    Implements: [Chain, Events, Options],

    options: {/*
        onRequest: $empty,
        onComplete: $empty,
        onCancel: $empty,
        onSuccess: $empty,
        onFailure: $empty,
        onException: $empty,*/
        url: '',
        data: '',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
        },
        async: true,
        format: false,
        method: 'post',
        link: 'ignore',
        isSuccess: null,
        emulation: true,
        urlEncoded: true,
        encoding: 'utf-8',
        evalScripts: false,
        evalResponse: false,
        noCache: false
    },

    initialize: function(options){
        this.xhr = new Browser.Request();
        this.setOptions(options);
        this.options.isSuccess = this.options.isSuccess || this.isSuccess;
        this.headers = new Hash(this.options.headers);
    },

    onStateChange: function(){
        if (this.xhr.readyState != 4 || !this.running) return;
        this.running = false;
        this.status = 0;
        $try(function(){
            this.status = this.xhr.status;
        }.bind(this));
        this.xhr.onreadystatechange = $empty;
        if (this.options.isSuccess.call(this, this.status)){
            this.response = {text: this.xhr.responseText, xml: this.xhr.responseXML};
            this.success(this.response.text, this.response.xml);
        } else {
            this.response = {text: null, xml: null};
            this.failure();
        }
    },

    isSuccess: function(){
        return ((this.status >= 200) && (this.status < 300));
    },

    processScripts: function(text){
        if (this.options.evalResponse || (/(ecma|java)script/).test(this.getHeader('Content-type'))) return $exec(text);
        return text.stripScripts(this.options.evalScripts);
    },

    success: function(text, xml){
        this.onSuccess(this.processScripts(text), xml);
    },

    onSuccess: function(){
        this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
    },

    failure: function(){
        this.onFailure();
    },

    onFailure: function(){
        this.fireEvent('complete').fireEvent('failure', this.xhr);
    },

    setHeader: function(name, value){
        this.headers.set(name, value);
        return this;
    },

    getHeader: function(name){
        return $try(function(){
            return this.xhr.getResponseHeader(name);
        }.bind(this));
    },

    check: function(){
        if (!this.running) return true;
        switch (this.options.link){
            case 'cancel': this.cancel(); return true;
            case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
        }
        return false;
    },

    send: function(options){
        if (!this.check(options)) return this;
        this.running = true;

        var type = $type(options);
        if (type == 'string' || type == 'element') options = {data: options};

        var old = this.options;
        options = $extend({data: old.data, url: old.url, method: old.method}, options);
        var data = options.data, url = String(options.url), method = options.method.toLowerCase();

        switch ($type(data)){
            case 'element': data = document.id(data).toQueryString(); break;
            case 'object': case 'hash': data = Hash.toQueryString(data);
        }

        if (this.options.format){
            var format = 'format=' + this.options.format;
            data = (data) ? format + '&' + data : format;
        }

        if (this.options.emulation && !['get', 'post'].contains(method)){
            var _method = '_method=' + method;
            data = (data) ? _method + '&' + data : _method;
            method = 'post';
        }

        if (this.options.urlEncoded && method == 'post'){
            var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
            this.headers.set('Content-type', 'application/x-www-form-urlencoded' + encoding);
        }

        if (this.options.noCache){
            var noCache = 'noCache=' + new Date().getTime();
            data = (data) ? noCache + '&' + data : noCache;
        }

        var trimPosition = url.lastIndexOf('/');
        if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

        if (data && method == 'get'){
            url = url + (url.contains('?') ? '&' : '?') + data;
            data = null;
        }

        this.xhr.open(method.toUpperCase(), url, this.options.async);

        this.xhr.onreadystatechange = this.onStateChange.bind(this);

        this.headers.each(function(value, key){
            try {
                this.xhr.setRequestHeader(key, value);
            } catch (e){
                this.fireEvent('exception', [key, value]);
            }
        }, this);

        this.fireEvent('request');
        this.xhr.send(data);
        if (!this.options.async) this.onStateChange();
        return this;
    },

    cancel: function(){
        if (!this.running) return this;
        this.running = false;
        this.xhr.abort();
        this.xhr.onreadystatechange = $empty;
        this.xhr = new Browser.Request();
        this.fireEvent('cancel');
        return this;
    }

});

(function(){

var methods = {};
['get', 'post', 'put', 'delete', 'GET', 'POST', 'PUT', 'DELETE'].each(function(method){
    methods[method] = function(){
        var params = Array.link(arguments, {url: String.type, data: $defined});
        return this.send($extend(params, {method: method}));
    };
});

Request.implement(methods);

})();

Element.Properties.send = {

    set: function(options){
        var send = this.retrieve('send');
        if (send) send.cancel();
        return this.eliminate('send').store('send:options', $extend({
            data: this, link: 'cancel', method: this.get('method') || 'post', url: this.get('action')
        }, options));
    },

    get: function(options){
        if (options || !this.retrieve('send')){
            if (options || !this.retrieve('send:options')) this.set('send', options);
            this.store('send', new Request(this.retrieve('send:options')));
        }
        return this.retrieve('send');
    }

};

Element.implement({

    send: function(url){
        var sender = this.get('send');
        sender.send({data: this, url: url || sender.options.url});
        return this;
    }

});
/*
---

script: Request.HTML.js

description: Extends the basic Request Class with additional methods for interacting with HTML responses.

license: MIT-style license.

requires:
- /Request
- /Element

provides: [Request.HTML]

...
*/

Request.HTML = new Class({

    Extends: Request,

    options: {
        update: false,
        append: false,
        evalScripts: true,
        filter: false
    },

    processHTML: function(text){
        var match = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        text = (match) ? match[1] : text;

        var container = new Element('div');

        return $try(function(){
            var root = '<root>' + text + '</root>', doc;
            if (Browser.Engine.trident){
                doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = false;
                doc.loadXML(root);
            } else {
                doc = new DOMParser().parseFromString(root, 'text/xml');
            }
            root = doc.getElementsByTagName('root')[0];
            if (!root) return null;
            for (var i = 0, k = root.childNodes.length; i < k; i++){
                var child = Element.clone(root.childNodes[i], true, true);
                if (child) container.grab(child);
            }
            return container;
        }) || container.set('html', text);
    },

    success: function(text){
        var options = this.options, response = this.response;

        response.html = text.stripScripts(function(script){
            response.javascript = script;
        });

        var temp = this.processHTML(response.html);

        response.tree = temp.childNodes;
        response.elements = temp.getElements('*');

        if (options.filter) response.tree = response.elements.filter(options.filter);
        if (options.update) document.id(options.update).empty().set('html', response.html);
        else if (options.append) document.id(options.append).adopt(temp.getChildren());
        if (options.evalScripts) $exec(response.javascript);

        this.onSuccess(response.tree, response.elements, response.html, response.javascript);
    }

});

Element.Properties.load = {

    set: function(options){
        var load = this.retrieve('load');
        if (load) load.cancel();
        return this.eliminate('load').store('load:options', $extend({data: this, link: 'cancel', update: this, method: 'get'}, options));
    },

    get: function(options){
        if (options || ! this.retrieve('load')){
            if (options || !this.retrieve('load:options')) this.set('load', options);
            this.store('load', new Request.HTML(this.retrieve('load:options')));
        }
        return this.retrieve('load');
    }

};

Element.implement({

    load: function(){
        this.get('load').send(Array.link(arguments, {data: Object.type, url: String.type}));
        return this;
    }

});
/*
---

script: Request.JSON.js

description: Extends the basic Request Class with additional methods for sending and receiving JSON data.

license: MIT-style license.

requires:
- /Request JSON

provides: [Request.HTML]

...
*/

Request.JSON = new Class({

    Extends: Request,

    options: {
        secure: true
    },

    initialize: function(options){
        this.parent(options);
        this.headers.extend({'Accept': 'application/json', 'X-Request': 'JSON'});
    },

    success: function(text){
        this.response.json = JSON.decode(text, this.options.secure);
        this.onSuccess(this.response.json, text);
    }

});
/*
---

script: More.js

description: MooTools More

license: MIT-style license

authors:
- Guillermo Rauch
- Thomas Aylott
- Scott Kyle

requires:
- core:1.2.4/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
    'version': '1.2.4.2',
    'build': 'bd5a93c0913cce25917c48cbdacde568e15e02ef'
};/*
---

script: MooTools.Lang.js

description: Provides methods for localization.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Events
- /MooTools.More

provides: [MooTools.Lang]

...
*/

(function(){

    var data = {
        language: 'en-US',
        languages: {
            'en-US': {}
        },
        cascades: ['en-US']
    };
    
    var cascaded;

    MooTools.lang = new Events();

    $extend(MooTools.lang, {

        setLanguage: function(lang){
            if (!data.languages[lang]) return this;
            data.language = lang;
            this.load();
            this.fireEvent('langChange', lang);
            return this;
        },

        load: function() {
            var langs = this.cascade(this.getCurrentLanguage());
            cascaded = {};
            $each(langs, function(set, setName){
                cascaded[setName] = this.lambda(set);
            }, this);
        },

        getCurrentLanguage: function(){
            return data.language;
        },

        addLanguage: function(lang){
            data.languages[lang] = data.languages[lang] || {};
            return this;
        },

        cascade: function(lang){
            var cascades = (data.languages[lang] || {}).cascades || [];
            cascades.combine(data.cascades);
            cascades.erase(lang).push(lang);
            var langs = cascades.map(function(lng){
                return data.languages[lng];
            }, this);
            return $merge.apply(this, langs);
        },

        lambda: function(set) {
            (set || {}).get = function(key, args){
                return $lambda(set[key]).apply(this, $splat(args));
            };
            return set;
        },

        get: function(set, key, args){
            if (cascaded && cascaded[set]) return (key ? cascaded[set].get(key, args) : cascaded[set]);
        },

        set: function(lang, set, members){
            this.addLanguage(lang);
            langData = data.languages[lang];
            if (!langData[set]) langData[set] = {};
            $extend(langData[set], members);
            if (lang == this.getCurrentLanguage()){
                this.load();
                this.fireEvent('langChange', lang);
            }
            return this;
        },

        list: function(){
            return Hash.getKeys(data.languages);
        }

    });

})();/*
---

script: Log.js

description: Provides basic logging functionality for plugins to implement.

license: MIT-style license

authors:
- Guillermo Rauch
- Thomas Aylott
- Scott Kyle

requires:
- core:1.2.4/Class
- /MooTools.More

provides: [Log]

...
*/

(function(){

var global = this;

var log = function(){
    if (global.console && console.log){
        try {
            console.log.apply(console, arguments);
        } catch(e) {
            console.log(Array.slice(arguments));
        }
    } else {
        Log.logged.push(arguments);
    }
    return this;
};

var disabled = function(){
    this.logged.push(arguments);
    return this;
};

this.Log = new Class({
    
    logged: [],
    
    log: disabled,
    
    resetLog: function(){
        this.logged.empty();
        return this;
    },

    enableLog: function(){
        this.log = log;
        this.logged.each(function(args){
            this.log.apply(this, args);
        }, this);
        return this.resetLog();
    },

    disableLog: function(){
        this.log = disabled;
        return this;
    }
    
});

Log.extend(new Log).enableLog();

// legacy
Log.logger = function(){
    return this.log.apply(this, arguments);
};

})();/*
---

script: Depender.js

description: A stand alone dependency loader for the MooTools library.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Events
- core:1.2.4/Request.JSON
- /MooTools.More
- /Log

provides: Depender

...
*/

var Depender = {

    options: {
        /* 
        onRequire: $empty(options),
        onRequirementLoaded: $empty([scripts, options]),
        onScriptLoaded: $empty({
            script: script, 
            totalLoaded: percentOfTotalLoaded, 
            loaded: scriptsState
        }),
        serial: false,
        target: null,
        noCache: false,
        log: false,*/
        loadedSources: [],
        loadedScripts: ['Core', 'Browser', 'Array', 'String', 'Function', 'Number', 'Hash', 'Element', 'Event', 'Element.Event', 'Class', 'DomReady', 'Class.Extras', 'Request', 'JSON', 'Request.JSON', 'More', 'Depender', 'Log'],
        useScriptInjection: true
    },

    loaded: [],

    sources: {},

    libs: {},

    include: function(libs){
        this.log('include: ', libs);
        this.mapLoaded = false;
        var loader = function(data){
            this.libs = $merge(this.libs, data);
            $each(this.libs, function(data, lib){
                if (data.scripts) this.loadSource(lib, data.scripts);
            }, this);
        }.bind(this);
        if ($type(libs) == 'string'){
            this.log('fetching libs ', libs);
            this.request(libs, loader);
        } else {
            loader(libs);
        }
        return this;
    },

    required: [],

    require: function(options){
        var loaded = function(){
            var scripts = this.calculateDependencies(options.scripts);
            if (options.sources){
                options.sources.each(function(source){
                    scripts.combine(this.libs[source].files);
                }, this);
            }
            if (options.serial) scripts.combine(this.getLoadedScripts());
            options.scripts = scripts;
            this.required.push(options);
            this.fireEvent('require', options);
            this.loadScripts(options.scripts);
        };
        if (this.mapLoaded){
            loaded.call(this);
        } else {
            this.addEvent('mapLoaded', function(){
                loaded.call(this);
                this.removeEvent('mapLoaded', arguments.callee);
            });
        }
        return this;
    },

    cleanDoubleSlash: function(str){
        if (!str) return str;
        var prefix = '';
        if (str.test(/^http:\/\//)){
            prefix = 'http://';
            str = str.substring(7, str.length);
        }
        str = str.replace(/\/\//g, '/');
        return prefix + str;
    },

    request: function(url, callback){
        new Request.JSON({
            url: url,
            secure: false,
            onSuccess: callback
        }).send();
    },

    loadSource: function(lib, source){
        if (this.libs[lib].files){
            this.dataLoaded();
            return;
        }
        this.log('loading source: ', source);
        this.request(this.cleanDoubleSlash(source + '/scripts.json'), function(result){
            this.log('loaded source: ', source);
            this.libs[lib].files = result;
            this.dataLoaded();
        }.bind(this));
    },

    dataLoaded: function(){
        var loaded = true;
        $each(this.libs, function(v, k){
            if (!this.libs[k].files) loaded = false;
        }, this);
        if (loaded){
            this.mapTree();
            this.mapLoaded = true;
            this.calculateLoaded();
            this.lastLoaded = this.getLoadedScripts().getLength();
            this.fireEvent('mapLoaded');
        }
    },

    calculateLoaded: function(){
        var set = function(script){
            this.scriptsState[script] = true;
        }.bind(this);
        if (this.options.loadedScripts) this.options.loadedScripts.each(set);
        if (this.options.loadedSources){
            this.options.loadedSources.each(function(lib){
                $each(this.libs[lib].files, function(dir){
                    $each(dir, function(data, file){
                        set(file);
                    }, this);
                }, this);
            }, this);
        }
    },

    deps: {},

    pathMap: {},

    mapTree: function(){
        $each(this.libs, function(data, source){
            $each(data.files, function(scripts, folder){
                $each(scripts, function(details, script){
                    var path = source + ':' + folder + ':' + script;
                    if (this.deps[path]) return;
                    this.deps[path] = details.deps;
                    this.pathMap[script] = path;
                }, this);
            }, this);
        }, this);
    },

    getDepsForScript: function(script){
        return this.deps[this.pathMap[script]] || [];
    },

    calculateDependencies: function(scripts){
        var reqs = [];
        $splat(scripts).each(function(script){
            if (script == 'None' || !script) return;
            var deps = this.getDepsForScript(script);
            if (!deps){
                if (window.console && console.warn) console.warn('dependencies not mapped: script: %o, map: %o, :deps: %o', script, this.pathMap, this.deps);
            } else {
                deps.each(function(scr){
                    if (scr == script || scr == 'None' || !scr) return;
                    if (!reqs.contains(scr)) reqs.combine(this.calculateDependencies(scr));
                    reqs.include(scr);
                }, this);
            }
            reqs.include(script);
        }, this);
        return reqs;
    },

    getPath: function(script){
        try {
            var chunks = this.pathMap[script].split(':');
            var lib = this.libs[chunks[0]];
            var dir = (lib.path || lib.scripts) + '/';
            chunks.shift();
            return this.cleanDoubleSlash(dir + chunks.join('/') + '.js');
        } catch(e){
            return script;
        }
    },

    loadScripts: function(scripts){
        scripts = scripts.filter(function(s){
            if (!this.scriptsState[s] && s != 'None'){
                this.scriptsState[s] = false;
                return true;
            }
        }, this);
        if (scripts.length){
            scripts.each(function(scr){
                this.loadScript(scr);
            }, this);
        } else {
            this.check();
        }
    },

    toLoad: [],

    loadScript: function(script){
        if (this.scriptsState[script] && this.toLoad.length){
            this.loadScript(this.toLoad.shift());
            return;
        } else if (this.loading){
            this.toLoad.push(script);
            return;
        }
        var finish = function(){
            this.loading = false;
            this.scriptLoaded(script);
            if (this.toLoad.length) this.loadScript(this.toLoad.shift());
        }.bind(this);
        var error = function(){
            this.log('could not load: ', scriptPath);
        }.bind(this);
        this.loading = true;
        var scriptPath = this.getPath(script);
        if (this.options.useScriptInjection){
            this.log('injecting script: ', scriptPath);
            var loaded = function(){
                this.log('loaded script: ', scriptPath);
                finish();
            }.bind(this);
            new Element('script', {
                src: scriptPath + (this.options.noCache ? '?noCache=' + new Date().getTime() : ''),
                events: {
                    load: loaded,
                    readystatechange: function(){
                        if (['loaded', 'complete'].contains(this.readyState)) loaded();
                    },
                    error: error
                }
            }).inject(this.options.target || document.head);
        } else {
            this.log('requesting script: ', scriptPath);
            new Request({
                url: scriptPath,
                noCache: this.options.noCache,
                onComplete: function(js){
                    this.log('loaded script: ', scriptPath);
                    $exec(js);
                    finish();
                }.bind(this),
                onFailure: error,
                onException: error
            }).send();
        }
    },

    scriptsState: $H(),
    
    getLoadedScripts: function(){
        return this.scriptsState.filter(function(state){
            return state;
        });
    },

    scriptLoaded: function(script){
        this.log('loaded script: ', script);
        this.scriptsState[script] = true;
        this.check();
        var loaded = this.getLoadedScripts();
        var loadedLength = loaded.getLength();
        var toLoad = this.scriptsState.getLength();
        this.fireEvent('scriptLoaded', {
            script: script,
            totalLoaded: (loadedLength / toLoad * 100).round(),
            currentLoaded: ((loadedLength - this.lastLoaded) / (toLoad - this.lastLoaded) * 100).round(),
            loaded: loaded
        });
        if (loadedLength == toLoad) this.lastLoaded = loadedLength;
    },

    lastLoaded: 0,

    check: function(){
        var incomplete = [];
        this.required.each(function(required){
            var loaded = [];
            required.scripts.each(function(script){
                if (this.scriptsState[script]) loaded.push(script);
            }, this);
            if (required.onStep){
                required.onStep({
                    percent: loaded.length / required.scripts.length * 100,
                    scripts: loaded
                });
            };
            if (required.scripts.length != loaded.length) return;
            required.callback();
            this.required.erase(required);
            this.fireEvent('requirementLoaded', [loaded, required]);
        }, this);
    }

};

$extend(Depender, new Events);
$extend(Depender, new Options);
$extend(Depender, new Log);

Depender._setOptions = Depender.setOptions;
Depender.setOptions = function(){
    Depender._setOptions.apply(Depender, arguments);
    if (this.options.log) Depender.enableLog();
    return this;
};
/*
---

script: Class.Refactor.js

description: Extends a class onto itself with new property, preserving any items attached to the class's namespace.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Class
- /MooTools.More

provides: [Class.refactor]

...
*/

Class.refactor = function(original, refactors){

    $each(refactors, function(item, name){
        var origin = original.prototype[name];
        if (origin && (origin = origin._origin) && typeof item == 'function') original.implement(name, function(){
            var old = this.previous;
            this.previous = origin;
            var value = item.apply(this, arguments);
            this.previous = old;
            return value;
        }); else original.implement(name, item);
    });

    return original;

};/*
---

script: Class.Binds.js

description: Automagically binds specified methods in a class to the instance of the class.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Class
- /MooTools.More

provides: [Class.Binds]

...
*/

Class.Mutators.Binds = function(binds){
    return binds;
};

Class.Mutators.initialize = function(initialize){
    return function(){
        $splat(this.Binds).each(function(name){
            var original = this[name];
            if (original) this[name] = original.bind(this);
        }, this);
        return initialize.apply(this, arguments);
    };
};
/*
---

script: Class.Occlude.js

description: Prevents a class from being applied to a DOM element twice.

license: MIT-style license.

authors:
- Aaron Newton

requires: 
- core/1.2.4/Class
- core:1.2.4/Element
- /MooTools.More

provides: [Class.Occlude]

...
*/

Class.Occlude = new Class({

    occlude: function(property, element){
        element = document.id(element || this.element);
        var instance = element.retrieve(property || this.property);
        if (instance && !$defined(this.occluded))
            return this.occluded = instance;

        this.occluded = false;
        element.store(property || this.property, this);
        return this.occluded;
    }

});/*
---

script: Chain.Wait.js

description: value, Adds a method to inject pauses between chained events.

license: MIT-style license.

authors:
- Aaron Newton

requires: 
- core:1.2.4/Chain 
- core:1.2.4/Element
- core:1.2.4/Fx
- /MooTools.More

provides: [Chain.Wait]

...
*/

(function(){

    var wait = {
        wait: function(duration){
            return this.chain(function(){
                this.callChain.delay($pick(duration, 500), this);
            }.bind(this));
        }
    };

    Chain.implement(wait);

    if (window.Fx){
        Fx.implement(wait);
        ['Css', 'Tween', 'Elements'].each(function(cls){
            if (Fx[cls]) Fx[cls].implement(wait);
        });
    }

    Element.implement({
        chains: function(effects){
            $splat($pick(effects, ['tween', 'morph', 'reveal'])).each(function(effect){
                effect = this.get(effect);
                if (!effect) return;
                effect.setOptions({
                    link:'chain'
                });
            }, this);
            return this;
        },
        pauseFx: function(duration, effect){
            this.chains(effect).get($pick(effect, 'tween')).wait(duration);
            return this;
        }
    });

})();/*
---

script: Array.Extras.js

description: Extends the Array native object to include useful methods to work with arrays.

license: MIT-style license

authors:
- Christoph Pojer

requires:
- core:1.2.4/Array

provides: [Array.Extras]

...
*/
Array.implement({

    min: function(){
        return Math.min.apply(null, this);
    },

    max: function(){
        return Math.max.apply(null, this);
    },

    average: function(){
        return this.length ? this.sum() / this.length : 0;
    },

    sum: function(){
        var result = 0, l = this.length;
        if (l){
            do {
                result += this[--l];
            } while (l);
        }
        return result;
    },

    unique: function(){
        return [].combine(this);
    }

});/*
---

script: Date.js

description: Extends the Date native object to include methods useful in managing dates.

license: MIT-style license

authors:
- Aaron Newton
- Nicholas Barthelemy - https://svn.nbarthelemy.com/date-js/
- Harald Kirshner - mail [at] digitarald.de; http://digitarald.de
- Scott Kyle - scott [at] appden.com; http://appden.com

requires:
- core:1.2.4/Array
- core:1.2.4/String
- core:1.2.4/Number
- core:1.2.4/Lang
- core:1.2.4/Date.English.US
- /MooTools.More

provides: [Date]

...
*/

(function(){

var Date = this.Date;

if (!Date.now) Date.now = $time;

Date.Methods = {
    ms: 'Milliseconds',
    year: 'FullYear',
    min: 'Minutes',
    mo: 'Month',
    sec: 'Seconds',
    hr: 'Hours'
};

['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds', 'Time', 'TimezoneOffset',
    'Week', 'Timezone', 'GMTOffset', 'DayOfYear', 'LastMonth', 'LastDayOfMonth', 'UTCDate', 'UTCDay', 'UTCFullYear',
    'AMPM', 'Ordinal', 'UTCHours', 'UTCMilliseconds', 'UTCMinutes', 'UTCMonth', 'UTCSeconds'].each(function(method){
    Date.Methods[method.toLowerCase()] = method;
});

var pad = function(what, length){
    return new Array(length - String(what).length + 1).join('0') + what;
};

Date.implement({

    set: function(prop, value){
        switch ($type(prop)){
            case 'object':
                for (var p in prop) this.set(p, prop[p]);
                break;
            case 'string':
                prop = prop.toLowerCase();
                var m = Date.Methods;
                if (m[prop]) this['set' + m[prop]](value);
        }
        return this;
    },

    get: function(prop){
        prop = prop.toLowerCase();
        var m = Date.Methods;
        if (m[prop]) return this['get' + m[prop]]();
        return null;
    },

    clone: function(){
        return new Date(this.get('time'));
    },

    increment: function(interval, times){
        interval = interval || 'day';
        times = $pick(times, 1);

        switch (interval){
            case 'year':
                return this.increment('month', times * 12);
            case 'month':
                var d = this.get('date');
                this.set('date', 1).set('mo', this.get('mo') + times);
                return this.set('date', d.min(this.get('lastdayofmonth')));
            case 'week':
                return this.increment('day', times * 7);
            case 'day':
                return this.set('date', this.get('date') + times);
        }

        if (!Date.units[interval]) throw new Error(interval + ' is not a supported interval');

        return this.set('time', this.get('time') + times * Date.units[interval]());
    },

    decrement: function(interval, times){
        return this.increment(interval, -1 * $pick(times, 1));
    },

    isLeapYear: function(){
        return Date.isLeapYear(this.get('year'));
    },

    clearTime: function(){
        return this.set({hr: 0, min: 0, sec: 0, ms: 0});
    },

    diff: function(date, resolution){
        if ($type(date) == 'string') date = Date.parse(date);
        
        return ((date - this) / Date.units[resolution || 'day'](3, 3)).toInt(); // non-leap year, 30-day month
    },

    getLastDayOfMonth: function(){
        return Date.daysInMonth(this.get('mo'), this.get('year'));
    },

    getDayOfYear: function(){
        return (Date.UTC(this.get('year'), this.get('mo'), this.get('date') + 1) 
            - Date.UTC(this.get('year'), 0, 1)) / Date.units.day();
    },

    getWeek: function(){
        return (this.get('dayofyear') / 7).ceil();
    },
    
    getOrdinal: function(day){
        return Date.getMsg('ordinal', day || this.get('date'));
    },

    getTimezone: function(){
        return this.toString()
            .replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, '$1')
            .replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, '$1$2$3');
    },

    getGMTOffset: function(){
        var off = this.get('timezoneOffset');
        return ((off > 0) ? '-' : '+') + pad((off.abs() / 60).floor(), 2) + pad(off % 60, 2);
    },

    setAMPM: function(ampm){
        ampm = ampm.toUpperCase();
        var hr = this.get('hr');
        if (hr > 11 && ampm == 'AM') return this.decrement('hour', 12);
        else if (hr < 12 && ampm == 'PM') return this.increment('hour', 12);
        return this;
    },

    getAMPM: function(){
        return (this.get('hr') < 12) ? 'AM' : 'PM';
    },

    parse: function(str){
        this.set('time', Date.parse(str));
        return this;
    },

    isValid: function(date) {
        return !!(date || this).valueOf();
    },

    format: function(f){
        if (!this.isValid()) return 'invalid date';
        f = f || '%x %X';
        f = formats[f.toLowerCase()] || f; // replace short-hand with actual format
        var d = this;
        return f.replace(/%([a-z%])/gi,
            function($0, $1){
                switch ($1){
                    case 'a': return Date.getMsg('days')[d.get('day')].substr(0, 3);
                    case 'A': return Date.getMsg('days')[d.get('day')];
                    case 'b': return Date.getMsg('months')[d.get('month')].substr(0, 3);
                    case 'B': return Date.getMsg('months')[d.get('month')];
                    case 'c': return d.toString();
                    case 'd': return pad(d.get('date'), 2);
                    case 'H': return pad(d.get('hr'), 2);
                    case 'I': return ((d.get('hr') % 12) || 12);
                    case 'j': return pad(d.get('dayofyear'), 3);
                    case 'm': return pad((d.get('mo') + 1), 2);
                    case 'M': return pad(d.get('min'), 2);
                    case 'o': return d.get('ordinal');
                    case 'p': return Date.getMsg(d.get('ampm'));
                    case 'S': return pad(d.get('seconds'), 2);
                    case 'U': return pad(d.get('week'), 2);
                    case 'w': return d.get('day');
                    case 'x': return d.format(Date.getMsg('shortDate'));
                    case 'X': return d.format(Date.getMsg('shortTime'));
                    case 'y': return d.get('year').toString().substr(2);
                    case 'Y': return d.get('year');
                    case 'T': return d.get('GMTOffset');
                    case 'Z': return d.get('Timezone');
                }
                return $1;
            }
        );
    },

    toISOString: function(){
        return this.format('iso8601');
    }

});

Date.alias('toISOString', 'toJSON');
Date.alias('diff', 'compare');
Date.alias('format', 'strftime');

var formats = {
    db: '%Y-%m-%d %H:%M:%S',
    compact: '%Y%m%dT%H%M%S',
    iso8601: '%Y-%m-%dT%H:%M:%S%T',
    rfc822: '%a, %d %b %Y %H:%M:%S %Z',
    'short': '%d %b %H:%M',
    'long': '%B %d, %Y %H:%M'
};

var parsePatterns = [];
var nativeParse = Date.parse;

var parseWord = function(type, word, num){
    var ret = -1;
    var translated = Date.getMsg(type + 's');

    switch ($type(word)){
        case 'object':
            ret = translated[word.get(type)];
            break;
        case 'number':
            ret = translated[month - 1];
            if (!ret) throw new Error('Invalid ' + type + ' index: ' + index);
            break;
        case 'string':
            var match = translated.filter(function(name){
                return this.test(name);
            }, new RegExp('^' + word, 'i'));
            if (!match.length)    throw new Error('Invalid ' + type + ' string');
            if (match.length > 1) throw new Error('Ambiguous ' + type);
            ret = match[0];
    }

    return (num) ? translated.indexOf(ret) : ret;
};

Date.extend({

    getMsg: function(key, args) {
        return MooTools.lang.get('Date', key, args);
    },

    units: {
        ms: $lambda(1),
        second: $lambda(1000),
        minute: $lambda(60000),
        hour: $lambda(3600000),
        day: $lambda(86400000),
        week: $lambda(608400000),
        month: function(month, year){
            var d = new Date;
            return Date.daysInMonth($pick(month, d.get('mo')), $pick(year, d.get('year'))) * 86400000;
        },
        year: function(year){
            year = year || new Date().get('year');
            return Date.isLeapYear(year) ? 31622400000 : 31536000000;
        }
    },

    daysInMonth: function(month, year){
        return [31, Date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },

    isLeapYear: function(year){
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    },

    parse: function(from){
        var t = $type(from);
        if (t == 'number') return new Date(from);
        if (t != 'string') return from;
        from = from.clean();
        if (!from.length) return null;

        var parsed;
        parsePatterns.some(function(pattern){
            var bits = pattern.re.exec(from);
            return (bits) ? (parsed = pattern.handler(bits)) : false;
        });

        return parsed || new Date(nativeParse(from));
    },

    parseDay: function(day, num){
        return parseWord('day', day, num);
    },

    parseMonth: function(month, num){
        return parseWord('month', month, num);
    },

    parseUTC: function(value){
        var localDate = new Date(value);
        var utcSeconds = Date.UTC(
            localDate.get('year'),
            localDate.get('mo'),
            localDate.get('date'),
            localDate.get('hr'),
            localDate.get('min'),
            localDate.get('sec')
        );
        return new Date(utcSeconds);
    },

    orderIndex: function(unit){
        return Date.getMsg('dateOrder').indexOf(unit) + 1;
    },

    defineFormat: function(name, format){
        formats[name] = format;
    },

    defineFormats: function(formats){
        for (var name in formats) Date.defineFormat(name, formats[name]);
    },

    parsePatterns: parsePatterns, // this is deprecated
    
    defineParser: function(pattern){
        parsePatterns.push((pattern.re && pattern.handler) ? pattern : build(pattern));
    },
    
    defineParsers: function(){
        Array.flatten(arguments).each(Date.defineParser);
    },
    
    define2DigitYearStart: function(year){
        startYear = year % 100;
        startCentury = year - startYear;
    }

});

var startCentury = 1900;
var startYear = 70;

var regexOf = function(type){
    return new RegExp('(?:' + Date.getMsg(type).map(function(name){
        return name.substr(0, 3);
    }).join('|') + ')[a-z]*');
};

var replacers = function(key){
    switch(key){
        case 'x': // iso8601 covers yyyy-mm-dd, so just check if month is first
            return ((Date.orderIndex('month') == 1) ? '%m[.-/]%d' : '%d[.-/]%m') + '([.-/]%y)?';
        case 'X':
            return '%H([.:]%M)?([.:]%S([.:]%s)?)? ?%p? ?%T?';
    }
    return null;
};

var keys = {
    d: /[0-2]?[0-9]|3[01]/,
    H: /[01]?[0-9]|2[0-3]/,
    I: /0?[1-9]|1[0-2]/,
    M: /[0-5]?\d/,
    s: /\d+/,
    o: /[a-z]*/,
    p: /[ap]\.?m\.?/,
    y: /\d{2}|\d{4}/,
    Y: /\d{4}/,
    T: /Z|[+-]\d{2}(?::?\d{2})?/
};

keys.m = keys.I;
keys.S = keys.M;

var currentLanguage;

var recompile = function(language){
    currentLanguage = language;
    
    keys.a = keys.A = regexOf('days');
    keys.b = keys.B = regexOf('months');
    
    parsePatterns.each(function(pattern, i){
        if (pattern.format) parsePatterns[i] = build(pattern.format);
    });
};

var build = function(format){
    if (!currentLanguage) return {format: format};
    
    var parsed = [];
    var re = (format.source || format) // allow format to be regex
     .replace(/%([a-z])/gi,
        function($0, $1){
            return replacers($1) || $0;
        }
    ).replace(/\((?!\?)/g, '(?:') // make all groups non-capturing
     .replace(/ (?!\?|\*)/g, ',? ') // be forgiving with spaces and commas
     .replace(/%([a-z%])/gi,
        function($0, $1){
            var p = keys[$1];
            if (!p) return $1;
            parsed.push($1);
            return '(' + p.source + ')';
        }
    ).replace(/\[a-z\]/gi, '[a-z\\u00c0-\\uffff]'); // handle unicode words

    return {
        format: format,
        re: new RegExp('^' + re + '$', 'i'),
        handler: function(bits){
            bits = bits.slice(1).associate(parsed);
            var date = new Date().clearTime();
            if ('d' in bits) handle.call(date, 'd', 1);
            if ('m' in bits) handle.call(date, 'm', 1);
            for (var key in bits) handle.call(date, key, bits[key]);
            return date;
        }
    };
};

var handle = function(key, value){
    if (!value) return this;

    switch(key){
        case 'a': case 'A': return this.set('day', Date.parseDay(value, true));
        case 'b': case 'B': return this.set('mo', Date.parseMonth(value, true));
        case 'd': return this.set('date', value);
        case 'H': case 'I': return this.set('hr', value);
        case 'm': return this.set('mo', value - 1);
        case 'M': return this.set('min', value);
        case 'p': return this.set('ampm', value.replace(/\./g, ''));
        case 'S': return this.set('sec', value);
        case 's': return this.set('ms', ('0.' + value) * 1000);
        case 'w': return this.set('day', value);
        case 'Y': return this.set('year', value);
        case 'y':
            value = +value;
            if (value < 100) value += startCentury + (value < startYear ? 100 : 0);
            return this.set('year', value);
        case 'T':
            if (value == 'Z') value = '+00';
            var offset = value.match(/([+-])(\d{2}):?(\d{2})?/);
            offset = (offset[1] + '1') * (offset[2] * 60 + (+offset[3] || 0)) + this.getTimezoneOffset();
            return this.set('time', this - offset * 60000);
    }

    return this;
};

Date.defineParsers(
    '%Y([-./]%m([-./]%d((T| )%X)?)?)?', // "1999-12-31", "1999-12-31 11:59pm", "1999-12-31 23:59:59", ISO8601
    '%Y%m%d(T%H(%M%S?)?)?', // "19991231", "19991231T1159", compact
    '%x( %X)?', // "12/31", "12.31.99", "12-31-1999", "12/31/2008 11:59 PM"
    '%d%o( %b( %Y)?)?( %X)?', // "31st", "31st December", "31 Dec 1999", "31 Dec 1999 11:59pm"
    '%b( %d%o)?( %Y)?( %X)?', // Same as above with month and day switched
    '%Y %b( %d%o( %X)?)?', // Same as above with year coming first
    '%o %b %d %X %T %Y' // "Thu Oct 22 08:11:23 +0000 2009"
);

MooTools.lang.addEvent('langChange', function(language){
    if (MooTools.lang.get('Date')) recompile(language);
}).fireEvent('langChange', MooTools.lang.getCurrentLanguage());

})();/*
---

script: Date.Extras.js

description: Extends the Date native object to include extra methods (on top of those in Date.js).

license: MIT-style license

authors:
- Aaron Newton
- Scott Kyle

requires:
- /Date

provides: [Date.Extras]

...
*/

Date.implement({

    timeDiffInWords: function(relative_to){
        return Date.distanceOfTimeInWords(this, relative_to || new Date);
    },

    timeDiff: function(to, joiner){
        if (to == null) to = new Date;
        var delta = ((to - this) / 1000).toInt();
        if (!delta) return '0s';
        
        var durations = {s: 60, m: 60, h: 24, d: 365, y: 0};
        var duration, vals = [];
        
        for (var step in durations){
            if (!delta) break;
            if ((duration = durations[step])){
                vals.unshift((delta % duration) + step);
                delta = (delta / duration).toInt();
            } else {
                vals.unshift(delta + step);
            }
        }
        
        return vals.join(joiner || ':');
    }

});

Date.alias('timeDiffInWords', 'timeAgoInWords');

Date.extend({

    distanceOfTimeInWords: function(from, to){
        return Date.getTimePhrase(((to - from) / 1000).toInt());
    },

    getTimePhrase: function(delta){
        var suffix = (delta < 0) ? 'Until' : 'Ago';
        if (delta < 0) delta *= -1;
        
        var units = {
            minute: 60,
            hour: 60,
            day: 24,
            week: 7,
            month: 52 / 12,
            year: 12,
            eon: Infinity
        };
        
        var msg = 'lessThanMinute';
        
        for (var unit in units){
            var interval = units[unit];
            if (delta < 1.5 * interval){
                if (delta > 0.75 * interval) msg = unit;
                break;
            }
            delta /= interval;
            msg = unit + 's';
        }
        
        return Date.getMsg(msg + suffix).substitute({delta: delta.round()});
    }

});


Date.defineParsers(

    {
        // "today", "tomorrow", "yesterday"
        re: /^(?:tod|tom|yes)/i,
        handler: function(bits){
            var d = new Date().clearTime();
            switch(bits[0]){
                case 'tom': return d.increment();
                case 'yes': return d.decrement();
                default:     return d;
            }
        }
    },

    {
        // "next Wednesday", "last Thursday"
        re: /^(next|last) ([a-z]+)$/i,
        handler: function(bits){
            var d = new Date().clearTime();
            var day = d.getDay();
            var newDay = Date.parseDay(bits[2], true);
            var addDays = newDay - day;
            if (newDay <= day) addDays += 7;
            if (bits[1] == 'last') addDays -= 7;
            return d.set('date', d.getDate() + addDays);
        }
    }

);
/*
---

script: Hash.Extras.js

description: Extends the Hash native object to include getFromPath which allows a path notation to child elements.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Hash.base
- /MooTools.More

provides: [Hash.Extras]

...
*/

Hash.implement({

    getFromPath: function(notation){
        var source = this.getClean();
        notation.replace(/\[([^\]]+)\]|\.([^.[]+)|[^[.]+/g, function(match){
            if (!source) return null;
            var prop = arguments[2] || arguments[1] || arguments[0];
            source = (prop in source) ? source[prop] : null;
            return match;
        });
        return source;
    },

    cleanValues: function(method){
        method = method || $defined;
        this.each(function(v, k){
            if (!method(v)) this.erase(k);
        }, this);
        return this;
    },

    run: function(){
        var args = arguments;
        this.each(function(v, k){
            if ($type(v) == 'function') v.run(args);
        });
    }

});/*
---

script: String.Extras.js

description: Extends the String native object to include methods useful in managing various kinds of strings (query strings, urls, html, etc).

license: MIT-style license

authors:
- Aaron Newton
- Guillermo Rauch

requires:
- core:1.2.4/String
- core:1.2.4/$util
- core:1.2.4/Array

provides: [String.Extras]

...
*/

(function(){
  
var special = ['À','à','Á','á','Â','â','Ã','ã','Ä','ä','Å','å','Ă','ă','Ą','ą','Ć','ć','Č','č','Ç','ç', 'Ď','ď','Đ','đ', 'È','è','É','é','Ê','ê','Ë','ë','Ě','ě','Ę','ę', 'Ğ','ğ','Ì','ì','Í','í','Î','î','Ï','ï', 'Ĺ','ĺ','Ľ','ľ','Ł','ł', 'Ñ','ñ','Ň','ň','Ń','ń','Ò','ò','Ó','ó','Ô','ô','Õ','õ','Ö','ö','Ø','ø','ő','Ř','ř','Ŕ','ŕ','Š','š','Ş','ş','Ś','ś', 'Ť','ť','Ť','ť','Ţ','ţ','Ù','ù','Ú','ú','Û','û','Ü','ü','Ů','ů', 'Ÿ','ÿ','ý','Ý','Ž','ž','Ź','ź','Ż','ż', 'Þ','þ','Ð','ð','ß','Œ','œ','Æ','æ','µ'];

var standard = ['A','a','A','a','A','a','A','a','Ae','ae','A','a','A','a','A','a','C','c','C','c','C','c','D','d','D','d', 'E','e','E','e','E','e','E','e','E','e','E','e','G','g','I','i','I','i','I','i','I','i','L','l','L','l','L','l', 'N','n','N','n','N','n', 'O','o','O','o','O','o','O','o','Oe','oe','O','o','o', 'R','r','R','r', 'S','s','S','s','S','s','T','t','T','t','T','t', 'U','u','U','u','U','u','Ue','ue','U','u','Y','y','Y','y','Z','z','Z','z','Z','z','TH','th','DH','dh','ss','OE','oe','AE','ae','u'];

var tidymap = {
    "[\xa0\u2002\u2003\u2009]": " ",
    "\xb7": "*",
    "[\u2018\u2019]": "'",
    "[\u201c\u201d]": '"',
    "\u2026": "...",
    "\u2013": "-",
    "\u2014": "--",
    "\uFFFD": "&raquo;"
};

var getRegForTag = function(tag, contents) {
    tag = tag || '';
    var regstr = contents ? "<" + tag + "[^>]*>([\\s\\S]*?)<\/" + tag + ">" : "<\/?" + tag + "([^>]+)?>";
    reg = new RegExp(regstr, "gi");
    return reg;
};

String.implement({

    standardize: function(){
        var text = this;
        special.each(function(ch, i){
            text = text.replace(new RegExp(ch, 'g'), standard[i]);
        });
        return text;
    },

    repeat: function(times){
        return new Array(times + 1).join(this);
    },

    pad: function(length, str, dir){
        if (this.length >= length) return this;
        var pad = (str == null ? ' ' : '' + str).repeat(length - this.length).substr(0, length - this.length);
        if (!dir || dir == 'right') return this + pad;
        if (dir == 'left') return pad + this;
        return pad.substr(0, (pad.length / 2).floor()) + this + pad.substr(0, (pad.length / 2).ceil());
    },

    getTags: function(tag, contents){
        return this.match(getRegForTag(tag, contents)) || [];
    },

    stripTags: function(tag, contents){
        return this.replace(getRegForTag(tag, contents), '');
    },

    tidy: function(){
        var txt = this.toString();
        $each(tidymap, function(value, key){
            txt = txt.replace(new RegExp(key, 'g'), value);
        });
        return txt;
    }

});

})();/*
---

script: String.QueryString.js

description: Methods for dealing with URI query strings.

license: MIT-style license

authors:
- Sebastian Markbåge, Aaron Newton, Lennart Pilon, Valerio Proietti

requires:
- core:1.2.4/Array
- core:1.2.4/String
- /MooTools.More

provides: [String.QueryString]

...
*/

String.implement({

    parseQueryString: function(){
        var vars = this.split(/[&;]/), res = {};
        if (vars.length) vars.each(function(val){
            var index = val.indexOf('='),
                keys = index < 0 ? [''] : val.substr(0, index).match(/[^\]\[]+/g),
                value = decodeURIComponent(val.substr(index + 1)),
                obj = res;
            keys.each(function(key, i){
                var current = obj[key];
                if(i < keys.length - 1)
                    obj = obj[key] = current || {};
                else if($type(current) == 'array')
                    current.push(value);
                else
                    obj[key] = $defined(current) ? [current, value] : value;
            });
        });
        return res;
    },

    cleanQueryString: function(method){
        return this.split('&').filter(function(val){
            var index = val.indexOf('='),
            key = index < 0 ? '' : val.substr(0, index),
            value = val.substr(index + 1);
            return method ? method.run([key, value]) : $chk(value);
        }).join('&');
    }

});/*
---

script: URI.js

description: Provides methods useful in managing the window location and uris.

license: MIT-style license

authors:
- Sebastian Markb�ge
- Aaron Newton

requires:
- core:1.2.4/Selectors
- /String.QueryString

provides: URI

...
*/

var URI = new Class({

    Implements: Options,

    options: {
        /*base: false*/
    },

    regex: /^(?:(\w+):)?(?:\/\/(?:(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,
    parts: ['scheme', 'user', 'password', 'host', 'port', 'directory', 'file', 'query', 'fragment'],
    schemes: {http: 80, https: 443, ftp: 21, rtsp: 554, mms: 1755, file: 0},

    initialize: function(uri, options){
        this.setOptions(options);
        var base = this.options.base || URI.base;
        if(!uri) uri = base;
        
        if (uri && uri.parsed) this.parsed = $unlink(uri.parsed);
        else this.set('value', uri.href || uri.toString(), base ? new URI(base) : false);
    },

    parse: function(value, base){
        var bits = value.match(this.regex);
        if (!bits) return false;
        bits.shift();
        return this.merge(bits.associate(this.parts), base);
    },

    merge: function(bits, base){
        if ((!bits || !bits.scheme) && (!base || !base.scheme)) return false;
        if (base){
            this.parts.every(function(part){
                if (bits[part]) return false;
                bits[part] = base[part] || '';
                return true;
            });
        }
        bits.port = bits.port || this.schemes[bits.scheme.toLowerCase()];
        bits.directory = bits.directory ? this.parseDirectory(bits.directory, base ? base.directory : '') : '/';
        return bits;
    },

    parseDirectory: function(directory, baseDirectory) {
        directory = (directory.substr(0, 1) == '/' ? '' : (baseDirectory || '/')) + directory;
        if (!directory.test(URI.regs.directoryDot)) return directory;
        var result = [];
        directory.replace(URI.regs.endSlash, '').split('/').each(function(dir){
            if (dir == '..' && result.length > 0) result.pop();
            else if (dir != '.') result.push(dir);
        });
        return result.join('/') + '/';
    },

    combine: function(bits){
        return bits.value || bits.scheme + '://' +
            (bits.user ? bits.user + (bits.password ? ':' + bits.password : '') + '@' : '') +
            (bits.host || '') + (bits.port && bits.port != this.schemes[bits.scheme] ? ':' + bits.port : '') +
            (bits.directory || '/') + (bits.file || '') +
            (bits.query ? '?' + bits.query : '') +
            (bits.fragment ? '#' + bits.fragment : '');
    },

    set: function(part, value, base){
        if (part == 'value'){
            var scheme = value.match(URI.regs.scheme);
            if (scheme) scheme = scheme[1];
            if (scheme && !$defined(this.schemes[scheme.toLowerCase()])) this.parsed = { scheme: scheme, value: value };
            else this.parsed = this.parse(value, (base || this).parsed) || (scheme ? { scheme: scheme, value: value } : { value: value });
        } else if (part == 'data') {
            this.setData(value);
        } else {
            this.parsed[part] = value;
        }
        return this;
    },

    get: function(part, base){
        switch(part){
            case 'value': return this.combine(this.parsed, base ? base.parsed : false);
            case 'data' : return this.getData();
        }
        return this.parsed[part] || '';
    },

    go: function(){
        document.location.href = this.toString();
    },

    toURI: function(){
        return this;
    },

    getData: function(key, part){
        var qs = this.get(part || 'query');
        if (!$chk(qs)) return key ? null : {};
        var obj = qs.parseQueryString();
        return key ? obj[key] : obj;
    },

    setData: function(values, merge, part){
        if (typeof values == 'string'){
            values = this.getData();
            values[arguments[0]] = arguments[1];
        } else if (merge) {
            values = $merge(this.getData(), values);
        }
        return this.set(part || 'query', Hash.toQueryString(values));
    },

    clearData: function(part){
        return this.set(part || 'query', '');
    }

});

URI.prototype.toString = URI.prototype.valueOf = function(){
    return this.get('value');
};

URI.regs = {
    endSlash: /\/$/,
    scheme: /^(\w+):/,
    directoryDot: /\.\/|\.$/
};

URI.base = new URI(document.getElements('base[href]', true).getLast(), {base: document.location});

String.implement({

    toURI: function(options){
        return new URI(this, options);
    }

});/*
---

script: URI.Relative.js

description: Extends the URI class to add methods for computing relative and absolute urls.

license: MIT-style license

authors:
- Sebastian Markbåge


requires:
- /Class.refactor
- /URI

provides: [URI.Relative]

...
*/

URI = Class.refactor(URI, {

    combine: function(bits, base){
        if (!base || bits.scheme != base.scheme || bits.host != base.host || bits.port != base.port)
            return this.previous.apply(this, arguments);
        var end = bits.file + (bits.query ? '?' + bits.query : '') + (bits.fragment ? '#' + bits.fragment : '');

        if (!base.directory) return (bits.directory || (bits.file ? '' : './')) + end;

        var baseDir = base.directory.split('/'),
            relDir = bits.directory.split('/'),
            path = '',
            offset;

        var i = 0;
        for(offset = 0; offset < baseDir.length && offset < relDir.length && baseDir[offset] == relDir[offset]; offset++);
        for(i = 0; i < baseDir.length - offset - 1; i++) path += '../';
        for(i = offset; i < relDir.length - 1; i++) path += relDir[i] + '/';

        return (path || (bits.file ? '' : './')) + end;
    },

    toAbsolute: function(base){
        base = new URI(base);
        if (base) base.set('directory', '').set('file', '');
        return this.toRelative(base);
    },

    toRelative: function(base){
        return this.get('value', new URI(base));
    }

});/*
---

script: Element.Forms.js

description: Extends the Element native object to include methods useful in managing inputs.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element
- /MooTools.More

provides: [Element.Forms]

...
*/

Element.implement({

    tidy: function(){
        this.set('value', this.get('value').tidy());
    },

    getTextInRange: function(start, end){
        return this.get('value').substring(start, end);
    },

    getSelectedText: function(){
        if (this.setSelectionRange) return this.getTextInRange(this.getSelectionStart(), this.getSelectionEnd());
        return document.selection.createRange().text;
    },

    getSelectedRange: function() {
        if ($defined(this.selectionStart)) return {start: this.selectionStart, end: this.selectionEnd};
        var pos = {start: 0, end: 0};
        var range = this.getDocument().selection.createRange();
        if (!range || range.parentElement() != this) return pos;
        var dup = range.duplicate();
        if (this.type == 'text') {
            pos.start = 0 - dup.moveStart('character', -100000);
            pos.end = pos.start + range.text.length;
        } else {
            var value = this.get('value');
            var offset = value.length;
            dup.moveToElementText(this);
            dup.setEndPoint('StartToEnd', range);
            if(dup.text.length) offset -= value.match(/[\n\r]*$/)[0].length;
            pos.end = offset - dup.text.length;
            dup.setEndPoint('StartToStart', range);
            pos.start = offset - dup.text.length;
        }
        return pos;
    },

    getSelectionStart: function(){
        return this.getSelectedRange().start;
    },

    getSelectionEnd: function(){
        return this.getSelectedRange().end;
    },

    setCaretPosition: function(pos){
        if (pos == 'end') pos = this.get('value').length;
        this.selectRange(pos, pos);
        return this;
    },

    getCaretPosition: function(){
        return this.getSelectedRange().start;
    },

    selectRange: function(start, end){
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else {
            var value = this.get('value');
            var diff = value.substr(start, end - start).replace(/\r/g, '').length;
            start = value.substr(0, start).replace(/\r/g, '').length;
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', start + diff);
            range.moveStart('character', start);
            range.select();
        }
        return this;
    },

    insertAtCursor: function(value, select){
        var pos = this.getSelectedRange();
        var text = this.get('value');
        this.set('value', text.substring(0, pos.start) + value + text.substring(pos.end, text.length));
        if ($pick(select, true)) this.selectRange(pos.start, pos.start + value.length);
        else this.setCaretPosition(pos.start + value.length);
        return this;
    },

    insertAroundCursor: function(options, select){
        options = $extend({
            before: '',
            defaultMiddle: '',
            after: ''
        }, options);
        var value = this.getSelectedText() || options.defaultMiddle;
        var pos = this.getSelectedRange();
        var text = this.get('value');
        if (pos.start == pos.end){
            this.set('value', text.substring(0, pos.start) + options.before + value + options.after + text.substring(pos.end, text.length));
            this.selectRange(pos.start + options.before.length, pos.end + options.before.length + value.length);
        } else {
            var current = text.substring(pos.start, pos.end);
            this.set('value', text.substring(0, pos.start) + options.before + current + options.after + text.substring(pos.end, text.length));
            var selStart = pos.start + options.before.length;
            if ($pick(select, true)) this.selectRange(selStart, selStart + current.length);
            else this.setCaretPosition(selStart + text.length);
        }
        return this;
    }

});/*
---

script: Elements.From.js

description: Returns a collection of elements from a string of html.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element
- /MooTools.More

provides: [Elements.from]

...
*/

Elements.from = function(text, excludeScripts){
    if ($pick(excludeScripts, true)) text = text.stripScripts();

    var container, match = text.match(/^\s*<(t[dhr]|tbody|tfoot|thead)/i);

    if (match){
        container = new Element('table');
        var tag = match[1].toLowerCase();
        if (['td', 'th', 'tr'].contains(tag)){
            container = new Element('tbody').inject(container);
            if (tag != 'tr') container = new Element('tr').inject(container);
        }
    }

    return (container || new Element('div')).set('html', text).getChildren();
};/*
---

script: Element.Delegation.js

description: Extends the Element native object to include the delegate method for more efficient event management.

credits:
- "Event checking based on the work of Daniel Steigerwald. License: MIT-style license.    Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
- Aaron Newton
- Daniel Steigerwald

requires:
- core:1.2.4/Element.Event
- core:1.2.4/Selectors
- /MooTools.More

provides: [Element.Delegation]

...
*/
(function(){
    
    var match = /(.*?):relay\(([^)]+)\)$/,
        combinators = /[+>~\s]/,
        splitType = function(type){
            var bits = type.match(match);
            return !bits ? {event: type} : {
                event: bits[1],
                selector: bits[2]
            };
        },
        check = function(e, selector){
            var t = e.target;
            if (combinators.test(selector = selector.trim())){
                var els = this.getElements(selector);
                for (var i = els.length; i--; ){
                    var el = els[i];
                    if (t == el || el.hasChild(t)) return el;
                }
            } else {
                for ( ; t && t != this; t = t.parentNode){
                    if (Element.match(t, selector)) return document.id(t);
                }
            }
            return null;
        };

    var oldAddEvent = Element.prototype.addEvent,
        oldRemoveEvent = Element.prototype.removeEvent;
        
    Element.implement({

        addEvent: function(type, fn){
            var splitted = splitType(type);
            if (splitted.selector){
                var monitors = this.retrieve('$moo:delegateMonitors', {});
                if (!monitors[type]){
                    var monitor = function(e){
                        var el = check.call(this, e, splitted.selector);
                        if (el) this.fireEvent(type, [e, el], 0, el);
                    }.bind(this);
                    monitors[type] = monitor;
                    oldAddEvent.call(this, splitted.event, monitor);
                }
            }
            return oldAddEvent.apply(this, arguments);
        },

        removeEvent: function(type, fn){
            var splitted = splitType(type);
            if (splitted.selector){
                var events = this.retrieve('events');
                if (!events || !events[type] || (fn && !events[type].keys.contains(fn))) return this;

                if (fn) oldRemoveEvent.apply(this, [type, fn]);
                else oldRemoveEvent.apply(this, type);

                events = this.retrieve('events');
                if (events && events[type] && events[type].length == 0){
                    var monitors = this.retrieve('$moo:delegateMonitors', {});
                    oldRemoveEvent.apply(this, [splitted.event, monitors[type]]);
                    delete monitors[type];
                }
                return this;
            }

            return oldRemoveEvent.apply(this, arguments);
        },

        fireEvent: function(type, args, delay, bind){
            var events = this.retrieve('events');
            if (!events || !events[type]) return this;
            events[type].keys.each(function(fn){
                fn.create({bind: bind || this, delay: delay, arguments: args})();
            }, this);
            return this;
        }

    });

})();/*
---

script: Element.Measure.js

description: Extends the Element native object to include methods useful in measuring dimensions.

credits: "Element.measure / .expose methods by Daniel Steigerwald License: MIT-style license. Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Style
- core:1.2.4/Element.Dimensions
- /MooTools.More

provides: [Element.Measure]

...
*/

Element.implement({

    measure: function(fn){
        var vis = function(el) {
            return !!(!el || el.offsetHeight || el.offsetWidth);
        };
        if (vis(this)) return fn.apply(this);
        var parent = this.getParent(),
            restorers = [],
            toMeasure = []; 
        while (!vis(parent) && parent != document.body) {
            toMeasure.push(parent.expose());
            parent = parent.getParent();
        }
        var restore = this.expose();
        var result = fn.apply(this);
        restore();
        toMeasure.each(function(restore){
            restore();
        });
        return result;
    },

    expose: function(){
        if (this.getStyle('display') != 'none') return $empty;
        var before = this.style.cssText;
        this.setStyles({
            display: 'block',
            position: 'absolute',
            visibility: 'hidden'
        });
        return function(){
            this.style.cssText = before;
        }.bind(this);
    },

    getDimensions: function(options){
        options = $merge({computeSize: false},options);
        var dim = {};
        var getSize = function(el, options){
            return (options.computeSize)?el.getComputedSize(options):el.getSize();
        };
        var parent = this.getParent('body');
        if (parent && this.getStyle('display') == 'none'){
            dim = this.measure(function(){
                return getSize(this, options);
            });
        } else if (parent){
            try { //safari sometimes crashes here, so catch it
                dim = getSize(this, options);
            }catch(e){}
        } else {
            dim = {x: 0, y: 0};
        }
        return $chk(dim.x) ? $extend(dim, {width: dim.x, height: dim.y}) : $extend(dim, {x: dim.width, y: dim.height});
    },

    getComputedSize: function(options){
        options = $merge({
            styles: ['padding','border'],
            plains: {
                height: ['top','bottom'],
                width: ['left','right']
            },
            mode: 'both'
        }, options);
        var size = {width: 0,height: 0};
        switch (options.mode){
            case 'vertical':
                delete size.width;
                delete options.plains.width;
                break;
            case 'horizontal':
                delete size.height;
                delete options.plains.height;
                break;
        }
        var getStyles = [];
        //this function might be useful in other places; perhaps it should be outside this function?
        $each(options.plains, function(plain, key){
            plain.each(function(edge){
                options.styles.each(function(style){
                    getStyles.push((style == 'border') ? style + '-' + edge + '-' + 'width' : style + '-' + edge);
                });
            });
        });
        var styles = {};
        getStyles.each(function(style){ styles[style] = this.getComputedStyle(style); }, this);
        var subtracted = [];
        $each(options.plains, function(plain, key){ //keys: width, height, plains: ['left', 'right'], ['top','bottom']
            var capitalized = key.capitalize();
            size['total' + capitalized] = size['computed' + capitalized] = 0;
            plain.each(function(edge){ //top, left, right, bottom
                size['computed' + edge.capitalize()] = 0;
                getStyles.each(function(style, i){ //padding, border, etc.
                    //'padding-left'.test('left') size['totalWidth'] = size['width'] + [padding-left]
                    if (style.test(edge)){
                        styles[style] = styles[style].toInt() || 0; //styles['padding-left'] = 5;
                        size['total' + capitalized] = size['total' + capitalized] + styles[style];
                        size['computed' + edge.capitalize()] = size['computed' + edge.capitalize()] + styles[style];
                    }
                    //if width != width (so, padding-left, for instance), then subtract that from the total
                    if (style.test(edge) && key != style &&
                        (style.test('border') || style.test('padding')) && !subtracted.contains(style)){
                        subtracted.push(style);
                        size['computed' + capitalized] = size['computed' + capitalized]-styles[style];
                    }
                });
            });
        });

        ['Width', 'Height'].each(function(value){
            var lower = value.toLowerCase();
            if(!$chk(size[lower])) return;

            size[lower] = size[lower] + this['offset' + value] + size['computed' + value];
            size['total' + value] = size[lower] + size['total' + value];
            delete size['computed' + value];
        }, this);

        return $extend(styles, size);
    }

});/*
---

script: Element.Pin.js

description: Extends the Element native object to include the pin method useful for fixed positioning for elements.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Event
- core:1.2.4/Element.Dimensions
- core:1.2.4/Element.Style
- /MooTools.More

provides: [Element.Pin]

...
*/

(function(){
    var supportsPositionFixed = false;
    window.addEvent('domready', function(){
        var test = new Element('div').setStyles({
            position: 'fixed',
            top: 0,
            right: 0
        }).inject(document.body);
        supportsPositionFixed = (test.offsetTop === 0);
        test.dispose();
    });

    Element.implement({

        pin: function(enable){
            if (this.getStyle('display') == 'none') return null;
            
            var p,
                    scroll = window.getScroll();
            if (enable !== false){
                p = this.getPosition();
                if (!this.retrieve('pinned')){
                    var pos = {
                        top: p.y - scroll.y,
                        left: p.x - scroll.x
                    };
                    if (supportsPositionFixed){
                        this.setStyle('position', 'fixed').setStyles(pos);
                    } else {
                        this.store('pinnedByJS', true);
                        this.setStyles({
                            position: 'absolute',
                            top: p.y,
                            left: p.x
                        }).addClass('isPinned');
                        this.store('scrollFixer', (function(){
                            if (this.retrieve('pinned'))
                                var scroll = window.getScroll();
                                this.setStyles({
                                    top: pos.top.toInt() + scroll.y,
                                    left: pos.left.toInt() + scroll.x
                                });
                        }).bind(this));
                        window.addEvent('scroll', this.retrieve('scrollFixer'));
                    }
                    this.store('pinned', true);
                }
            } else {
                var op;
                if (!Browser.Engine.trident){
                    var parent = this.getParent();
                    op = (parent.getComputedStyle('position') != 'static' ? parent : parent.getOffsetParent());
                }
                p = this.getPosition(op);
                this.store('pinned', false);
                var reposition;
                if (supportsPositionFixed && !this.retrieve('pinnedByJS')){
                    reposition = {
                        top: p.y + scroll.y,
                        left: p.x + scroll.x
                    };
                } else {
                    this.store('pinnedByJS', false);
                    window.removeEvent('scroll', this.retrieve('scrollFixer'));
                    reposition = {
                        top: p.y,
                        left: p.x
                    };
                }
                this.setStyles($merge(reposition, {position: 'absolute'})).removeClass('isPinned');
            }
            return this;
        },

        unpin: function(){
            return this.pin(false);
        },

        togglepin: function(){
            this.pin(!this.retrieve('pinned'));
        }

    });

})();/*
---

script: Element.Position.js

description: Extends the Element native object to include methods useful positioning elements relative to others.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Dimensions
- /Element.Measure

provides: [Elements.Position]

...
*/

(function(){

var original = Element.prototype.position;

Element.implement({

    position: function(options){
        //call original position if the options are x/y values
        if (options && ($defined(options.x) || $defined(options.y))) return original ? original.apply(this, arguments) : this;
        $each(options||{}, function(v, k){ if (!$defined(v)) delete options[k]; });
        options = $merge({
            // minimum: { x: 0, y: 0 },
            // maximum: { x: 0, y: 0},
            relativeTo: document.body,
            position: {
                x: 'center', //left, center, right
                y: 'center' //top, center, bottom
            },
            edge: false,
            offset: {x: 0, y: 0},
            returnPos: false,
            relFixedPosition: false,
            ignoreMargins: false,
            ignoreScroll: false,
            allowNegative: false
        }, options);
        //compute the offset of the parent positioned element if this element is in one
        var parentOffset = {x: 0, y: 0}, 
                parentPositioned = false;
        /* dollar around getOffsetParent should not be necessary, but as it does not return
         * a mootools extended element in IE, an error occurs on the call to expose. See:
         * http://mootools.lighthouseapp.com/projects/2706/tickets/333-element-getoffsetparent-inconsistency-between-ie-and-other-browsers */
        var offsetParent = this.measure(function(){
            return document.id(this.getOffsetParent());
        });
        if (offsetParent && offsetParent != this.getDocument().body){
            parentOffset = offsetParent.measure(function(){
                return this.getPosition();
            });
            parentPositioned = offsetParent != document.id(options.relativeTo);
            options.offset.x = options.offset.x - parentOffset.x;
            options.offset.y = options.offset.y - parentOffset.y;
        }
        //upperRight, bottomRight, centerRight, upperLeft, bottomLeft, centerLeft
        //topRight, topLeft, centerTop, centerBottom, center
        var fixValue = function(option){
            if ($type(option) != 'string') return option;
            option = option.toLowerCase();
            var val = {};
            if (option.test('left')) val.x = 'left';
            else if (option.test('right')) val.x = 'right';
            else val.x = 'center';
            if (option.test('upper') || option.test('top')) val.y = 'top';
            else if (option.test('bottom')) val.y = 'bottom';
            else val.y = 'center';
            return val;
        };
        options.edge = fixValue(options.edge);
        options.position = fixValue(options.position);
        if (!options.edge){
            if (options.position.x == 'center' && options.position.y == 'center') options.edge = {x:'center', y:'center'};
            else options.edge = {x:'left', y:'top'};
        }

        this.setStyle('position', 'absolute');
        var rel = document.id(options.relativeTo) || document.body,
                calc = rel == document.body ? window.getScroll() : rel.getPosition(),
                top = calc.y, left = calc.x;

        var scrolls = rel.getScrolls();
        top += scrolls.y;
        left += scrolls.x;

        var dim = this.getDimensions({computeSize: true, styles:['padding', 'border','margin']});
        var pos = {},
                prefY = options.offset.y,
                prefX = options.offset.x,
                winSize = window.getSize();
        switch(options.position.x){
            case 'left':
                pos.x = left + prefX;
                break;
            case 'right':
                pos.x = left + prefX + rel.offsetWidth;
                break;
            default: //center
                pos.x = left + ((rel == document.body ? winSize.x : rel.offsetWidth)/2) + prefX;
                break;
        }
        switch(options.position.y){
            case 'top':
                pos.y = top + prefY;
                break;
            case 'bottom':
                pos.y = top + prefY + rel.offsetHeight;
                break;
            default: //center
                pos.y = top + ((rel == document.body ? winSize.y : rel.offsetHeight)/2) + prefY;
                break;
        }
        if (options.edge){
            var edgeOffset = {};

            switch(options.edge.x){
                case 'left':
                    edgeOffset.x = 0;
                    break;
                case 'right':
                    edgeOffset.x = -dim.x-dim.computedRight-dim.computedLeft;
                    break;
                default: //center
                    edgeOffset.x = -(dim.totalWidth/2);
                    break;
            }
            switch(options.edge.y){
                case 'top':
                    edgeOffset.y = 0;
                    break;
                case 'bottom':
                    edgeOffset.y = -dim.y-dim.computedTop-dim.computedBottom;
                    break;
                default: //center
                    edgeOffset.y = -(dim.totalHeight/2);
                    break;
            }
            pos.x += edgeOffset.x;
            pos.y += edgeOffset.y;
        }
        pos = {
            left: ((pos.x >= 0 || parentPositioned || options.allowNegative) ? pos.x : 0).toInt(),
            top: ((pos.y >= 0 || parentPositioned || options.allowNegative) ? pos.y : 0).toInt()
        };
        var xy = {left: 'x', top: 'y'};
        ['minimum', 'maximum'].each(function(minmax) {
            ['left', 'top'].each(function(lr) {
                var val = options[minmax] ? options[minmax][xy[lr]] : null;
                if (val != null && pos[lr] < val) pos[lr] = val;
            });
        });
        if (rel.getStyle('position') == 'fixed' || options.relFixedPosition){
            var winScroll = window.getScroll();
            pos.top+= winScroll.y;
            pos.left+= winScroll.x;
        }
        if (options.ignoreScroll) {
            var relScroll = rel.getScroll();
            pos.top-= relScroll.y;
            pos.left-= relScroll.x;
        }
        if (options.ignoreMargins) {
            pos.left += (
                options.edge.x == 'right' ? dim['margin-right'] : 
                options.edge.x == 'center' ? -dim['margin-left'] + ((dim['margin-right'] + dim['margin-left'])/2) : 
                    - dim['margin-left']
            );
            pos.top += (
                options.edge.y == 'bottom' ? dim['margin-bottom'] : 
                options.edge.y == 'center' ? -dim['margin-top'] + ((dim['margin-bottom'] + dim['margin-top'])/2) : 
                    - dim['margin-top']
            );
        }
        pos.left = Math.ceil(pos.left);
        pos.top = Math.ceil(pos.top);
        if (options.returnPos) return pos;
        else this.setStyles(pos);
        return this;
    }

});

})();/*
---

script: Element.Shortcuts.js

description: Extends the Element native object to include some shortcut methods.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Style
- /MooTools.More

provides: [Element.Shortcuts]

...
*/

Element.implement({

    isDisplayed: function(){
        return this.getStyle('display') != 'none';
    },

    isVisible: function(){
        var w = this.offsetWidth,
            h = this.offsetHeight;
        return (w == 0 && h == 0) ? false : (w > 0 && h > 0) ? true : this.isDisplayed();
    },

    toggle: function(){
        return this[this.isDisplayed() ? 'hide' : 'show']();
    },

    hide: function(){
        var d;
        try {
            // IE fails here if the element is not in the dom
            if ((d = this.getStyle('display')) == 'none') d = null;
        } catch(e){}
        
        return this.store('originalDisplay', d || 'block').setStyle('display', 'none');
    },

    show: function(display){
        return this.setStyle('display', display || this.retrieve('originalDisplay') || 'block');
    },

    swapClass: function(remove, add){
        return this.removeClass(remove).addClass(add);
    }

});
/*
---

script: Form.Request.js

description: Handles the basic functionality of submitting a form and updating a dom element with the result.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Event
- core:1.2.4/Request.HTML
- /Class.Binds
- /Class.Occlude
- /Spinner
- /String.QueryString

provides: [Form.Request]

...
*/

if (!window.Form) window.Form = {};

(function(){

    Form.Request = new Class({

        Binds: ['onSubmit', 'onFormValidate'],

        Implements: [Options, Events, Class.Occlude],

        options: {
            //onFailure: $empty,
            //onSuccess: #empty, //aliased to onComplete,
            //onSend: $empty
            requestOptions: {
                evalScripts: true,
                useSpinner: true,
                emulation: false,
                link: 'ignore'
            },
            extraData: {},
            resetForm: true
        },

        property: 'form.request',

        initialize: function(form, update, options) {
            this.element = document.id(form);
            if (this.occlude()) return this.occluded;
            this.update = document.id(update);
            this.setOptions(options);
            this.makeRequest();
            if (this.options.resetForm) {
                this.request.addEvent('success', function(){
                    $try(function(){ this.element.reset(); }.bind(this));
                    if (window.OverText) OverText.update();
                }.bind(this));
            }
            this.attach();
        },

        toElement: function() {
            return this.element;
        },

        makeRequest: function(){
            this.request = new Request.HTML($merge({
                    url: this.element.get('action'),
                    update: this.update,
                    emulation: false,
                    spinnerTarget: this.element,
                    method: this.element.get('method') || 'post'
            }, this.options.requestOptions)).addEvents({
                success: function(text, xml){
                    ['success', 'complete'].each(function(evt){
                        this.fireEvent(evt, [this.update, text, xml]);
                    }, this);
                }.bind(this),
                failure: function(xhr){
                    this.fireEvent('failure', xhr);
                }.bind(this),
                exception: function(){
                    this.fireEvent('failure', xhr);
                }.bind(this)
            });
        },

        attach: function(attach){
            attach = $pick(attach, true);
            method = attach ? 'addEvent' : 'removeEvent';
            
            var fv = this.element.retrieve('validator');
            if (fv) fv[method]('onFormValidate', this.onFormValidate);
            if (!fv || !attach) this.element[method]('submit', this.onSubmit);
        },

        detach: function(){
            this.attach(false);
        },

        //public method
        enable: function(){
            this.attach();
        },

        //public method
        disable: function(){
            this.detach();
        },

        onFormValidate: function(valid, form, e) {
            if (valid || !fv.options.stopOnFailure) {
                if (e && e.stop) e.stop();
                this.send();
            }
        },

        onSubmit: function(e){
            if (this.element.retrieve('validator')) {
                //form validator was created after Form.Request
                this.detach();
                this.addFormEvent();
                return;
            }
            e.stop();
            this.send();
        },

        send: function(){
            var str = this.element.toQueryString().trim();
            var data = $H(this.options.extraData).toQueryString();
            if (str) str += "&" + data;
            else str = data;
            this.fireEvent('send', [this.element, str]);
            this.request.send({data: str});
            return this;
        }

    });

    Element.Properties.formRequest = {

        set: function(){
            var opt = Array.link(arguments, {options: Object.type, update: Element.type, updateId: String.type});
            var update = opt.update || opt.updateId;
            var updater = this.retrieve('form.request');
            if (update) {
                if (updater) updater.update = document.id(update);
                this.store('form.request:update', update);
            }
            if (opt.options) {
                if (updater) updater.setOptions(opt.options);
                this.store('form.request:options', opt.options);
            }
            return this;
        },

        get: function(){
            var opt = Array.link(arguments, {options: Object.type, update: Element.type, updateId: String.type});
            var update = opt.update || opt.updateId;
            if (opt.options || update || !this.retrieve('form.request')){
                if (opt.options || !this.retrieve('form.request:options')) this.set('form.request', opt.options);
                if (update) this.set('form.request', update);
                this.store('form.request', new Form.Request(this, this.retrieve('form.request:update'), this.retrieve('form.request:options')));
            }
            return this.retrieve('form.request');
        }

    };

    Element.implement({

        formUpdate: function(update, options){
            this.get('form.request', update, options).send();
            return this;
        }

    });

})();/*
---

script: Form.Request.Append.js

description: Handles the basic functionality of submitting a form and updating a dom element with the result. The result is appended to the DOM element instead of replacing its contents.

license: MIT-style license

authors:
- Aaron Newton

requires:
- /Form.Request
- /Fx.Reveal
- /Elements.from

provides: [Form.Request.Append]

...
*/

Form.Request.Append = new Class({

    Extends: Form.Request,

    options: {
        //onBeforeEffect: $empty,
        useReveal: true,
        revealOptions: {},
        inject: 'bottom'
    },

    makeRequest: function(){
        this.request = new Request.HTML($merge({
                url: this.element.get('action'),
                method: this.element.get('method') || 'post',
                spinnerTarget: this.element
            }, this.options.requestOptions, {
                evalScripts: false
            })
        ).addEvents({
            success: function(tree, elements, html, javascript){
                var container;
                var kids = Elements.from(html);
                if (kids.length == 1) {
                    container = kids[0];
                } else {
                     container = new Element('div', {
                        styles: {
                            display: 'none'
                        }
                    }).adopt(kids);
                }
                container.inject(this.update, this.options.inject);
                if (this.options.requestOptions.evalScripts) $exec(javascript);
                this.fireEvent('beforeEffect', container);
                var finish = function(){
                    this.fireEvent('success', [container, this.update, tree, elements, html, javascript]);
                }.bind(this);
                if (this.options.useReveal) {
                    container.get('reveal', this.options.revealOptions).chain(finish);
                    container.reveal();
                } else {
                    finish();
                }
            }.bind(this),
            failure: function(xhr){
                this.fireEvent('failure', xhr);
            }.bind(this)
        });
    }

});/*
---

script: Form.Validator.js

description: A css-class based form validation system.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Options
- core:1.2.4/Events
- core:1.2.4/Selectors
- core:1.2.4/Element.Event
- core:1.2.4/Element.Style
- core:1.2.4/JSON
- /Lang- /Class.Binds
- /Date Element.Forms
- /Form.Validator.English
- /Element.Shortcuts

provides: [Form.Validator, InputValidator, FormValidator.BaseValidators]

...
*/
if (!window.Form) window.Form = {};

var InputValidator = new Class({

    Implements: [Options],

    options: {
        errorMsg: 'Validation failed.',
        test: function(field){return true;}
    },

    initialize: function(className, options){
        this.setOptions(options);
        this.className = className;
    },

    test: function(field, props){
        if (document.id(field)) return this.options.test(document.id(field), props||this.getProps(field));
        else return false;
    },

    getError: function(field, props){
        var err = this.options.errorMsg;
        if ($type(err) == 'function') err = err(document.id(field), props||this.getProps(field));
        return err;
    },

    getProps: function(field){
        if (!document.id(field)) return {};
        return field.get('validatorProps');
    }

});

Element.Properties.validatorProps = {

    set: function(props){
        return this.eliminate('validatorProps').store('validatorProps', props);
    },

    get: function(props){
        if (props) this.set(props);
        if (this.retrieve('validatorProps')) return this.retrieve('validatorProps');
        if (this.getProperty('validatorProps')){
            try {
                this.store('validatorProps', JSON.decode(this.getProperty('validatorProps')));
            }catch(e){
                return {};
            }
        } else {
            var vals = this.get('class').split(' ').filter(function(cls){
                return cls.test(':');
            });
            if (!vals.length){
                this.store('validatorProps', {});
            } else {
                props = {};
                vals.each(function(cls){
                    var split = cls.split(':');
                    if (split[1]) {
                        try {
                            props[split[0]] = JSON.decode(split[1]);
                        } catch(e) {}
                    }
                });
                this.store('validatorProps', props);
            }
        }
        return this.retrieve('validatorProps');
    }

};

Form.Validator = new Class({

    Implements:[Options, Events],

    Binds: ['onSubmit'],

    options: {/*
        onFormValidate: $empty(isValid, form, event),
        onElementValidate: $empty(isValid, field, className, warn),
        onElementPass: $empty(field),
        onElementFail: $empty(field, validatorsFailed) */
        fieldSelectors: 'input, select, textarea',
        ignoreHidden: true,
        ignoreDisabled: true,
        useTitles: false,
        evaluateOnSubmit: true,
        evaluateFieldsOnBlur: true,
        evaluateFieldsOnChange: true,
        serial: true,
        stopOnFailure: true,
        warningPrefix: function(){
            return Form.Validator.getMsg('warningPrefix') || 'Warning: ';
        },
        errorPrefix: function(){
            return Form.Validator.getMsg('errorPrefix') || 'Error: ';
        }
    },

    initialize: function(form, options){
        this.setOptions(options);
        this.element = document.id(form);
        this.element.store('validator', this);
        this.warningPrefix = $lambda(this.options.warningPrefix)();
        this.errorPrefix = $lambda(this.options.errorPrefix)();
        if (this.options.evaluateOnSubmit) this.element.addEvent('submit', this.onSubmit);
        if (this.options.evaluateFieldsOnBlur || this.options.evaluateFieldsOnChange) this.watchFields(this.getFields());
    },

    toElement: function(){
        return this.element;
    },

    getFields: function(){
        return (this.fields = this.element.getElements(this.options.fieldSelectors));
    },

    watchFields: function(fields){
        fields.each(function(el){
            if (this.options.evaluateFieldsOnBlur)
                el.addEvent('blur', this.validationMonitor.pass([el, false], this));
            if (this.options.evaluateFieldsOnChange)
                el.addEvent('change', this.validationMonitor.pass([el, true], this));
        }, this);
    },

    validationMonitor: function(){
        $clear(this.timer);
        this.timer = this.validateField.delay(50, this, arguments);
    },

    onSubmit: function(event){
        if (!this.validate(event) && event) event.preventDefault();
        else this.reset();
    },

    reset: function(){
        this.getFields().each(this.resetField, this);
        return this;
    },

    validate: function(event){
        var result = this.getFields().map(function(field){
            return this.validateField(field, true);
        }, this).every(function(v){ return v;});
        this.fireEvent('formValidate', [result, this.element, event]);
        if (this.options.stopOnFailure && !result && event) event.preventDefault();
        return result;
    },

    validateField: function(field, force){
        if (this.paused) return true;
        field = document.id(field);
        var passed = !field.hasClass('validation-failed');
        var failed, warned;
        if (this.options.serial && !force){
            failed = this.element.getElement('.validation-failed');
            warned = this.element.getElement('.warning');
        }
        if (field && (!failed || force || field.hasClass('validation-failed') || (failed && !this.options.serial))){
            var validators = field.className.split(' ').some(function(cn){
                return this.getValidator(cn);
            }, this);
            var validatorsFailed = [];
            field.className.split(' ').each(function(className){
                if (className && !this.test(className, field)) validatorsFailed.include(className);
            }, this);
            passed = validatorsFailed.length === 0;
            if (validators && !field.hasClass('warnOnly')){
                if (passed){
                    field.addClass('validation-passed').removeClass('validation-failed');
                    this.fireEvent('elementPass', field);
                } else {
                    field.addClass('validation-failed').removeClass('validation-passed');
                    this.fireEvent('elementFail', [field, validatorsFailed]);
                }
            }
            if (!warned){
                var warnings = field.className.split(' ').some(function(cn){
                    if (cn.test('^warn-') || field.hasClass('warnOnly'))
                        return this.getValidator(cn.replace(/^warn-/,''));
                    else return null;
                }, this);
                field.removeClass('warning');
                var warnResult = field.className.split(' ').map(function(cn){
                    if (cn.test('^warn-') || field.hasClass('warnOnly'))
                        return this.test(cn.replace(/^warn-/,''), field, true);
                    else return null;
                }, this);
            }
        }
        return passed;
    },

    test: function(className, field, warn){
        field = document.id(field);
        if((this.options.ignoreHidden && !field.isVisible()) || (this.options.ignoreDisabled && field.get('disabled'))) return true;
        var validator = this.getValidator(className);
        if (field.hasClass('ignoreValidation')) return true;
        warn = $pick(warn, false);
        if (field.hasClass('warnOnly')) warn = true;
        var isValid = validator ? validator.test(field) : true;
        if (validator && field.isVisible()) this.fireEvent('elementValidate', [isValid, field, className, warn]);
        if (warn) return true;
        return isValid;
    },

    resetField: function(field){
        field = document.id(field);
        if (field){
            field.className.split(' ').each(function(className){
                if (className.test('^warn-')) className = className.replace(/^warn-/, '');
                field.removeClass('validation-failed');
                field.removeClass('warning');
                field.removeClass('validation-passed');
            }, this);
        }
        return this;
    },

    stop: function(){
        this.paused = true;
        return this;
    },

    start: function(){
        this.paused = false;
        return this;
    },

    ignoreField: function(field, warn){
        field = document.id(field);
        if (field){
            this.enforceField(field);
            if (warn) field.addClass('warnOnly');
            else field.addClass('ignoreValidation');
        }
        return this;
    },

    enforceField: function(field){
        field = document.id(field);
        if (field) field.removeClass('warnOnly').removeClass('ignoreValidation');
        return this;
    }

});

Form.Validator.getMsg = function(key){
    return MooTools.lang.get('Form.Validator', key);
};

Form.Validator.adders = {

    validators:{},

    add : function(className, options){
        this.validators[className] = new InputValidator(className, options);
        //if this is a class (this method is used by instances of Form.Validator and the Form.Validator namespace)
        //extend these validators into it
        //this allows validators to be global and/or per instance
        if (!this.initialize){
            this.implement({
                validators: this.validators
            });
        }
    },

    addAllThese : function(validators){
        $A(validators).each(function(validator){
            this.add(validator[0], validator[1]);
        }, this);
    },

    getValidator: function(className){
        return this.validators[className.split(':')[0]];
    }

};

$extend(Form.Validator, Form.Validator.adders);

Form.Validator.implement(Form.Validator.adders);

Form.Validator.add('IsEmpty', {

    errorMsg: false,
    test: function(element){
        if (element.type == 'select-one' || element.type == 'select')
            return !(element.selectedIndex >= 0 && element.options[element.selectedIndex].value != '');
        else
            return ((element.get('value') == null) || (element.get('value').length == 0));
    }

});

Form.Validator.addAllThese([

    ['required', {
        errorMsg: function(){
            return Form.Validator.getMsg('required');
        },
        test: function(element){
            return !Form.Validator.getValidator('IsEmpty').test(element);
        }
    }],

    ['minLength', {
        errorMsg: function(element, props){
            if ($type(props.minLength))
                return Form.Validator.getMsg('minLength').substitute({minLength:props.minLength,length:element.get('value').length });
            else return '';
        },
        test: function(element, props){
            if ($type(props.minLength)) return (element.get('value').length >= $pick(props.minLength, 0));
            else return true;
        }
    }],

    ['maxLength', {
        errorMsg: function(element, props){
            //props is {maxLength:10}
            if ($type(props.maxLength))
                return Form.Validator.getMsg('maxLength').substitute({maxLength:props.maxLength,length:element.get('value').length });
            else return '';
        },
        test: function(element, props){
            //if the value is <= than the maxLength value, element passes test
            return (element.get('value').length <= $pick(props.maxLength, 10000));
        }
    }],

    ['validate-integer', {
        errorMsg: Form.Validator.getMsg.pass('integer'),
        test: function(element){
            return Form.Validator.getValidator('IsEmpty').test(element) || (/^(-?[1-9]\d*|0)$/).test(element.get('value'));
        }
    }],

    ['validate-numeric', {
        errorMsg: Form.Validator.getMsg.pass('numeric'),
        test: function(element){
            return Form.Validator.getValidator('IsEmpty').test(element) ||
                (/^-?(?:0$0(?=\d*\.)|[1-9]|0)\d*(\.\d+)?$/).test(element.get('value'));
        }
    }],

    ['validate-digits', {
        errorMsg: Form.Validator.getMsg.pass('digits'),
        test: function(element){
            return Form.Validator.getValidator('IsEmpty').test(element) || (/^[\d() .:\-\+#]+$/.test(element.get('value')));
        }
    }],

    ['validate-alpha', {
        errorMsg: Form.Validator.getMsg.pass('alpha'),
        test: function(element){
            return Form.Validator.getValidator('IsEmpty').test(element) ||  (/^[a-zA-Z]+$/).test(element.get('value'));
        }
    }],

    ['validate-alphanum', {
        errorMsg: Form.Validator.getMsg.pass('alphanum'),
        test: function(element){
            return Form.Validator.getValidator('IsEmpty').test(element) || !(/\W/).test(element.get('value'));
        }
    }],

    ['validate-date', {
        errorMsg: function(element, props){
            if (Date.parse){
                var format = props.dateFormat || '%x';
                return Form.Validator.getMsg('dateSuchAs').substitute({date: new Date().format(format)});
            } else {
                return Form.Validator.getMsg('dateInFormatMDY');
            }
        },
        test: function(element, props){
            if (Form.Validator.getValidator('IsEmpty').test(element)) return true;
            var d;
            if (Date.parse){
                var format = props.dateFormat || '%x';
                d = Date.parse(element.get('value'));
                var formatted = d.format(format);
                if (formatted != 'invalid date') element.set('value', formatted);
                return !isNaN(d);
            } else {
                var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                if (!regex.test(element.get('value'))) return false;
                d = new Date(element.get('value').replace(regex, '$1/$2/$3'));
                return (parseInt(RegExp.$1, 10) == (1 + d.getMonth())) &&
                    (parseInt(RegExp.$2, 10) == d.getDate()) &&
                    (parseInt(RegExp.$3, 10) == d.getFullYear());
            }
        }
    }],

    ['validate-email', {
        errorMsg: Form.Validator.getMsg.pass('email'),
        test: function(element){
            return Form.Validator.getValidator('IsEmpty').test(element) || (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i).test(element.get('value'));
        }
    }],

    ['validate-url', {
        errorMsg: Form.Validator.getMsg.pass('url'),
        test: function(element){
            return Form.Validator.getValidator('IsEmpty').test(element) || (/^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i).test(element.get('value'));
        }
    }],

    ['validate-currency-dollar', {
        errorMsg: Form.Validator.getMsg.pass('currencyDollar'),
        test: function(element){
            // [$]1[##][,###]+[.##]
            // [$]1###+[.##]
            // [$]0.##
            // [$].##
            return Form.Validator.getValidator('IsEmpty').test(element) ||  (/^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/).test(element.get('value'));
        }
    }],

    ['validate-one-required', {
        errorMsg: Form.Validator.getMsg.pass('oneRequired'),
        test: function(element, props){
            var p = document.id(props['validate-one-required']) || element.getParent();
            return p.getElements('input').some(function(el){
                if (['checkbox', 'radio'].contains(el.get('type'))) return el.get('checked');
                return el.get('value');
            });
        }
    }]

]);

Element.Properties.validator = {

    set: function(options){
        var validator = this.retrieve('validator');
        if (validator) validator.setOptions(options);
        return this.store('validator:options');
    },

    get: function(options){
        if (options || !this.retrieve('validator')){
            if (options || !this.retrieve('validator:options')) this.set('validator', options);
            this.store('validator', new Form.Validator(this, this.retrieve('validator:options')));
        }
        return this.retrieve('validator');
    }

};

Element.implement({

    validate: function(options){
        this.set('validator', options);
        return this.get('validator', options).validate();
    }

});
//legacy
var FormValidator = Form.Validator;/*
---

script: Form.Validator.Inline.js

description: Extends Form.Validator to add inline messages.

license: MIT-style license

authors:
- Aaron Newton

requires:
- /Form.Validator

provides: [Form.Validator.Inline]

...
*/

Form.Validator.Inline = new Class({

    Extends: Form.Validator,

    options: {
        scrollToErrorsOnSubmit: true,
        scrollFxOptions: {
            transition: 'quad:out',
            offset: {
                y: -20
            }
        }
    },

    initialize: function(form, options){
        this.parent(form, options);
        this.addEvent('onElementValidate', function(isValid, field, className, warn){
            var validator = this.getValidator(className);
            if (!isValid && validator.getError(field)){
                if (warn) field.addClass('warning');
                var advice = this.makeAdvice(className, field, validator.getError(field), warn);
                this.insertAdvice(advice, field);
                this.showAdvice(className, field);
            } else {
                this.hideAdvice(className, field);
            }
        });
    },

    makeAdvice: function(className, field, error, warn){
        var errorMsg = (warn)?this.warningPrefix:this.errorPrefix;
            errorMsg += (this.options.useTitles) ? field.title || error:error;
        var cssClass = (warn) ? 'warning-advice' : 'validation-advice';
        var advice = this.getAdvice(className, field);
        if(advice) {
            advice = advice.set('html', errorMsg);
        } else {
            advice = new Element('div', {
                html: errorMsg,
                styles: { display: 'none' },
                id: 'advice-' + className + '-' + this.getFieldId(field)
            }).addClass(cssClass);
        }
        field.store('advice-' + className, advice);
        return advice;
    },

    getFieldId : function(field){
        return field.id ? field.id : field.id = 'input_' + field.name;
    },

    showAdvice: function(className, field){
        var advice = this.getAdvice(className, field);
        if (advice && !field.retrieve(this.getPropName(className))
                && (advice.getStyle('display') == 'none'
                || advice.getStyle('visiblity') == 'hidden'
                || advice.getStyle('opacity') == 0)){
            field.store(this.getPropName(className), true);
            if (advice.reveal) advice.reveal();
            else advice.setStyle('display', 'block');
        }
    },

    hideAdvice: function(className, field){
        var advice = this.getAdvice(className, field);
        if (advice && field.retrieve(this.getPropName(className))){
            field.store(this.getPropName(className), false);
            //if Fx.Reveal.js is present, transition the advice out
            if (advice.dissolve) advice.dissolve();
            else advice.setStyle('display', 'none');
        }
    },

    getPropName: function(className){
        return 'advice' + className;
    },

    resetField: function(field){
        field = document.id(field);
        if (!field) return this;
        this.parent(field);
        field.className.split(' ').each(function(className){
            this.hideAdvice(className, field);
        }, this);
        return this;
    },

    getAllAdviceMessages: function(field, force){
        var advice = [];
        if (field.hasClass('ignoreValidation') && !force) return advice;
        var validators = field.className.split(' ').some(function(cn){
            var warner = cn.test('^warn-') || field.hasClass('warnOnly');
            if (warner) cn = cn.replace(/^warn-/, '');
            var validator = this.getValidator(cn);
            if (!validator) return;
            advice.push({
                message: validator.getError(field),
                warnOnly: warner,
                passed: validator.test(),
                validator: validator
            });
        }, this);
        return advice;
    },

    getAdvice: function(className, field){
        return field.retrieve('advice-' + className);
    },

    insertAdvice: function(advice, field){
        //Check for error position prop
        var props = field.get('validatorProps');
        //Build advice
        if (!props.msgPos || !document.id(props.msgPos)){
            if(field.type.toLowerCase() == 'radio') field.getParent().adopt(advice);
            else advice.inject(document.id(field), 'after');
        } else {
            document.id(props.msgPos).grab(advice);
        }
    },

    validateField: function(field, force){
        var result = this.parent(field, force);
        if (this.options.scrollToErrorsOnSubmit && !result){
            var failed = document.id(this).getElement('.validation-failed');
            var par = document.id(this).getParent();
            while (par != document.body && par.getScrollSize().y == par.getSize().y){
                par = par.getParent();
            }
            var fx = par.retrieve('fvScroller');
            if (!fx && window.Fx && Fx.Scroll){
                fx = new Fx.Scroll(par, this.options.scrollFxOptions);
                par.store('fvScroller', fx);
            }
            if (failed){
                if (fx) fx.toElement(failed);
                else par.scrollTo(par.getScroll().x, failed.getPosition(par).y - 20);
            }
        }
        return result;
    }

});
/*
---

script: Form.Validator.Extras.js

description: Additional validators for the Form.Validator class.

license: MIT-style license

authors:
- Aaron Newton

requires:
- /Form.Validator

provides: [Form.Validator.Extras]

...
*/
Form.Validator.addAllThese([

    ['validate-enforce-oncheck', {
        test: function(element, props){
            if (element.checked){
                var fv = element.getParent('form').retrieve('validator');
                if (!fv) return true;
                (props.toEnforce || document.id(props.enforceChildrenOf).getElements('input, select, textarea')).map(function(item){
                    fv.enforceField(item);
                });
            }
            return true;
        }
    }],

    ['validate-ignore-oncheck', {
        test: function(element, props){
            if (element.checked){
                var fv = element.getParent('form').retrieve('validator');
                if (!fv) return true;
                (props.toIgnore || document.id(props.ignoreChildrenOf).getElements('input, select, textarea')).each(function(item){
                    fv.ignoreField(item);
                    fv.resetField(item);
                });
            }
            return true;
        }
    }],

    ['validate-nospace', {
        errorMsg: function(){
            return Form.Validator.getMsg('noSpace');
        },
        test: function(element, props){
            return !element.get('value').test(/\s/);
        }
    }],

    ['validate-toggle-oncheck', {
        test: function(element, props){
            var fv = element.getParent('form').retrieve('validator');
            if (!fv) return true;
            var eleArr = props.toToggle || document.id(props.toToggleChildrenOf).getElements('input, select, textarea');
            if (!element.checked){
                eleArr.each(function(item){
                    fv.ignoreField(item);
                    fv.resetField(item);
                });
            } else {
                eleArr.each(function(item){
                    fv.enforceField(item);
                });
            }
            return true;
        }
    }],

    ['validate-reqchk-bynode', {
        errorMsg: function(){
            return Form.Validator.getMsg('reqChkByNode');
        },
        test: function(element, props){
            return (document.id(props.nodeId).getElements(props.selector || 'input[type=checkbox], input[type=radio]')).some(function(item){
                return item.checked;
            });
        }
    }],

    ['validate-required-check', {
        errorMsg: function(element, props){
            return props.useTitle ? element.get('title') : Form.Validator.getMsg('requiredChk');
        },
        test: function(element, props){
            return !!element.checked;
        }
    }],

    ['validate-reqchk-byname', {
        errorMsg: function(element, props){
            return Form.Validator.getMsg('reqChkByName').substitute({label: props.label || element.get('type')});
        },
        test: function(element, props){
            var grpName = props.groupName || element.get('name');
            var oneCheckedItem = $$(document.getElementsByName(grpName)).some(function(item, index){
                return item.checked;
            });
            var fv = element.getParent('form').retrieve('validator');
            if (oneCheckedItem && fv) fv.resetField(element);
            return oneCheckedItem;
        }
    }],

    ['validate-match', {
        errorMsg: function(element, props){
            return Form.Validator.getMsg('match').substitute({matchName: props.matchName || document.id(props.matchInput).get('name')});
        },
        test: function(element, props){
            var eleVal = element.get('value');
            var matchVal = document.id(props.matchInput) && document.id(props.matchInput).get('value');
            return eleVal && matchVal ? eleVal == matchVal : true;
        }
    }],

    ['validate-after-date', {
        errorMsg: function(element, props){
            return Form.Validator.getMsg('afterDate').substitute({
                label: props.afterLabel || (props.afterElement ? Form.Validator.getMsg('startDate') : Form.Validator.getMsg('currentDate'))
            });
        },
        test: function(element, props){
            var start = document.id(props.afterElement) ? Date.parse(document.id(props.afterElement).get('value')) : new Date();
            var end = Date.parse(element.get('value'));
            return end && start ? end >= start : true;
        }
    }],

    ['validate-before-date', {
        errorMsg: function(element, props){
            return Form.Validator.getMsg('beforeDate').substitute({
                label: props.beforeLabel || (props.beforeElement ? Form.Validator.getMsg('endDate') : Form.Validator.getMsg('currentDate'))
            });
        },
        test: function(element, props){
            var start = Date.parse(element.get('value'));
            var end = document.id(props.beforeElement) ? Date.parse(document.id(props.beforeElement).get('value')) : new Date();
            return end && start ? end >= start : true;
        }
    }],

    ['validate-custom-required', {
        errorMsg: function(){
            return Form.Validator.getMsg('required');
        },
        test: function(element, props){
            return element.get('value') != props.emptyValue;
        }
    }],

    ['validate-same-month', {
        errorMsg: function(element, props){
            var startMo = document.id(props.sameMonthAs) && document.id(props.sameMonthAs).get('value');
            var eleVal = element.get('value');
            if (eleVal != '') return Form.Validator.getMsg(startMo ? 'sameMonth' : 'startMonth');
        },
        test: function(element, props){
            var d1 = Date.parse(element.get('value'));
            var d2 = Date.parse(document.id(props.sameMonthAs) && document.id(props.sameMonthAs).get('value'));
            return d1 && d2 ? d1.format('%B') == d2.format('%B') : true;
        }
    }],


    ['validate-cc-num', {
        errorMsg: function(element){
            var ccNum = element.get('value').ccNum.replace(/[^0-9]/g, '');
            return Form.Validator.getMsg('creditcard').substitute({length: ccNum.length});
        },
        test: function(element){
            // required is a different test
            if (Form.Validator.getValidator('IsEmpty').test(element)) { return true; }

            // Clean number value
            var ccNum = element.get('value');
            ccNum = ccNum.replace(/[^0-9]/g, '');

            var valid_type = false;

            if (ccNum.test(/^4[0-9]{12}([0-9]{3})?$/)) valid_type = 'Visa';
            else if (ccNum.test(/^5[1-5]([0-9]{14})$/)) valid_type = 'Master Card';
            else if (ccNum.test(/^3[47][0-9]{13}$/)) valid_type = 'American Express';
            else if (ccNum.test(/^6011[0-9]{12}$/)) valid_type = 'Discover';

            if (valid_type) {
                var sum = 0;
                var cur = 0;

                for(var i=ccNum.length-1; i>=0; --i) {
                    cur = ccNum.charAt(i).toInt();
                    if (cur == 0) { continue; }

                    if ((ccNum.length-i) % 2 == 0) { cur += cur; }
                    if (cur > 9) { cur = cur.toString().charAt(0).toInt() + cur.toString().charAt(1).toInt(); }

                    sum += cur;
                }
                if ((sum % 10) == 0) { return true; }
            }

            var chunks = '';
            while (ccNum != '') {
                chunks += ' ' + ccNum.substr(0,4);
                ccNum = ccNum.substr(4);
            }

            element.getParent('form').retrieve('validator').ignoreField(element);
            element.set('value', chunks.clean());
            element.getParent('form').retrieve('validator').enforceField(element);
            return false;
        }
    }]


]);/*
---

script: OverText.js

description: Shows text over an input that disappears when the user clicks into it. The text remains hidden if the user adds a value.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Options
- core:1.2.4/Events
- core:1.2.4/Element.Event
- /Class.Binds
- /Class.Occlude
- /Element.Position
- /Element.Shortcuts

provides: [OverText]

...
*/

var OverText = new Class({

    Implements: [Options, Events, Class.Occlude],

    Binds: ['reposition', 'assert', 'focus', 'hide'],

    options: {/*
        textOverride: null,
        onFocus: $empty()
        onTextHide: $empty(textEl, inputEl),
        onTextShow: $empty(textEl, inputEl), */
        element: 'label',
        positionOptions: {
            position: 'upperLeft',
            edge: 'upperLeft',
            offset: {
                x: 4,
                y: 2
            }
        },
        poll: false,
        pollInterval: 250,
        wrap: false
    },

    property: 'OverText',

    initialize: function(element, options){
        this.element = document.id(element);
        if (this.occlude()) return this.occluded;
        this.setOptions(options);
        this.attach(this.element);
        OverText.instances.push(this);
        if (this.options.poll) this.poll();
        return this;
    },

    toElement: function(){
        return this.element;
    },

    attach: function(){
        var val = this.options.textOverride || this.element.get('alt') || this.element.get('title');
        if (!val) return;
        this.text = new Element(this.options.element, {
            'class': 'overTxtLabel',
            styles: {
                lineHeight: 'normal',
                position: 'absolute',
                cursor: 'text'
            },
            html: val,
            events: {
                click: this.hide.pass(this.options.element == 'label', this)
            }
        }).inject(this.element, 'after');
        if (this.options.element == 'label') {
            if (!this.element.get('id')) this.element.set('id', 'input_' + new Date().getTime());
            this.text.set('for', this.element.get('id'));
        }

        if (this.options.wrap) {
            this.textHolder = new Element('div', {
                styles: {
                    lineHeight: 'normal',
                    position: 'relative'
                },
                'class':'overTxtWrapper'
            }).adopt(this.text).inject(this.element, 'before');
        }

        this.element.addEvents({
            focus: this.focus,
            blur: this.assert,
            change: this.assert
        }).store('OverTextDiv', this.text);
        window.addEvent('resize', this.reposition.bind(this));
        this.assert(true);
        this.reposition();
    },

    wrap: function(){
        if (this.options.element == 'label') {
            if (!this.element.get('id')) this.element.set('id', 'input_' + new Date().getTime());
            this.text.set('for', this.element.get('id'));
        }
    },

    startPolling: function(){
        this.pollingPaused = false;
        return this.poll();
    },

    poll: function(stop){
        //start immediately
        //pause on focus
        //resumeon blur
        if (this.poller && !stop) return this;
        var test = function(){
            if (!this.pollingPaused) this.assert(true);
        }.bind(this);
        if (stop) $clear(this.poller);
        else this.poller = test.periodical(this.options.pollInterval, this);
        return this;
    },

    stopPolling: function(){
        this.pollingPaused = true;
        return this.poll(true);
    },

    focus: function(){
        if (this.text && (!this.text.isDisplayed() || this.element.get('disabled'))) return;
        this.hide();
    },

    hide: function(suppressFocus, force){
        if (this.text && (this.text.isDisplayed() && (!this.element.get('disabled') || force))){
            this.text.hide();
            this.fireEvent('textHide', [this.text, this.element]);
            this.pollingPaused = true;
            try {
                if (!suppressFocus) this.element.fireEvent('focus');
                this.element.focus();
            } catch(e){} //IE barfs if you call focus on hidden elements
        }
        return this;
    },

    show: function(){
        if (this.text && !this.text.isDisplayed()){
            this.text.show();
            this.reposition();
            this.fireEvent('textShow', [this.text, this.element]);
            this.pollingPaused = false;
        }
        return this;
    },

    assert: function(suppressFocus){
        this[this.test() ? 'show' : 'hide'](suppressFocus);
    },

    test: function(){
        var v = this.element.get('value');
        return !v;
    },

    reposition: function(){
        this.assert(true);
        if (!this.element.isVisible()) return this.stopPolling().hide();
        if (this.text && this.test()) this.text.position($merge(this.options.positionOptions, {relativeTo: this.element}));
        return this;
    }

});

OverText.instances = [];

$extend(OverText, {

    each: function(fn) {
        return OverText.instances.map(function(ot, i){
            if (ot.element && ot.text) return fn.apply(OverText, [ot, i]);
            return null; //the input or the text was destroyed
        });
    },
    
    update: function(){

        return OverText.each(function(ot){
            return ot.reposition();
        });

    },

    hideAll: function(){

        return OverText.each(function(ot){
            return ot.hide(true, true);
        });

    },

    showAll: function(){
        return OverText.each(function(ot) {
            return ot.show();
        });
    }

});

if (window.Fx && Fx.Reveal) {
    Fx.Reveal.implement({
        hideInputs: Browser.Engine.trident ? 'select, input, textarea, object, embed, .overTxtLabel' : false
    });
}/*
---

script: Fx.Elements.js

description: Effect to change any number of CSS properties of any number of Elements.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Fx.CSS
- /MooTools.More

provides: [Fx.Elements]

...
*/

Fx.Elements = new Class({

    Extends: Fx.CSS,

    initialize: function(elements, options){
        this.elements = this.subject = $$(elements);
        this.parent(options);
    },

    compute: function(from, to, delta){
        var now = {};
        for (var i in from){
            var iFrom = from[i], iTo = to[i], iNow = now[i] = {};
            for (var p in iFrom) iNow[p] = this.parent(iFrom[p], iTo[p], delta);
        }
        return now;
    },

    set: function(now){
        for (var i in now){
            var iNow = now[i];
            for (var p in iNow) this.render(this.elements[i], p, iNow[p], this.options.unit);
        }
        return this;
    },

    start: function(obj){
        if (!this.check(obj)) return this;
        var from = {}, to = {};
        for (var i in obj){
            var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};
            for (var p in iProps){
                var parsed = this.prepare(this.elements[i], p, iProps[p]);
                iFrom[p] = parsed.from;
                iTo[p] = parsed.to;
            }
        }
        return this.parent(from, to);
    }

});/*
---

script: Fx.Accordion.js

description: An Fx.Elements extension which allows you to easily create accordion type controls.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Element.Event
- /Fx.Elements

provides: [Fx.Accordion]

...
*/

var Accordion = Fx.Accordion = new Class({

    Extends: Fx.Elements,

    options: {/*
        onActive: $empty(toggler, section),
        onBackground: $empty(toggler, section),
        fixedHeight: false,
        fixedWidth: false,
        */
        display: 0,
        show: false,
        height: true,
        width: false,
        opacity: true,
        alwaysHide: false,
        trigger: 'click',
        initialDisplayFx: true,
        returnHeightToAuto: true
    },

    initialize: function(){
        var params = Array.link(arguments, {'container': Element.type, 'options': Object.type, 'togglers': $defined, 'elements': $defined});
        this.parent(params.elements, params.options);
        this.togglers = $$(params.togglers);
        this.container = document.id(params.container);
        this.previous = -1;
        this.internalChain = new Chain();
        if (this.options.alwaysHide) this.options.wait = true;
        if ($chk(this.options.show)){
            this.options.display = false;
            this.previous = this.options.show;
        }
        if (this.options.start){
            this.options.display = false;
            this.options.show = false;
        }
        this.effects = {};
        if (this.options.opacity) this.effects.opacity = 'fullOpacity';
        if (this.options.width) this.effects.width = this.options.fixedWidth ? 'fullWidth' : 'offsetWidth';
        if (this.options.height) this.effects.height = this.options.fixedHeight ? 'fullHeight' : 'scrollHeight';
        for (var i = 0, l = this.togglers.length; i < l; i++) this.addSection(this.togglers[i], this.elements[i]);
        this.elements.each(function(el, i){
            if (this.options.show === i){
                this.fireEvent('active', [this.togglers[i], el]);
            } else {
                for (var fx in this.effects) el.setStyle(fx, 0);
            }
        }, this);
        if ($chk(this.options.display)) this.display(this.options.display, this.options.initialDisplayFx);
        this.addEvent('complete', this.internalChain.callChain.bind(this.internalChain));
    },

    addSection: function(toggler, element){
        toggler = document.id(toggler);
        element = document.id(element);
        var test = this.togglers.contains(toggler);
        this.togglers.include(toggler);
        this.elements.include(element);
        var idx = this.togglers.indexOf(toggler);
        var displayer = this.display.bind(this, idx);
        toggler.store('accordion:display', displayer);
        toggler.addEvent(this.options.trigger, displayer);
        if (this.options.height) element.setStyles({'padding-top': 0, 'border-top': 'none', 'padding-bottom': 0, 'border-bottom': 'none'});
        if (this.options.width) element.setStyles({'padding-left': 0, 'border-left': 'none', 'padding-right': 0, 'border-right': 'none'});
        element.fullOpacity = 1;
        if (this.options.fixedWidth) element.fullWidth = this.options.fixedWidth;
        if (this.options.fixedHeight) element.fullHeight = this.options.fixedHeight;
        element.setStyle('overflow', 'hidden');
        if (!test){
            for (var fx in this.effects) element.setStyle(fx, 0);
        }
        return this;
    },

    detach: function(){
        this.togglers.each(function(toggler) {
            toggler.removeEvent(this.options.trigger, toggler.retrieve('accordion:display'));
        }, this);
    },

    display: function(index, useFx){
        if (!this.check(index, useFx)) return this;
        useFx = $pick(useFx, true);
        if (this.options.returnHeightToAuto){
            var prev = this.elements[this.previous];
            if (prev && !this.selfHidden){
                for (var fx in this.effects){
                    prev.setStyle(fx, prev[this.effects[fx]]);
                }
            }
        }
        index = ($type(index) == 'element') ? this.elements.indexOf(index) : index;
        if ((this.timer && this.options.wait) || (index === this.previous && !this.options.alwaysHide)) return this;
        this.previous = index;
        var obj = {};
        this.elements.each(function(el, i){
            obj[i] = {};
            var hide;
            if (i != index){
                hide = true;
            } else if (this.options.alwaysHide && ((el.offsetHeight > 0 && this.options.height) || el.offsetWidth > 0 && this.options.width)){
                hide = true;
                this.selfHidden = true;
            }
            this.fireEvent(hide ? 'background' : 'active', [this.togglers[i], el]);
            for (var fx in this.effects) obj[i][fx] = hide ? 0 : el[this.effects[fx]];
        }, this);
        this.internalChain.chain(function(){
            if (this.options.returnHeightToAuto && !this.selfHidden){
                var el = this.elements[index];
                if (el) el.setStyle('height', 'auto');
            };
        }.bind(this));
        return useFx ? this.start(obj) : this.set(obj);
    }

});/*
---

script: Fx.Move.js

description: Defines Fx.Move, a class that works with Element.Position.js to transition an element from one location to another.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Fx.Morph
- /Element.Position

provides: [Fx.Move]

...
*/

Fx.Move = new Class({

    Extends: Fx.Morph,

    options: {
        relativeTo: document.body,
        position: 'center',
        edge: false,
        offset: {x: 0, y: 0}
    },

    start: function(destination){
        return this.parent(this.element.position($merge(this.options, destination, {returnPos: true})));
    }

});

Element.Properties.move = {

    set: function(options){
        var morph = this.retrieve('move');
        if (morph) morph.cancel();
        return this.eliminate('move').store('move:options', $extend({link: 'cancel'}, options));
    },

    get: function(options){
        if (options || !this.retrieve('move')){
            if (options || !this.retrieve('move:options')) this.set('move', options);
            this.store('move', new Fx.Move(this, this.retrieve('move:options')));
        }
        return this.retrieve('move');
    }

};

Element.implement({

    move: function(options){
        this.get('move').start(options);
        return this;
    }

});
/*
---

script: Fx.Reveal.js

description: Defines Fx.Reveal, a class that shows and hides elements with a transition.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Fx.Morph
- /Element.Shortcuts
- /Element.Measure

provides: [Fx.Reveal]

...
*/

Fx.Reveal = new Class({

    Extends: Fx.Morph,

    options: {/*      
        onShow: $empty(thisElement),
        onHide: $empty(thisElement),
        onComplete: $empty(thisElement),
        heightOverride: null,
        widthOverride: null, */
        link: 'cancel',
        styles: ['padding', 'border', 'margin'],
        transitionOpacity: !Browser.Engine.trident4,
        mode: 'vertical',
        display: 'block',
        hideInputs: Browser.Engine.trident ? 'select, input, textarea, object, embed' : false
    },

    dissolve: function(){
        try {
            if (!this.hiding && !this.showing){
                if (this.element.getStyle('display') != 'none'){
                    this.hiding = true;
                    this.showing = false;
                    this.hidden = true;
                    this.cssText = this.element.style.cssText;
                    var startStyles = this.element.getComputedSize({
                        styles: this.options.styles,
                        mode: this.options.mode
                    });
                    this.element.setStyle('display', 'block');
                    if (this.options.transitionOpacity) startStyles.opacity = 1;
                    var zero = {};
                    $each(startStyles, function(style, name){
                        zero[name] = [style, 0];
                    }, this);
                    this.element.setStyle('overflow', 'hidden');
                    var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
                    this.$chain.unshift(function(){
                        if (this.hidden){
                            this.hiding = false;
                            $each(startStyles, function(style, name){
                                startStyles[name] = style;
                            }, this);
                            this.element.style.cssText = this.cssText;
                            this.element.setStyle('display', 'none');
                            if (hideThese) hideThese.setStyle('visibility', 'visible');
                        }
                        this.fireEvent('hide', this.element);
                        this.callChain();
                    }.bind(this));
                    if (hideThese) hideThese.setStyle('visibility', 'hidden');
                    this.start(zero);
                } else {
                    this.callChain.delay(10, this);
                    this.fireEvent('complete', this.element);
                    this.fireEvent('hide', this.element);
                }
            } else if (this.options.link == 'chain'){
                this.chain(this.dissolve.bind(this));
            } else if (this.options.link == 'cancel' && !this.hiding){
                this.cancel();
                this.dissolve();
            }
        } catch(e){
            this.hiding = false;
            this.element.setStyle('display', 'none');
            this.callChain.delay(10, this);
            this.fireEvent('complete', this.element);
            this.fireEvent('hide', this.element);
        }
        return this;
    },

    reveal: function(){
        try {
            if (!this.showing && !this.hiding){
                if (this.element.getStyle('display') == 'none' ||
                     this.element.getStyle('visiblity') == 'hidden' ||
                     this.element.getStyle('opacity') == 0){
                    this.showing = true;
                    this.hiding = this.hidden =  false;
                    var startStyles;
                    this.cssText = this.element.style.cssText;
                    //toggle display, but hide it
                    this.element.measure(function(){
                        //create the styles for the opened/visible state
                        startStyles = this.element.getComputedSize({
                            styles: this.options.styles,
                            mode: this.options.mode
                        });
                    }.bind(this));
                    $each(startStyles, function(style, name){
                        startStyles[name] = style;
                    });
                    //if we're overridding height/width
                    if ($chk(this.options.heightOverride)) startStyles.height = this.options.heightOverride.toInt();
                    if ($chk(this.options.widthOverride)) startStyles.width = this.options.widthOverride.toInt();
                    if (this.options.transitionOpacity) {
                        this.element.setStyle('opacity', 0);
                        startStyles.opacity = 1;
                    }
                    //create the zero state for the beginning of the transition
                    var zero = {
                        height: 0,
                        display: this.options.display
                    };
                    $each(startStyles, function(style, name){ zero[name] = 0; });
                    //set to zero
                    this.element.setStyles($merge(zero, {overflow: 'hidden'}));
                    //hide inputs
                    var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
                    if (hideThese) hideThese.setStyle('visibility', 'hidden');
                    //start the effect
                    this.start(startStyles);
                    this.$chain.unshift(function(){
                        this.element.style.cssText = this.cssText;
                        this.element.setStyle('display', this.options.display);
                        if (!this.hidden) this.showing = false;
                        if (hideThese) hideThese.setStyle('visibility', 'visible');
                        this.callChain();
                        this.fireEvent('show', this.element);
                    }.bind(this));
                } else {
                    this.callChain();
                    this.fireEvent('complete', this.element);
                    this.fireEvent('show', this.element);
                }
            } else if (this.options.link == 'chain'){
                this.chain(this.reveal.bind(this));
            } else if (this.options.link == 'cancel' && !this.showing){
                this.cancel();
                this.reveal();
            }
        } catch(e){
            this.element.setStyles({
                display: this.options.display,
                visiblity: 'visible',
                opacity: 1
            });
            this.showing = false;
            this.callChain.delay(10, this);
            this.fireEvent('complete', this.element);
            this.fireEvent('show', this.element);
        }
        return this;
    },

    toggle: function(){
        if (this.element.getStyle('display') == 'none' ||
             this.element.getStyle('visiblity') == 'hidden' ||
             this.element.getStyle('opacity') == 0){
            this.reveal();
        } else {
            this.dissolve();
        }
        return this;
    },

    cancel: function(){
        this.parent.apply(this, arguments);
        this.element.style.cssText = this.cssText;
        this.hidding = false;
        this.showing = false;
    }

});

Element.Properties.reveal = {

    set: function(options){
        var reveal = this.retrieve('reveal');
        if (reveal) reveal.cancel();
        return this.eliminate('reveal').store('reveal:options', options);
    },

    get: function(options){
        if (options || !this.retrieve('reveal')){
            if (options || !this.retrieve('reveal:options')) this.set('reveal', options);
            this.store('reveal', new Fx.Reveal(this, this.retrieve('reveal:options')));
        }
        return this.retrieve('reveal');
    }

};

Element.Properties.dissolve = Element.Properties.reveal;

Element.implement({

    reveal: function(options){
        this.get('reveal', options).reveal();
        return this;
    },

    dissolve: function(options){
        this.get('reveal', options).dissolve();
        return this;
    },

    nix: function(){
        var params = Array.link(arguments, {destroy: Boolean.type, options: Object.type});
        this.get('reveal', params.options).dissolve().chain(function(){
            this[params.destroy ? 'destroy' : 'dispose']();
        }.bind(this));
        return this;
    },

    wink: function(){
        var params = Array.link(arguments, {duration: Number.type, options: Object.type});
        var reveal = this.get('reveal', params.options);
        reveal.reveal().chain(function(){
            (function(){
                reveal.dissolve();
            }).delay(params.duration || 2000);
        });
    }


});/*
---

script: Fx.Scroll.js

description: Effect to smoothly scroll any element, including the window.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Fx
- core:1.2.4/Element.Event
- core:1.2.4/Element.Dimensions
- /MooTools.More

provides: [Fx.Scroll]

...
*/

Fx.Scroll = new Class({

    Extends: Fx,

    options: {
        offset: {x: 0, y: 0},
        wheelStops: true
    },

    initialize: function(element, options){
        this.element = this.subject = document.id(element);
        this.parent(options);
        var cancel = this.cancel.bind(this, false);

        if ($type(this.element) != 'element') this.element = document.id(this.element.getDocument().body);

        var stopper = this.element;

        if (this.options.wheelStops){
            this.addEvent('start', function(){
                stopper.addEvent('mousewheel', cancel);
            }, true);
            this.addEvent('complete', function(){
                stopper.removeEvent('mousewheel', cancel);
            }, true);
        }
    },

    set: function(){
        var now = Array.flatten(arguments);
        if (Browser.Engine.gecko) now = [Math.round(now[0]), Math.round(now[1])];
        this.element.scrollTo(now[0], now[1]);
    },

    compute: function(from, to, delta){
        return [0, 1].map(function(i){
            return Fx.compute(from[i], to[i], delta);
        });
    },

    start: function(x, y){
        if (!this.check(x, y)) return this;
        var scrollSize = this.element.getScrollSize(),
            scroll = this.element.getScroll(), 
            values = {x: x, y: y};
        for (var z in values){
            var max = scrollSize[z];
            if ($chk(values[z])) values[z] = ($type(values[z]) == 'number') ? values[z] : max;
            else values[z] = scroll[z];
            values[z] += this.options.offset[z];
        }
        return this.parent([scroll.x, scroll.y], [values.x, values.y]);
    },

    toTop: function(){
        return this.start(false, 0);
    },

    toLeft: function(){
        return this.start(0, false);
    },

    toRight: function(){
        return this.start('right', false);
    },

    toBottom: function(){
        return this.start(false, 'bottom');
    },

    toElement: function(el){
        var position = document.id(el).getPosition(this.element);
        return this.start(position.x, position.y);
    },

    scrollIntoView: function(el, axes, offset){
        axes = axes ? $splat(axes) : ['x','y'];
        var to = {};
        el = document.id(el);
        var pos = el.getPosition(this.element);
        var size = el.getSize();
        var scroll = this.element.getScroll();
        var containerSize = this.element.getSize();
        var edge = {
            x: pos.x + size.x,
            y: pos.y + size.y
        };
        ['x','y'].each(function(axis) {
            if (axes.contains(axis)) {
                if (edge[axis] > scroll[axis] + containerSize[axis]) to[axis] = edge[axis] - containerSize[axis];
                if (pos[axis] < scroll[axis]) to[axis] = pos[axis];
            }
            if (to[axis] == null) to[axis] = scroll[axis];
            if (offset && offset[axis]) to[axis] = to[axis] + offset[axis];
        }, this);
        if (to.x != scroll.x || to.y != scroll.y) this.start(to.x, to.y);
        return this;
    },

    scrollToCenter: function(el, axes, offset){
        axes = axes ? $splat(axes) : ['x', 'y'];
        el = $(el);
        var to = {},
            pos = el.getPosition(this.element),
            size = el.getSize(),
            scroll = this.element.getScroll(),
            containerSize = this.element.getSize(),
            edge = {
                x: pos.x + size.x,
                y: pos.y + size.y
            };

        ['x','y'].each(function(axis){
            if(axes.contains(axis)){
                to[axis] = pos[axis] - (containerSize[axis] - size[axis])/2;
            }
            if(to[axis] == null) to[axis] = scroll[axis];
            if(offset && offset[axis]) to[axis] = to[axis] + offset[axis];
        }, this);
        if (to.x != scroll.x || to.y != scroll.y) this.start(to.x, to.y);
        return this;
    }

});
/*
---

script: Fx.Slide.js

description: Effect to slide an element in and out of view.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Fx Element.Style
- /MooTools.More

provides: [Fx.Slide]

...
*/

Fx.Slide = new Class({

    Extends: Fx,

    options: {
        mode: 'vertical',
        hideOverflow: true
    },

    initialize: function(element, options){
        this.addEvent('complete', function(){
            this.open = (this.wrapper['offset' + this.layout.capitalize()] != 0);
            if (this.open && Browser.Engine.webkit419) this.element.dispose().inject(this.wrapper);
        }, true);
        this.element = this.subject = document.id(element);
        this.parent(options);
        var wrapper = this.element.retrieve('wrapper');
        var styles = this.element.getStyles('margin', 'position', 'overflow');
        if (this.options.hideOverflow) styles = $extend(styles, {overflow: 'hidden'});
        this.wrapper = wrapper || new Element('div', {
            styles: styles
        }).wraps(this.element);
        this.element.store('wrapper', this.wrapper).setStyle('margin', 0);
        this.now = [];
        this.open = true;
    },

    vertical: function(){
        this.margin = 'margin-top';
        this.layout = 'height';
        this.offset = this.element.offsetHeight;
    },

    horizontal: function(){
        this.margin = 'margin-left';
        this.layout = 'width';
        this.offset = this.element.offsetWidth;
    },

    set: function(now){
        this.element.setStyle(this.margin, now[0]);
        this.wrapper.setStyle(this.layout, now[1]);
        return this;
    },

    compute: function(from, to, delta){
        return [0, 1].map(function(i){
            return Fx.compute(from[i], to[i], delta);
        });
    },

    start: function(how, mode){
        if (!this.check(how, mode)) return this;
        this[mode || this.options.mode]();
        var margin = this.element.getStyle(this.margin).toInt();
        var layout = this.wrapper.getStyle(this.layout).toInt();
        var caseIn = [[margin, layout], [0, this.offset]];
        var caseOut = [[margin, layout], [-this.offset, 0]];
        var start;
        switch (how){
            case 'in': start = caseIn; break;
            case 'out': start = caseOut; break;
            case 'toggle': start = (layout == 0) ? caseIn : caseOut;
        }
        return this.parent(start[0], start[1]);
    },

    slideIn: function(mode){
        return this.start('in', mode);
    },

    slideOut: function(mode){
        return this.start('out', mode);
    },

    hide: function(mode){
        this[mode || this.options.mode]();
        this.open = false;
        return this.set([-this.offset, 0]);
    },

    show: function(mode){
        this[mode || this.options.mode]();
        this.open = true;
        return this.set([0, this.offset]);
    },

    toggle: function(mode){
        return this.start('toggle', mode);
    }

});

Element.Properties.slide = {

    set: function(options){
        var slide = this.retrieve('slide');
        if (slide) slide.cancel();
        return this.eliminate('slide').store('slide:options', $extend({link: 'cancel'}, options));
    },

    get: function(options){
        if (options || !this.retrieve('slide')){
            if (options || !this.retrieve('slide:options')) this.set('slide', options);
            this.store('slide', new Fx.Slide(this, this.retrieve('slide:options')));
        }
        return this.retrieve('slide');
    }

};

Element.implement({

    slide: function(how, mode){
        how = how || 'toggle';
        var slide = this.get('slide'), toggle;
        switch (how){
            case 'hide': slide.hide(mode); break;
            case 'show': slide.show(mode); break;
            case 'toggle':
                var flag = this.retrieve('slide:flag', slide.open);
                slide[flag ? 'slideOut' : 'slideIn'](mode);
                this.store('slide:flag', !flag);
                toggle = true;
            break;
            default: slide.start(how, mode);
        }
        if (!toggle) this.eliminate('slide:flag');
        return this;
    }

});
/*
---

script: Fx.SmoothScroll.js

description: Class for creating a smooth scrolling effect to all internal links on the page.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Selectors
- /Fx.Scroll

provides: [Fx.SmoothScroll]

...
*/

var SmoothScroll = Fx.SmoothScroll = new Class({

    Extends: Fx.Scroll,

    initialize: function(options, context){
        context = context || document;
        this.doc = context.getDocument();
        var win = context.getWindow();
        this.parent(this.doc, options);
        this.links = $$(this.options.links || this.doc.links);
        var location = win.location.href.match(/^[^#]*/)[0] + '#';
        this.links.each(function(link){
            if (link.href.indexOf(location) != 0) {return;}
            var anchor = link.href.substr(location.length);
            if (anchor) this.useLink(link, anchor);
        }, this);
        if (!Browser.Engine.webkit419) {
            this.addEvent('complete', function(){
                win.location.hash = this.anchor;
            }, true);
        }
    },

    useLink: function(link, anchor){
        var el;
        link.addEvent('click', function(event){
            if (el !== false && !el) el = document.id(anchor) || this.doc.getElement('a[name=' + anchor + ']');
            if (el) {
                event.preventDefault();
                this.anchor = anchor;
                this.toElement(el).chain(function(){
                    this.fireEvent('scrolledTo', [link, el]);
                }.bind(this));
                link.blur();
            }
        }.bind(this));
    }
});/*
---

script: Fx.Sort.js

description: Defines Fx.Sort, a class that reorders lists with a transition.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Dimensions
- /Fx.Elements
- /Element.Measure

provides: [Fx.Sort]

...
*/

Fx.Sort = new Class({

    Extends: Fx.Elements,

    options: {
        mode: 'vertical'
    },

    initialize: function(elements, options){
        this.parent(elements, options);
        this.elements.each(function(el){
            if (el.getStyle('position') == 'static') el.setStyle('position', 'relative');
        });
        this.setDefaultOrder();
    },

    setDefaultOrder: function(){
        this.currentOrder = this.elements.map(function(el, index){
            return index;
        });
    },

    sort: function(newOrder){
        if ($type(newOrder) != 'array') return false;
        var top = 0,
            left = 0,
            next = {},
            zero = {},
            vert = this.options.mode == 'vertical';
        var current = this.elements.map(function(el, index){
            var size = el.getComputedSize({styles: ['border', 'padding', 'margin']});
            var val;
            if (vert){
                val = {
                    top: top,
                    margin: size['margin-top'],
                    height: size.totalHeight
                };
                top += val.height - size['margin-top'];
            } else {
                val = {
                    left: left,
                    margin: size['margin-left'],
                    width: size.totalWidth
                };
                left += val.width;
            }
            var plain = vert ? 'top' : 'left';
            zero[index] = {};
            var start = el.getStyle(plain).toInt();
            zero[index][plain] = start || 0;
            return val;
        }, this);
        this.set(zero);
        newOrder = newOrder.map(function(i){ return i.toInt(); });
        if (newOrder.length != this.elements.length){
            this.currentOrder.each(function(index){
                if (!newOrder.contains(index)) newOrder.push(index);
            });
            if (newOrder.length > this.elements.length)
                newOrder.splice(this.elements.length-1, newOrder.length - this.elements.length);
        }
        var margin = top = left = 0;
        newOrder.each(function(item, index){
            var newPos = {};
            if (vert){
                newPos.top = top - current[item].top - margin;
                top += current[item].height;
            } else {
                newPos.left = left - current[item].left;
                left += current[item].width;
            }
            margin = margin + current[item].margin;
            next[item]=newPos;
        }, this);
        var mapped = {};
        $A(newOrder).sort().each(function(index){
            mapped[index] = next[index];
        });
        this.start(mapped);
        this.currentOrder = newOrder;
        return this;
    },

    rearrangeDOM: function(newOrder){
        newOrder = newOrder || this.currentOrder;
        var parent = this.elements[0].getParent();
        var rearranged = [];
        this.elements.setStyle('opacity', 0);
        //move each element and store the new default order
        newOrder.each(function(index){
            rearranged.push(this.elements[index].inject(parent).setStyles({
                top: 0,
                left: 0
            }));
        }, this);
        this.elements.setStyle('opacity', 1);
        this.elements = $$(rearranged);
        this.setDefaultOrder();
        return this;
    },

    getDefaultOrder: function(){
        return this.elements.map(function(el, index){
            return index;
        });
    },

    forward: function(){
        return this.sort(this.getDefaultOrder());
    },

    backward: function(){
        return this.sort(this.getDefaultOrder().reverse());
    },

    reverse: function(){
        return this.sort(this.currentOrder.reverse());
    },

    sortByElements: function(elements){
        return this.sort(elements.map(function(el){
            return this.elements.indexOf(el);
        }, this));
    },

    swap: function(one, two){
        if ($type(one) == 'element') one = this.elements.indexOf(one);
        if ($type(two) == 'element') two = this.elements.indexOf(two);
        
        var newOrder = $A(this.currentOrder);
        newOrder[this.currentOrder.indexOf(one)] = two;
        newOrder[this.currentOrder.indexOf(two)] = one;
        return this.sort(newOrder);
    }

});/*
---

script: Drag.js

description: The base Drag Class. Can be used to drag and resize Elements using mouse events.

license: MIT-style license

authors:
- Valerio Proietti
- Tom Occhinno
- Jan Kassens

requires:
- core:1.2.4/Events
- core:1.2.4/Options
- core:1.2.4/Element.Event
- core:1.2.4/Element.Style
- /MooTools.More

provides: [Drag]

*/

var Drag = new Class({

    Implements: [Events, Options],

    options: {/*
        onBeforeStart: $empty(thisElement),
        onStart: $empty(thisElement, event),
        onSnap: $empty(thisElement)
        onDrag: $empty(thisElement, event),
        onCancel: $empty(thisElement),
        onComplete: $empty(thisElement, event),*/
        snap: 6,
        unit: 'px',
        grid: false,
        style: true,
        limit: false,
        handle: false,
        invert: false,
        preventDefault: false,
        stopPropagation: false,
        modifiers: {x: 'left', y: 'top'}
    },

    initialize: function(){
        var params = Array.link(arguments, {'options': Object.type, 'element': $defined});
        this.element = document.id(params.element);
        this.document = this.element.getDocument();
        this.setOptions(params.options || {});
        var htype = $type(this.options.handle);
        this.handles = ((htype == 'array' || htype == 'collection') ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
        this.mouse = {'now': {}, 'pos': {}};
        this.value = {'start': {}, 'now': {}};

        this.selection = (Browser.Engine.trident) ? 'selectstart' : 'mousedown';

        this.bound = {
            start: this.start.bind(this),
            check: this.check.bind(this),
            drag: this.drag.bind(this),
            stop: this.stop.bind(this),
            cancel: this.cancel.bind(this),
            eventStop: $lambda(false)
        };
        this.attach();
    },

    attach: function(){
        this.handles.addEvent('mousedown', this.bound.start);
        return this;
    },

    detach: function(){
        this.handles.removeEvent('mousedown', this.bound.start);
        return this;
    },

    start: function(event){
        if (event.rightClick) return;
        if (this.options.preventDefault) event.preventDefault();
        if (this.options.stopPropagation) event.stopPropagation();
        this.mouse.start = event.page;
        this.fireEvent('beforeStart', this.element);
        var limit = this.options.limit;
        this.limit = {x: [], y: []};
        for (var z in this.options.modifiers){
            if (!this.options.modifiers[z]) continue;
            if (this.options.style) this.value.now[z] = this.element.getStyle(this.options.modifiers[z]).toInt();
            else this.value.now[z] = this.element[this.options.modifiers[z]];
            if (this.options.invert) this.value.now[z] *= -1;
            this.mouse.pos[z] = event.page[z] - this.value.now[z];
            if (limit && limit[z]){
                for (var i = 2; i--; i){
                    if ($chk(limit[z][i])) this.limit[z][i] = $lambda(limit[z][i])();
                }
            }
        }
        if ($type(this.options.grid) == 'number') this.options.grid = {x: this.options.grid, y: this.options.grid};
        this.document.addEvents({mousemove: this.bound.check, mouseup: this.bound.cancel});
        this.document.addEvent(this.selection, this.bound.eventStop);
    },

    check: function(event){
        if (this.options.preventDefault) event.preventDefault();
        var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
        if (distance > this.options.snap){
            this.cancel();
            this.document.addEvents({
                mousemove: this.bound.drag,
                mouseup: this.bound.stop
            });
            this.fireEvent('start', [this.element, event]).fireEvent('snap', this.element);
        }
    },

    drag: function(event){
        if (this.options.preventDefault) event.preventDefault();
        this.mouse.now = event.page;
        for (var z in this.options.modifiers){
            if (!this.options.modifiers[z]) continue;
            this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];
            if (this.options.invert) this.value.now[z] *= -1;
            if (this.options.limit && this.limit[z]){
                if ($chk(this.limit[z][1]) && (this.value.now[z] > this.limit[z][1])){
                    this.value.now[z] = this.limit[z][1];
                } else if ($chk(this.limit[z][0]) && (this.value.now[z] < this.limit[z][0])){
                    this.value.now[z] = this.limit[z][0];
                }
            }
            if (this.options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % this.options.grid[z]);
            if (this.options.style) {
                this.element.setStyle(this.options.modifiers[z], this.value.now[z] + this.options.unit);
            } else {
                this.element[this.options.modifiers[z]] = this.value.now[z];
            }
        }
        this.fireEvent('drag', [this.element, event]);
    },

    cancel: function(event){
        this.document.removeEvent('mousemove', this.bound.check);
        this.document.removeEvent('mouseup', this.bound.cancel);
        if (event){
            this.document.removeEvent(this.selection, this.bound.eventStop);
            this.fireEvent('cancel', this.element);
        }
    },

    stop: function(event){
        this.document.removeEvent(this.selection, this.bound.eventStop);
        this.document.removeEvent('mousemove', this.bound.drag);
        this.document.removeEvent('mouseup', this.bound.stop);
        if (event) this.fireEvent('complete', [this.element, event]);
    }

});

Element.implement({

    makeResizable: function(options){
        var drag = new Drag(this, $merge({modifiers: {x: 'width', y: 'height'}}, options));
        this.store('resizer', drag);
        return drag.addEvent('drag', function(){
            this.fireEvent('resize', drag);
        }.bind(this));
    }

});
/*
---

script: Drag.Move.js

description: A Drag extension that provides support for the constraining of draggables to containers and droppables.

license: MIT-style license

authors:
- Valerio Proietti
- Tom Occhinno
- Jan Kassens
- Aaron Newton
- Scott Kyle

requires:
- core:1.2.4/Element.Dimensions
- /Drag

provides: [Drag.Move]

...
*/

Drag.Move = new Class({

    Extends: Drag,

    options: {/*
        onEnter: $empty(thisElement, overed),
        onLeave: $empty(thisElement, overed),
        onDrop: $empty(thisElement, overed, event),*/
        droppables: [],
        container: false,
        precalculate: false,
        includeMargins: true,
        checkDroppables: true
    },

    initialize: function(element, options){
        this.parent(element, options);
        element = this.element;
        
        this.droppables = $$(this.options.droppables);
        this.container = document.id(this.options.container);
        
        if (this.container && $type(this.container) != 'element')
            this.container = document.id(this.container.getDocument().body);
        
        var styles = element.getStyles('left', 'right', 'position');
        if (styles.left == 'auto' || styles.top == 'auto')
            element.setPosition(element.getPosition(element.getOffsetParent()));
        
        if (styles.position == 'static')
            element.setStyle('position', 'absolute');

        this.addEvent('start', this.checkDroppables, true);

        this.overed = null;
    },

    start: function(event){
        if (this.container) this.options.limit = this.calculateLimit();
        
        if (this.options.precalculate){
            this.positions = this.droppables.map(function(el){
                return el.getCoordinates();
            });
        }
        
        this.parent(event);
    },
    
    calculateLimit: function(){
        var offsetParent = this.element.getOffsetParent(),
            containerCoordinates = this.container.getCoordinates(offsetParent),
            containerBorder = {},
            elementMargin = {},
            elementBorder = {},
            containerMargin = {},
            offsetParentPadding = {};

        ['top', 'right', 'bottom', 'left'].each(function(pad){
            containerBorder[pad] = this.container.getStyle('border-' + pad).toInt();
            elementBorder[pad] = this.element.getStyle('border-' + pad).toInt();
            elementMargin[pad] = this.element.getStyle('margin-' + pad).toInt();
            containerMargin[pad] = this.container.getStyle('margin-' + pad).toInt();
            offsetParentPadding[pad] = offsetParent.getStyle('padding-' + pad).toInt();
        }, this);

        var width = this.element.offsetWidth + elementMargin.left + elementMargin.right,
            height = this.element.offsetHeight + elementMargin.top + elementMargin.bottom,
            left = 0,
            top = 0,
            right = containerCoordinates.right - containerBorder.right - width,
            bottom = containerCoordinates.bottom - containerBorder.bottom - height;

        if (this.options.includeMargins){
            left += elementMargin.left;
            top += elementMargin.top;
        } else {
            right += elementMargin.right;
            bottom += elementMargin.bottom;
        }
        
        if (this.element.getStyle('position') == 'relative'){
            var coords = this.element.getCoordinates(offsetParent);
            coords.left -= this.element.getStyle('left').toInt();
            coords.top -= this.element.getStyle('top').toInt();
            
            left += containerBorder.left - coords.left;
            top += containerBorder.top - coords.top;
            right += elementMargin.left - coords.left;
            bottom += elementMargin.top - coords.top;
            
            if (this.container != offsetParent){
                left += containerMargin.left + offsetParentPadding.left;
                top += (Browser.Engine.trident4 ? 0 : containerMargin.top) + offsetParentPadding.top;
            }
        } else {
            left -= elementMargin.left;
            top -= elementMargin.top;
            
            if (this.container == offsetParent){
                right -= containerBorder.left;
                bottom -= containerBorder.top;
            } else {
                left += containerCoordinates.left + containerBorder.left;
                top += containerCoordinates.top + containerBorder.top;
            }
        }
        
        return {
            x: [left, right],
            y: [top, bottom]
        };
    },

    checkAgainst: function(el, i){
        el = (this.positions) ? this.positions[i] : el.getCoordinates();
        var now = this.mouse.now;
        return (now.x > el.left && now.x < el.right && now.y < el.bottom && now.y > el.top);
    },

    checkDroppables: function(){
        var overed = this.droppables.filter(this.checkAgainst, this).getLast();
        if (this.overed != overed){
            if (this.overed) this.fireEvent('leave', [this.element, this.overed]);
            if (overed) this.fireEvent('enter', [this.element, overed]);
            this.overed = overed;
        }
    },

    drag: function(event){
        this.parent(event);
        if (this.options.checkDroppables && this.droppables.length) this.checkDroppables();
    },

    stop: function(event){
        this.checkDroppables();
        this.fireEvent('drop', [this.element, this.overed, event]);
        this.overed = null;
        return this.parent(event);
    }

});

Element.implement({

    makeDraggable: function(options){
        var drag = new Drag.Move(this, options);
        this.store('dragger', drag);
        return drag;
    }

});
/*
---

script: Slider.js

description: Class for creating horizontal and vertical slider controls.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Element.Dimensions
- /Class.Binds
- /Drag
- /Element.Dimensions
- /Element.Measure

provides: [Slider]

...
*/

var Slider = new Class({

    Implements: [Events, Options],

    Binds: ['clickedElement', 'draggedKnob', 'scrolledElement'],

    options: {/*
        onTick: $empty(intPosition),
        onChange: $empty(intStep),
        onComplete: $empty(strStep),*/
        onTick: function(position){
            if (this.options.snap) position = this.toPosition(this.step);
            this.knob.setStyle(this.property, position);
        },
        initialStep: 0,
        snap: false,
        offset: 0,
        range: false,
        wheel: false,
        steps: 100,
        mode: 'horizontal'
    },

    initialize: function(element, knob, options){
        this.setOptions(options);
        this.element = document.id(element);
        this.knob = document.id(knob);
        this.previousChange = this.previousEnd = this.step = -1;
        var offset, limit = {}, modifiers = {'x': false, 'y': false};
        switch (this.options.mode){
            case 'vertical':
                this.axis = 'y';
                this.property = 'top';
                offset = 'offsetHeight';
                break;
            case 'horizontal':
                this.axis = 'x';
                this.property = 'left';
                offset = 'offsetWidth';
        }
        
        this.full = this.element.measure(function(){ 
            this.half = this.knob[offset] / 2; 
            return this.element[offset] - this.knob[offset] + (this.options.offset * 2); 
        }.bind(this));
        
        this.min = $chk(this.options.range[0]) ? this.options.range[0] : 0;
        this.max = $chk(this.options.range[1]) ? this.options.range[1] : this.options.steps;
        this.range = this.max - this.min;
        this.steps = this.options.steps || this.full;
        this.stepSize = Math.abs(this.range) / this.steps;
        this.stepWidth = this.stepSize * this.full / Math.abs(this.range) ;

        this.knob.setStyle('position', 'relative').setStyle(this.property, this.options.initialStep ? this.toPosition(this.options.initialStep) : - this.options.offset);
        modifiers[this.axis] = this.property;
        limit[this.axis] = [- this.options.offset, this.full - this.options.offset];

        var dragOptions = {
            snap: 0,
            limit: limit,
            modifiers: modifiers,
            onDrag: this.draggedKnob,
            onStart: this.draggedKnob,
            onBeforeStart: (function(){
                this.isDragging = true;
            }).bind(this),
            onCancel: function() {
                this.isDragging = false;
            }.bind(this),
            onComplete: function(){
                this.isDragging = false;
                this.draggedKnob();
                this.end();
            }.bind(this)
        };
        if (this.options.snap){
            dragOptions.grid = Math.ceil(this.stepWidth);
            dragOptions.limit[this.axis][1] = this.full;
        }

        this.drag = new Drag(this.knob, dragOptions);
        this.attach();
    },

    attach: function(){
        this.element.addEvent('mousedown', this.clickedElement);
        if (this.options.wheel) this.element.addEvent('mousewheel', this.scrolledElement);
        this.drag.attach();
        return this;
    },

    detach: function(){
        this.element.removeEvent('mousedown', this.clickedElement);
        this.element.removeEvent('mousewheel', this.scrolledElement);
        this.drag.detach();
        return this;
    },

    set: function(step){
        if (!((this.range > 0) ^ (step < this.min))) step = this.min;
        if (!((this.range > 0) ^ (step > this.max))) step = this.max;

        this.step = Math.round(step);
        this.checkStep();
        this.fireEvent('tick', this.toPosition(this.step));
        this.end();
        return this;
    },

    clickedElement: function(event){
        if (this.isDragging || event.target == this.knob) return;

        var dir = this.range < 0 ? -1 : 1;
        var position = event.page[this.axis] - this.element.getPosition()[this.axis] - this.half;
        position = position.limit(-this.options.offset, this.full -this.options.offset);

        this.step = Math.round(this.min + dir * this.toStep(position));
        this.checkStep();
        this.fireEvent('tick', position);
        this.end();
    },

    scrolledElement: function(event){
        var mode = (this.options.mode == 'horizontal') ? (event.wheel < 0) : (event.wheel > 0);
        this.set(mode ? this.step - this.stepSize : this.step + this.stepSize);
        event.stop();
    },

    draggedKnob: function(){
        var dir = this.range < 0 ? -1 : 1;
        var position = this.drag.value.now[this.axis];
        position = position.limit(-this.options.offset, this.full -this.options.offset);
        this.step = Math.round(this.min + dir * this.toStep(position));
        this.checkStep();
    },

    checkStep: function(){
        if (this.previousChange != this.step){
            this.previousChange = this.step;
            this.fireEvent('change', this.step);
        }
    },

    end: function(){
        if (this.previousEnd !== this.step){
            this.previousEnd = this.step;
            this.fireEvent('complete', this.step + '');
        }
    },

    toStep: function(position){
        var step = (position + this.options.offset) * this.stepSize / this.full * this.steps;
        return this.options.steps ? Math.round(step -= step % this.stepSize) : step;
    },

    toPosition: function(step){
        return (this.full * Math.abs(this.min - step)) / (this.steps * this.stepSize) - this.options.offset;
    }

});/*
---

script: Sortables.js

description: Class for creating a drag and drop sorting interface for lists of items.

license: MIT-style license

authors:
- Tom Occhino

requires:
- /Drag.Move

provides: [Slider]

...
*/

var Sortables = new Class({

    Implements: [Events, Options],

    options: {/*
        onSort: $empty(element, clone),
        onStart: $empty(element, clone),
        onComplete: $empty(element),*/
        snap: 4,
        opacity: 1,
        clone: false,
        revert: false,
        handle: false,
        constrain: false
    },

    initialize: function(lists, options){
        this.setOptions(options);
        this.elements = [];
        this.lists = [];
        this.idle = true;

        this.addLists($$(document.id(lists) || lists));
        if (!this.options.clone) this.options.revert = false;
        if (this.options.revert) this.effect = new Fx.Morph(null, $merge({duration: 250, link: 'cancel'}, this.options.revert));
    },

    attach: function(){
        this.addLists(this.lists);
        return this;
    },

    detach: function(){
        this.lists = this.removeLists(this.lists);
        return this;
    },

    addItems: function(){
        Array.flatten(arguments).each(function(element){
            this.elements.push(element);
            var start = element.retrieve('sortables:start', this.start.bindWithEvent(this, element));
            (this.options.handle ? element.getElement(this.options.handle) || element : element).addEvent('mousedown', start);
        }, this);
        return this;
    },

    addLists: function(){
        Array.flatten(arguments).each(function(list){
            this.lists.push(list);
            this.addItems(list.getChildren());
        }, this);
        return this;
    },

    removeItems: function(){
        return $$(Array.flatten(arguments).map(function(element){
            this.elements.erase(element);
            var start = element.retrieve('sortables:start');
            (this.options.handle ? element.getElement(this.options.handle) || element : element).removeEvent('mousedown', start);
            
            return element;
        }, this));
    },

    removeLists: function(){
        return $$(Array.flatten(arguments).map(function(list){
            this.lists.erase(list);
            this.removeItems(list.getChildren());
            
            return list;
        }, this));
    },

    getClone: function(event, element){
        if (!this.options.clone) return new Element('div').inject(document.body);
        if ($type(this.options.clone) == 'function') return this.options.clone.call(this, event, element, this.list);
        return element.clone(true).setStyles({
            margin: '0px',
            position: 'absolute',
            visibility: 'hidden',
            'width': element.getStyle('width')
        }).inject(this.list).setPosition(element.getPosition(element.getOffsetParent()));
    },

    getDroppables: function(){
        var droppables = this.list.getChildren();
        if (!this.options.constrain) droppables = this.lists.concat(droppables).erase(this.list);
        return droppables.erase(this.clone).erase(this.element);
    },

    insert: function(dragging, element){
        var where = 'inside';
        if (this.lists.contains(element)){
            this.list = element;
            this.drag.droppables = this.getDroppables();
        } else {
            where = this.element.getAllPrevious().contains(element) ? 'before' : 'after';
        }
        this.element.inject(element, where);
        this.fireEvent('sort', [this.element, this.clone]);
    },

    start: function(event, element){
        if (!this.idle) return;
        this.idle = false;
        this.element = element;
        this.opacity = element.get('opacity');
        this.list = element.getParent();
        this.clone = this.getClone(event, element);

        this.drag = new Drag.Move(this.clone, {
            snap: this.options.snap,
            container: this.options.constrain && this.element.getParent(),
            droppables: this.getDroppables(),
            onSnap: function(){
                event.stop();
                this.clone.setStyle('visibility', 'visible');
                this.element.set('opacity', this.options.opacity || 0);
                this.fireEvent('start', [this.element, this.clone]);
            }.bind(this),
            onEnter: this.insert.bind(this),
            onCancel: this.reset.bind(this),
            onComplete: this.end.bind(this)
        });

        this.clone.inject(this.element, 'before');
        this.drag.start(event);
    },

    end: function(){
        this.drag.detach();
        this.element.set('opacity', this.opacity);
        if (this.effect){
            var dim = this.element.getStyles('width', 'height');
            var pos = this.clone.computePosition(this.element.getPosition(this.clone.offsetParent));
            this.effect.element = this.clone;
            this.effect.start({
                top: pos.top,
                left: pos.left,
                width: dim.width,
                height: dim.height,
                opacity: 0.25
            }).chain(this.reset.bind(this));
        } else {
            this.reset();
        }
    },

    reset: function(){
        this.idle = true;
        this.clone.destroy();
        this.fireEvent('complete', this.element);
    },

    serialize: function(){
        var params = Array.link(arguments, {modifier: Function.type, index: $defined});
        var serial = this.lists.map(function(list){
            return list.getChildren().map(params.modifier || function(element){
                return element.get('id');
            }, this);
        }, this);

        var index = params.index;
        if (this.lists.length == 1) index = 0;
        return $chk(index) && index >= 0 && index < this.lists.length ? serial[index] : serial;
    }

});
/*
---

script: Request.JSONP.js

description: Defines Request.JSONP, a class for cross domain javascript via script injection.

license: MIT-style license

authors:
- Aaron Newton
- Guillermo Rauch

requires:
- core:1.2.4/Element
- core:1.2.4/Request
- /Log

provides: [Request.JSONP]

...
*/

Request.JSONP = new Class({

    Implements: [Chain, Events, Options, Log],

    options: {/*
        onRetry: $empty(intRetries),
        onRequest: $empty(scriptElement),
        onComplete: $empty(data),
        onSuccess: $empty(data),
        onCancel: $empty(),
        log: false,
        */
        url: '',
        data: {},
        retries: 0,
        timeout: 0,
        link: 'ignore',
        callbackKey: 'callback',
        injectScript: document.head
    },

    initialize: function(options){
        this.setOptions(options);
        if (this.options.log) this.enableLog();
        this.running = false;
        this.requests = 0;
        this.triesRemaining = [];
    },

    check: function(){
        if (!this.running) return true;
        switch (this.options.link){
            case 'cancel': this.cancel(); return true;
            case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
        }
        return false;
    },

    send: function(options){
        if (!$chk(arguments[1]) && !this.check(options)) return this;

        var type = $type(options), 
                old = this.options, 
                index = $chk(arguments[1]) ? arguments[1] : this.requests++;
        if (type == 'string' || type == 'element') options = {data: options};

        options = $extend({data: old.data, url: old.url}, options);

        if (!$chk(this.triesRemaining[index])) this.triesRemaining[index] = this.options.retries;
        var remaining = this.triesRemaining[index];

        (function(){
            var script = this.getScript(options);
            this.log('JSONP retrieving script with url: ' + script.get('src'));
            this.fireEvent('request', script);
            this.running = true;

            (function(){
                if (remaining){
                    this.triesRemaining[index] = remaining - 1;
                    if (script){
                        script.destroy();
                        this.send(options, index).fireEvent('retry', this.triesRemaining[index]);
                    }
                } else if(script && this.options.timeout){
                    script.destroy();
                    this.cancel().fireEvent('failure');
                }
            }).delay(this.options.timeout, this);
        }).delay(Browser.Engine.trident ? 50 : 0, this);
        return this;
    },

    cancel: function(){
        if (!this.running) return this;
        this.running = false;
        this.fireEvent('cancel');
        return this;
    },

    getScript: function(options){
        var index = Request.JSONP.counter,
                data;
        Request.JSONP.counter++;

        switch ($type(options.data)){
            case 'element': data = document.id(options.data).toQueryString(); break;
            case 'object': case 'hash': data = Hash.toQueryString(options.data);
        }

        var src = options.url + 
             (options.url.test('\\?') ? '&' :'?') + 
             (options.callbackKey || this.options.callbackKey) + 
             '=Request.JSONP.request_map.request_'+ index + 
             (data ? '&' + data : '');
        if (src.length > 2083) this.log('JSONP '+ src +' will fail in Internet Explorer, which enforces a 2083 bytes length limit on URIs');

        var script = new Element('script', {type: 'text/javascript', src: src});
        Request.JSONP.request_map['request_' + index] = function(data){ this.success(data, script); }.bind(this);
        return script.inject(this.options.injectScript);
    },

    success: function(data, script){
        if (script) script.destroy();
        this.running = false;
        this.log('JSONP successfully retrieved: ', data);
        this.fireEvent('complete', [data]).fireEvent('success', [data]).callChain();
    }

});

Request.JSONP.counter = 0;
Request.JSONP.request_map = {};/*
---

script: Request.Queue.js

description: Controls several instances of Request and its variants to run only one request at a time.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element
- core:1.2.4/Request
- /Log

provides: [Request.Queue]

...
*/

Request.Queue = new Class({

    Implements: [Options, Events],

    Binds: ['attach', 'request', 'complete', 'cancel', 'success', 'failure', 'exception'],

    options: {/*
        onRequest: $empty(argsPassedToOnRequest),
        onSuccess: $empty(argsPassedToOnSuccess),
        onComplete: $empty(argsPassedToOnComplete),
        onCancel: $empty(argsPassedToOnCancel),
        onException: $empty(argsPassedToOnException),
        onFailure: $empty(argsPassedToOnFailure),
        onEnd: $empty,
        */
        stopOnFailure: true,
        autoAdvance: true,
        concurrent: 1,
        requests: {}
    },

    initialize: function(options){
        if(options){
            var requests = options.requests;
            delete options.requests;    
        }
        this.setOptions(options);
        this.requests = new Hash;
        this.queue = [];
        this.reqBinders = {};
        
        if(requests) this.addRequests(requests);
    },

    addRequest: function(name, request){
        this.requests.set(name, request);
        this.attach(name, request);
        return this;
    },

    addRequests: function(obj){
        $each(obj, function(req, name){
            this.addRequest(name, req);
        }, this);
        return this;
    },

    getName: function(req){
        return this.requests.keyOf(req);
    },

    attach: function(name, req){
        if (req._groupSend) return this;
        ['request', 'complete', 'cancel', 'success', 'failure', 'exception'].each(function(evt){
            if(!this.reqBinders[name]) this.reqBinders[name] = {};
            this.reqBinders[name][evt] = function(){
                this['on' + evt.capitalize()].apply(this, [name, req].extend(arguments));
            }.bind(this);
            req.addEvent(evt, this.reqBinders[name][evt]);
        }, this);
        req._groupSend = req.send;
        req.send = function(options){
            this.send(name, options);
            return req;
        }.bind(this);
        return this;
    },

    removeRequest: function(req){
        var name = $type(req) == 'object' ? this.getName(req) : req;
        if (!name && $type(name) != 'string') return this;
        req = this.requests.get(name);
        if (!req) return this;
        ['request', 'complete', 'cancel', 'success', 'failure', 'exception'].each(function(evt){
            req.removeEvent(evt, this.reqBinders[name][evt]);
        }, this);
        req.send = req._groupSend;
        delete req._groupSend;
        return this;
    },

    getRunning: function(){
        return this.requests.filter(function(r){
            return r.running;
        });
    },

    isRunning: function(){
        return !!(this.getRunning().getKeys().length);
    },

    send: function(name, options){
        var q = function(){
            this.requests.get(name)._groupSend(options);
            this.queue.erase(q);
        }.bind(this);
        q.name = name;
        if (this.getRunning().getKeys().length >= this.options.concurrent || (this.error && this.options.stopOnFailure)) this.queue.push(q);
        else q();
        return this;
    },

    hasNext: function(name){
        return (!name) ? !!this.queue.length : !!this.queue.filter(function(q){ return q.name == name; }).length;
    },

    resume: function(){
        this.error = false;
        (this.options.concurrent - this.getRunning().getKeys().length).times(this.runNext, this);
        return this;
    },

    runNext: function(name){
        if (!this.queue.length) return this;
        if (!name){
            this.queue[0]();
        } else {
            var found;
            this.queue.each(function(q){
                if (!found && q.name == name){
                    found = true;
                    q();
                }
            });
        }
        return this;
    },

    runAll: function() {
        this.queue.each(function(q) {
            q();
        });
        return this;
    },

    clear: function(name){
        if (!name){
            this.queue.empty();
        } else {
            this.queue = this.queue.map(function(q){
                if (q.name != name) return q;
                else return false;
            }).filter(function(q){ return q; });
        }
        return this;
    },

    cancel: function(name){
        this.requests.get(name).cancel();
        return this;
    },

    onRequest: function(){
        this.fireEvent('request', arguments);
    },

    onComplete: function(){
        this.fireEvent('complete', arguments);
        if (!this.queue.length) this.fireEvent('end');
    },

    onCancel: function(){
        if (this.options.autoAdvance && !this.error) this.runNext();
        this.fireEvent('cancel', arguments);
    },

    onSuccess: function(){
        if (this.options.autoAdvance && !this.error) this.runNext();
        this.fireEvent('success', arguments);
    },

    onFailure: function(){
        this.error = true;
        if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
        this.fireEvent('failure', arguments);
    },

    onException: function(){
        this.error = true;
        if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
        this.fireEvent('exception', arguments);
    }

});
/*
---

script: Request.Periodical.js

description: Requests the same URL to pull data from a server but increases the intervals if no data is returned to reduce the load

license: MIT-style license

authors:
- Christoph Pojer

requires:
- core:1.2.4/Request
- /MooTools.More

provides: [Request.Periodical]

...
*/

Request.implement({

    options: {
        initialDelay: 5000,
        delay: 5000,
        limit: 60000
    },

    startTimer: function(data){
        var fn = function(){
            if (!this.running) this.send({data: data});
        };
        this.timer = fn.delay(this.options.initialDelay, this);
        this.lastDelay = this.options.initialDelay;
        this.completeCheck = function(response){
            $clear(this.timer);
            this.lastDelay = (response) ? this.options.delay : (this.lastDelay + this.options.delay).min(this.options.limit);
            this.timer = fn.delay(this.lastDelay, this);
        };
        return this.addEvent('complete', this.completeCheck);
    },

    stopTimer: function(){
        $clear(this.timer);
        return this.removeEvent('complete', this.completeCheck);
    }

});/*
---

script: Assets.js

description: Provides methods to dynamically load JavaScript, CSS, and Image files into the document.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Element.Event
- /MooTools.More

provides: [Assets]

...
*/

var Asset = {

    javascript: function(source, properties){
        properties = $extend({
            onload: $empty,
            document: document,
            check: $lambda(true)
        }, properties);

        var script = new Element('script', {src: source, type: 'text/javascript'});

        var load = properties.onload.bind(script), 
            check = properties.check, 
            doc = properties.document;
        delete properties.onload;
        delete properties.check;
        delete properties.document;

        script.addEvents({
            load: load,
            readystatechange: function(){
                if (['loaded', 'complete'].contains(this.readyState)) load();
            }
        }).set(properties);

        if (Browser.Engine.webkit419) var checker = (function(){
            if (!$try(check)) return;
            $clear(checker);
            load();
        }).periodical(50);

        return script.inject(doc.head);
    },

    css: function(source, properties){
        return new Element('link', $merge({
            rel: 'stylesheet',
            media: 'screen',
            type: 'text/css',
            href: source
        }, properties)).inject(document.head);
    },

    image: function(source, properties){
        properties = $merge({
            onload: $empty,
            onabort: $empty,
            onerror: $empty
        }, properties);
        var image = new Image();
        var element = document.id(image) || new Element('img');
        ['load', 'abort', 'error'].each(function(name){
            var type = 'on' + name;
            var event = properties[type];
            delete properties[type];
            image[type] = function(){
                if (!image) return;
                if (!element.parentNode){
                    element.width = image.width;
                    element.height = image.height;
                }
                image = image.onload = image.onabort = image.onerror = null;
                event.delay(1, element, element);
                element.fireEvent(name, element, 1);
            };
        });
        image.src = element.src = source;
        if (image && image.complete) image.onload.delay(1);
        return element.set(properties);
    },

    images: function(sources, options){
        options = $merge({
            onComplete: $empty,
            onProgress: $empty,
            onError: $empty,
            properties: {}
        }, options);
        sources = $splat(sources);
        var images = [];
        var counter = 0;
        return new Elements(sources.map(function(source){
            return Asset.image(source, $extend(options.properties, {
                onload: function(){
                    options.onProgress.call(this, counter, sources.indexOf(source));
                    counter++;
                    if (counter == sources.length) options.onComplete();
                },
                onerror: function(){
                    options.onError.call(this, counter, sources.indexOf(source));
                    counter++;
                    if (counter == sources.length) options.onComplete();
                }
            }));
        }));
    }

};/*
---

script: Color.js

description: Class for creating and manipulating colors in JavaScript. Supports HSB -> RGB Conversions and vice versa.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Array
- core:1.2.4/String
- core:1.2.4/Number
- core:1.2.4/Hash
- core:1.2.4/Function
- core:1.2.4/$util

provides: [Color]

...
*/

var Color = new Native({

    initialize: function(color, type){
        if (arguments.length >= 3){
            type = 'rgb'; color = Array.slice(arguments, 0, 3);
        } else if (typeof color == 'string'){
            if (color.match(/rgb/)) color = color.rgbToHex().hexToRgb(true);
            else if (color.match(/hsb/)) color = color.hsbToRgb();
            else color = color.hexToRgb(true);
        }
        type = type || 'rgb';
        switch (type){
            case 'hsb':
                var old = color;
                color = color.hsbToRgb();
                color.hsb = old;
            break;
            case 'hex': color = color.hexToRgb(true); break;
        }
        color.rgb = color.slice(0, 3);
        color.hsb = color.hsb || color.rgbToHsb();
        color.hex = color.rgbToHex();
        return $extend(color, this);
    }

});

Color.implement({

    mix: function(){
        var colors = Array.slice(arguments);
        var alpha = ($type(colors.getLast()) == 'number') ? colors.pop() : 50;
        var rgb = this.slice();
        colors.each(function(color){
            color = new Color(color);
            for (var i = 0; i < 3; i++) rgb[i] = Math.round((rgb[i] / 100 * (100 - alpha)) + (color[i] / 100 * alpha));
        });
        return new Color(rgb, 'rgb');
    },

    invert: function(){
        return new Color(this.map(function(value){
            return 255 - value;
        }));
    },

    setHue: function(value){
        return new Color([value, this.hsb[1], this.hsb[2]], 'hsb');
    },

    setSaturation: function(percent){
        return new Color([this.hsb[0], percent, this.hsb[2]], 'hsb');
    },

    setBrightness: function(percent){
        return new Color([this.hsb[0], this.hsb[1], percent], 'hsb');
    }

});

var $RGB = function(r, g, b){
    return new Color([r, g, b], 'rgb');
};

var $HSB = function(h, s, b){
    return new Color([h, s, b], 'hsb');
};

var $HEX = function(hex){
    return new Color(hex, 'hex');
};

Array.implement({

    rgbToHsb: function(){
        var red = this[0],
                green = this[1],
                blue = this[2],
                hue = 0;
        var max = Math.max(red, green, blue),
                min = Math.min(red, green, blue);
        var delta = max - min;
        var brightness = max / 255,
                saturation = (max != 0) ? delta / max : 0;
        if(saturation != 0) {
            var rr = (max - red) / delta;
            var gr = (max - green) / delta;
            var br = (max - blue) / delta;
            if (red == max) hue = br - gr;
            else if (green == max) hue = 2 + rr - br;
            else hue = 4 + gr - rr;
            hue /= 6;
            if (hue < 0) hue++;
        }
        return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100)];
    },

    hsbToRgb: function(){
        var br = Math.round(this[2] / 100 * 255);
        if (this[1] == 0){
            return [br, br, br];
        } else {
            var hue = this[0] % 360;
            var f = hue % 60;
            var p = Math.round((this[2] * (100 - this[1])) / 10000 * 255);
            var q = Math.round((this[2] * (6000 - this[1] * f)) / 600000 * 255);
            var t = Math.round((this[2] * (6000 - this[1] * (60 - f))) / 600000 * 255);
            switch (Math.floor(hue / 60)){
                case 0: return [br, t, p];
                case 1: return [q, br, p];
                case 2: return [p, br, t];
                case 3: return [p, q, br];
                case 4: return [t, p, br];
                case 5: return [br, p, q];
            }
        }
        return false;
    }

});

String.implement({

    rgbToHsb: function(){
        var rgb = this.match(/\d{1,3}/g);
        return (rgb) ? rgb.rgbToHsb() : null;
    },

    hsbToRgb: function(){
        var hsb = this.match(/\d{1,3}/g);
        return (hsb) ? hsb.hsbToRgb() : null;
    }

});
/*
---

script: Group.js

description: Class for monitoring collections of events

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Events
- /MooTools.More

provides: [Group]

...
*/

var Group = new Class({

    initialize: function(){
        this.instances = Array.flatten(arguments);
        this.events = {};
        this.checker = {};
    },

    addEvent: function(type, fn){
        this.checker[type] = this.checker[type] || {};
        this.events[type] = this.events[type] || [];
        if (this.events[type].contains(fn)) return false;
        else this.events[type].push(fn);
        this.instances.each(function(instance, i){
            instance.addEvent(type, this.check.bind(this, [type, instance, i]));
        }, this);
        return this;
    },

    check: function(type, instance, i){
        this.checker[type][i] = true;
        var every = this.instances.every(function(current, j){
            return this.checker[type][j] || false;
        }, this);
        if (!every) return;
        this.checker[type] = {};
        this.events[type].each(function(event){
            event.call(this, this.instances, instance);
        }, this);
    }

});
/*
---

script: Hash.Cookie.js

description: Class for creating, reading, and deleting Cookies in JSON format.

license: MIT-style license

authors:
- Valerio Proietti
- Aaron Newton

requires:
- core:1.2.4/Cookie
- core:1.2.4/JSON
- /MooTools.More

provides: [Hash.Cookie]

...
*/

Hash.Cookie = new Class({

    Extends: Cookie,

    options: {
        autoSave: true
    },

    initialize: function(name, options){
        this.parent(name, options);
        this.load();
    },

    save: function(){
        var value = JSON.encode(this.hash);
        if (!value || value.length > 4096) return false; //cookie would be truncated!
        if (value == '{}') this.dispose();
        else this.write(value);
        return true;
    },

    load: function(){
        this.hash = new Hash(JSON.decode(this.read(), true));
        return this;
    }

});

Hash.each(Hash.prototype, function(method, name){
    if (typeof method == 'function') Hash.Cookie.implement(name, function(){
        var value = method.apply(this.hash, arguments);
        if (this.options.autoSave) this.save();
        return value;
    });
});/*
---

script: IframeShim.js

description: Defines IframeShim, a class for obscuring select lists and flash objects in IE.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Event
- core:1.2.4/Element.Style
- core:1.2.4/Options Events
- /Element.Position
- /Class.Occlude

provides: [IframeShim]

...
*/

var IframeShim = new Class({

    Implements: [Options, Events, Class.Occlude],

    options: {
        className: 'iframeShim',
        src: 'javascript:false;document.write("");',
        display: false,
        zIndex: null,
        margin: 0,
        offset: {x: 0, y: 0},
        browsers: (Browser.Engine.trident4 || (Browser.Engine.gecko && !Browser.Engine.gecko19 && Browser.Platform.mac))
    },

    property: 'IframeShim',

    initialize: function(element, options){
        this.element = document.id(element);
        if (this.occlude()) return this.occluded;
        this.setOptions(options);
        this.makeShim();
        return this;
    },

    makeShim: function(){
        if(this.options.browsers){
            var zIndex = this.element.getStyle('zIndex').toInt();

            if (!zIndex){
                zIndex = 1;
                var pos = this.element.getStyle('position');
                if (pos == 'static' || !pos) this.element.setStyle('position', 'relative');
                this.element.setStyle('zIndex', zIndex);
            }
            zIndex = ($chk(this.options.zIndex) && zIndex > this.options.zIndex) ? this.options.zIndex : zIndex - 1;
            if (zIndex < 0) zIndex = 1;
            this.shim = new Element('iframe', {
                src: this.options.src,
                scrolling: 'no',
                frameborder: 0,
                styles: {
                    zIndex: zIndex,
                    position: 'absolute',
                    border: 'none',
                    filter: 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'
                },
                'class': this.options.className
            }).store('IframeShim', this);
            var inject = (function(){
                this.shim.inject(this.element, 'after');
                this[this.options.display ? 'show' : 'hide']();
                this.fireEvent('inject');
            }).bind(this);
            if (IframeShim.ready) window.addEvent('load', inject);
            else inject();
        } else {
            this.position = this.hide = this.show = this.dispose = $lambda(this);
        }
    },

    position: function(){
        if (!IframeShim.ready || !this.shim) return this;
        var size = this.element.measure(function(){ 
            return this.getSize(); 
        });
        if (this.options.margin != undefined){
            size.x = size.x - (this.options.margin * 2);
            size.y = size.y - (this.options.margin * 2);
            this.options.offset.x += this.options.margin;
            this.options.offset.y += this.options.margin;
        }
        this.shim.set({width: size.x, height: size.y}).position({
            relativeTo: this.element,
            offset: this.options.offset
        });
        return this;
    },

    hide: function(){
        if (this.shim) this.shim.setStyle('display', 'none');
        return this;
    },

    show: function(){
        if (this.shim) this.shim.setStyle('display', 'block');
        return this.position();
    },

    dispose: function(){
        if (this.shim) this.shim.dispose();
        return this;
    },

    destroy: function(){
        if (this.shim) this.shim.destroy();
        return this;
    }

});

window.addEvent('load', function(){
    IframeShim.ready = true;
});/*
---

script: HtmlTable.js

description: Builds table elements with methods to add rows.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Options
- core:1.2.4/Events
- /Class.Occlude

provides: [HtmlTable]

...
*/

var HtmlTable = new Class({

    Implements: [Options, Events, Class.Occlude],

    options: {
        properties: {
            cellpadding: 0,
            cellspacing: 0,
            border: 0
        },
        rows: [],
        headers: [],
        footers: []
    },

    property: 'HtmlTable',

    initialize: function(){
        var params = Array.link(arguments, {options: Object.type, table: Element.type});
        this.setOptions(params.options);
        this.element = params.table || new Element('table', this.options.properties);
        if (this.occlude()) return this.occluded;
        this.build();
    },

    build: function(){
        this.element.store('HtmlTable', this);

        this.body = document.id(this.element.tBodies[0]) || new Element('tbody').inject(this.element);
        $$(this.body.rows);

        if (this.options.headers.length) this.setHeaders(this.options.headers);
        else this.thead = document.id(this.element.tHead);
        if (this.thead) this.head = document.id(this.thead.rows[0]);

        if (this.options.footers.length) this.setFooters(this.options.footers);
        this.tfoot = document.id(this.element.tFoot);
        if (this.tfoot) this.foot = document.id(this.thead.rows[0]);

        this.options.rows.each(function(row){
            this.push(row);
        }, this);

        ['adopt', 'inject', 'wraps', 'grab', 'replaces', 'dispose'].each(function(method){
                this[method] = this.element[method].bind(this.element);
        }, this);
    },

    toElement: function(){
        return this.element;
    },

    empty: function(){
        this.body.empty();
        return this;
    },

    setHeaders: function(headers){
        this.thead = (document.id(this.element.tHead) || new Element('thead').inject(this.element, 'top')).empty();
        this.push(headers, this.thead, 'th');
        this.head = document.id(this.thead.rows[0]);
        return this;
    },

    setFooters: function(footers){
        this.tfoot = (document.id(this.element.tFoot) || new Element('tfoot').inject(this.element, 'top')).empty();
        this.push(footers, this.tfoot);
        this.foot = document.id(this.thead.rows[0]);
        return this;
    },

    push: function(row, target, tag){
        var tds = row.map(function(data){
            var td = new Element(tag || 'td', data.properties),
                type = data.content || data || '',
                element = document.id(type);

            if(element) td.adopt(element);
            else td.set('html', type);

            return td;
        });

        return {
            tr: new Element('tr').inject(target || this.body).adopt(tds),
            tds: tds
        };
    }

});
/*
---

script: HtmlTable.Zebra.js

description: Builds a stripy table with methods to add rows.

license: MIT-style license

authors:
- Harald Kirschner
- Aaron Newton

requires:
- /HtmlTable
- /Class.refactor

provides: [HtmlTable.Zebra]

...
*/

HtmlTable = Class.refactor(HtmlTable, {

    options: {
        classZebra: 'table-tr-odd',
        zebra: true
    },

    initialize: function(){
        this.previous.apply(this, arguments);
        if (this.occluded) return this.occluded;
        if (this.options.zebra) this.updateZebras();
    },

    updateZebras: function(){
        Array.each(this.body.rows, this.zebra, this);
    },

    zebra: function(row, i){
        return row[((i % 2) ? 'remove' : 'add')+'Class'](this.options.classZebra);
    },

    push: function(){
        var pushed = this.previous.apply(this, arguments);
        if (this.options.zebra) this.updateZebras();
        return pushed;
    }

});/*
---

script: HtmlTable.Sort.js

description: Builds a stripy, sortable table with methods to add rows.

license: MIT-style license

authors:
- Harald Kirschner
- Aaron Newton

requires:
- core:1.2.4/Hash
- /HtmlTable
- /Class.refactor
- /Element.Delegation
- /Date

provides: [HtmlTable.Sort]

...
*/

HtmlTable = Class.refactor(HtmlTable, {

    options: {/*
        onSort: $empty, */
        sortIndex: 0,
        sortReverse: false,
        parsers: [],
        defaultParser: 'string',
        classSortable: 'table-sortable',
        classHeadSort: 'table-th-sort',
        classHeadSortRev: 'table-th-sort-rev',
        classNoSort: 'table-th-nosort',
        classGroupHead: 'table-tr-group-head',
        classGroup: 'table-tr-group',
        classCellSort: 'table-td-sort',
        classSortSpan: 'table-th-sort-span',
        sortable: false
    },

    initialize: function () {
        this.previous.apply(this, arguments);
        if (this.occluded) return this.occluded;
        this.sorted = {index: null, dir: 1};
        this.bound = {
            headClick: this.headClick.bind(this)
        };
        this.sortSpans = new Elements();
        if (this.options.sortable) {
            this.enableSort();
            if (this.options.sortIndex != null) this.sort(this.options.sortIndex, this.options.sortReverse);
        }
    },

    attachSorts: function(attach){
        this.element[$pick(attach, true) ? 'addEvent' : 'removeEvent']('click:relay(th)', this.bound.headClick);
    },

    setHeaders: function(){
        this.previous.apply(this, arguments);
        if (this.sortEnabled) this.detectParsers();
    },
    
    detectParsers: function(force){
        if (!this.head) return;
        var parsers = this.options.parsers, 
                rows = this.body.rows;

        // auto-detect
        this.parsers = $$(this.head.cells).map(function(cell, index) {
            if (!force && (cell.hasClass(this.options.classNoSort) || cell.retrieve('htmltable-sort'))) return cell.retrieve('htmltable-sort');
            var sortSpan = new Element('span', {'html': '&#160;', 'class': this.options.classSortSpan}).inject(cell, 'top');
            this.sortSpans.push(sortSpan);

            var parser = parsers[index], 
                    cancel;
            switch ($type(parser)) {
                case 'function': parser = {convert: parser}; cancel = true; break;
                case 'string': parser = parser; cancel = true; break;
            }
            if (!cancel) {
                HtmlTable.Parsers.some(function(current) {
                    var match = current.match;
                    if (!match) return false;
                    if (Browser.Engine.trident) return false;
                    for (var i = 0, j = rows.length; i < j; i++) {
                        var text = rows[i].cells[index].get('html').clean();
                        if (text && match.test(text)) {
                            parser = current;
                            return true;
                        }
                    }
                });
            }

            if (!parser) parser = this.options.defaultParser;
            cell.store('htmltable-parser', parser);
            return parser;
        }, this);
    },

    headClick: function(event, el) {
        if (!this.head) return;
        var index = Array.indexOf(this.head.cells, el);
        this.sort(index);
        return false;
    },

    sort: function(index, reverse, pre) {
        if (!this.head) return;
        pre = !!(pre);
        var classCellSort = this.options.classCellSort;
        var classGroup = this.options.classGroup, 
                classGroupHead = this.options.classGroupHead;

        if (!pre) {
            if (index != null) {
                if (this.sorted.index == index) {
                    this.sorted.reverse = !(this.sorted.reverse);
                } else {
                    if (this.sorted.index != null) {
                        this.sorted.reverse = false;
                        this.head.cells[this.sorted.index].removeClass(this.options.classHeadSort).removeClass(this.options.classHeadSortRev);
                    } else {
                        this.sorted.reverse = true;
                    }
                    this.sorted.index = index;
                }
            } else {
                index = this.sorted.index;
            }

            if (reverse != null) this.sorted.reverse = reverse;

            var head = document.id(this.head.cells[index]);
            if (head) {
                head.addClass(this.options.classHeadSort);
                if (this.sorted.reverse) head.addClass(this.options.classHeadSortRev);
                else head.removeClass(this.options.classHeadSortRev);
            }

            this.body.getElements('td').removeClass(this.options.classCellSort);
        }

        var parser = this.parsers[index];
        if ($type(parser) == 'string') parser = HtmlTable.Parsers.get(parser);
        if (!parser) return;

        if (!Browser.Engine.trident) {
            var rel = this.body.getParent();
            this.body.dispose();
        }

        var data = Array.map(this.body.rows, function(row, i) {
            var value = parser.convert.call(document.id(row.cells[index]));

            return {
                position: i,
                value: value,
                toString:  function() {
                    return value.toString();
                }
            };
        }, this);
        data.reverse(true);

        data.sort(function(a, b){
            if (a.value === b.value) return 0;
            return a.value > b.value ? 1 : -1;
        });

        if (!this.sorted.reverse) data.reverse(true);

        var i = data.length, body = this.body;
        var j, position, entry, group;

        while (i) {
            var item = data[--i];
            position = item.position;
            var row = body.rows[position];
            if (row.disabled) continue;

            if (!pre) {
                if (group === item.value) {
                    row.removeClass(classGroupHead).addClass(classGroup);
                } else {
                    group = item.value;
                    row.removeClass(classGroup).addClass(classGroupHead);
                }
                if (this.zebra) this.zebra(row, i);

                row.cells[index].addClass(classCellSort);
            }

            body.appendChild(row);
            for (j = 0; j < i; j++) {
                if (data[j].position > position) data[j].position--;
            }
        };
        data = null;
        if (rel) rel.grab(body);

        return this.fireEvent('sort', [body, index]);
    },

    reSort: function(){
        if (this.sortEnabled) this.sort.call(this, this.sorted.index, this.sorted.reverse);
        return this;
    },

    enableSort: function(){
        this.element.addClass(this.options.classSortable);
        this.attachSorts(true);
        this.detectParsers();
        this.sortEnabled = true;
        return this;
    },

    disableSort: function(){
        this.element.remove(this.options.classSortable);
        this.attachSorts(false);
        this.sortSpans.each(function(span) { span.destroy(); });
        this.sortSpans.empty();
        this.sortEnabled = false;
        return this;
    }

});

HtmlTable.Parsers = new Hash({

    'date': {
        match: /^\d{2}[-\/ ]\d{2}[-\/ ]\d{2,4}$/,
        convert: function() {
            return Date.parse(this.get('text').format('db'));
        },
        type: 'date'
    },
    'input-checked': {
        match: / type="(radio|checkbox)" /,
        convert: function() {
            return this.getElement('input').checked;
        }
    },
    'input-value': {
        match: /<input/,
        convert: function() {
            return this.getElement('input').value;
        }
    },
    'number': {
        match: /^\d+[^\d.,]*$/,
        convert: function() {
            return this.get('text').toInt();
        },
        number: true
    },
    'numberLax': {
        match: /^[^\d]+\d+$/,
        convert: function() {
            return this.get('text').replace(/[^-?^0-9]/, '').toInt();
        },
        number: true
    },
    'float': {
        match: /^[\d]+\.[\d]+/,
        convert: function() {
            return this.get('text').replace(/[^-?^\d.]/, '').toFloat();
        },
        number: true
    },
    'floatLax': {
        match: /^[^\d]+[\d]+\.[\d]+$/,
        convert: function() {
            return this.get('text').replace(/[^-?^\d.]/, '');
        },
        number: true
    },
    'string': {
        match: null,
        convert: function() {
            return this.get('text');
        }
    },
    'title': {
        match: null,
        convert: function() {
            return this.title;
        }
    }

});
/*
---

script: HtmlTable.Select.js

description: Builds a stripy, sortable table with methods to add rows. Rows can be selected with the mouse or keyboard navigation.

license: MIT-style license

authors:
- Harald Kirschner
- Aaron Newton

requires:
- /Keyboard
- /HtmlTable
- /Class.refactor
- /Element.Delegation

provides: [HtmlTable.Select]

...
*/

HtmlTable = Class.refactor(HtmlTable, {

    options: {
        /*onRowSelect: $empty,
        onRowUnselect: $empty,*/
        useKeyboard: true,
        classRowSelected: 'table-tr-selected',
        classRowHovered: 'table-tr-hovered',
        classSelectable: 'table-selectable',
        allowMultiSelect: true,
        selectable: false
    },

    initialize: function(){
        this.previous.apply(this, arguments);
        if (this.occluded) return this.occluded;
        this.selectedRows = new Elements();
        this.bound = {
            mouseleave: this.mouseleave.bind(this),
            focusRow: this.focusRow.bind(this)
        };
        if (this.options.selectable) this.enableSelect();
    },

    enableSelect: function(){
        this.selectEnabled = true;
        this.attachSelects();
        this.element.addClass(this.options.classSelectable);
    },

    disableSelect: function(){
        this.selectEnabled = false;
        this.attach(false);
        this.element.removeClass(this.options.classSelectable);
    },

    attachSelects: function(attach){
        attach = $pick(attach, true);
        var method = attach ? 'addEvents' : 'removeEvents';
        this.element[method]({
            mouseleave: this.bound.mouseleave
        });
        this.body[method]({
            'click:relay(tr)': this.bound.focusRow
        });
        if (this.options.useKeyboard || this.keyboard){
            if (!this.keyboard) this.keyboard = new Keyboard({
                events: {
                    down: function(e) {
                        e.preventDefault();
                        this.shiftFocus(1);
                    }.bind(this),
                    up: function(e) {
                        e.preventDefault();
                        this.shiftFocus(-1);
                    }.bind(this),
                    enter: function(e) {
                        e.preventDefault();
                        if (this.hover) this.focusRow(this.hover);
                    }.bind(this)
                },
                active: true
            });
            this.keyboard[attach ? 'activate' : 'deactivate']();
        }
        this.updateSelects();
    },

    mouseleave: function(){
        if (this.hover) this.leaveRow(this.hover);
    },

    focus: function(){
        if (this.keyboard) this.keyboard.activate();
    },

    blur: function(){
        if (this.keyboard) this.keyboard.deactivate();
    },

    push: function(){
        var ret = this.previous.apply(this, arguments);
        this.updateSelects();
        return ret;
    },

    updateSelects: function(){
        Array.each(this.body.rows, function(row){
            var binders = row.retrieve('binders');
            if ((binders && this.selectEnabled) || (!binders && !this.selectEnabled)) return;
            if (!binders){
                binders = {
                    mouseenter: this.enterRow.bind(this, [row]),
                    mouseleave: this.leaveRow.bind(this, [row])
                };
                row.store('binders', binders).addEvents(binders);
            } else {
                row.removeEvents(binders);
            }
        }, this);
    },

    enterRow: function(row){
        if (this.hover) this.hover = this.leaveRow(this.hover);
        this.hover = row.addClass(this.options.classRowHovered);
    },

    shiftFocus: function(offset){
        if (!this.hover) return this.enterRow(this.body.rows[0]);
        var to = Array.indexOf(this.body.rows, this.hover) + offset;
        if (to < 0) to = 0;
        if (to >= this.body.rows.length) to = this.body.rows.length - 1;
        if (this.hover == this.body.rows[to]) return this;
        this.enterRow(this.body.rows[to]);
    },

    leaveRow: function(row){
        row.removeClass(this.options.classRowHovered);
    },

    focusRow: function(){
        var row = arguments[1] || arguments[0]; //delegation passes the event first
        if (!this.body.getChildren().contains(row)) return;
        var unfocus = function(row){
            this.selectedRows.erase(row);
            row.removeClass(this.options.classRowSelected);
            this.fireEvent('rowUnfocus', [row, this.selectedRows]);
        }.bind(this);
        if (!this.options.allowMultiSelect) this.selectedRows.each(unfocus);
        if (!this.selectedRows.contains(row)) {
            this.selectedRows.push(row);
            row.addClass(this.options.classRowSelected);
            this.fireEvent('rowFocus', [row, this.selectedRows]);
        } else {
            unfocus(row);
        }
        return false;
    },

    selectAll: function(status){
        status = $pick(status, true);
        if (!this.options.allowMultiSelect && status) return;
        if (!status) this.selectedRows.removeClass(this.options.classRowSelected).empty();
        else this.selectedRows.combine(this.body.rows).addClass(this.options.classRowSelected);
        return this;
    },

    selectNone: function(){
        return this.selectAll(false);
    }

});/*
---

script: Keyboard.js

description: KeyboardEvents used to intercept events on a class for keyboard and format modifiers in a specific order so as to make alt+shift+c the same as shift+alt+c.

license: MIT-style license

authors:
- Perrin Westrich
- Aaron Newton
- Scott Kyle

requires:
- core:1.2.4/Events
- core:1.2.4/Options
- core:1.2.4/Element.Event
- /Log

provides: [Keyboard]

...
*/

(function(){

    var parsed = {};
    var modifiers = ['shift', 'control', 'alt', 'meta'];
    var regex = /^(?:shift|control|ctrl|alt|meta)$/;
    
    var parse = function(type, eventType){
        type = type.toLowerCase().replace(/^(keyup|keydown):/, function($0, $1){
            eventType = $1;
            return '';
        });
        
        if (!parsed[type]){
            var key = '', mods = {};
            type.split('+').each(function(part){
                if (regex.test(part)) mods[part] = true;
                else key = part;
            });
        
            mods.control = mods.control || mods.ctrl; // allow both control and ctrl
            var match = '';
            modifiers.each(function(mod){
                if (mods[mod]) match += mod + '+';
            });
            
            parsed[type] = match + key;
        }
        
        return eventType + ':' + parsed[type];
    };

    this.Keyboard = new Class({

        Extends: Events,

        Implements: [Options, Log],

        options: {
            /*
            onActivate: $empty,
            onDeactivate: $empty,
            */
            defaultEventType: 'keydown',
            active: false,
            events: {}
        },

        initialize: function(options){
            this.setOptions(options);
            //if this is the root manager, nothing manages it
            if (Keyboard.manager) Keyboard.manager.manage(this);
            this.setup();
        },

        setup: function(){
            this.addEvents(this.options.events);
            if (this.options.active) this.activate();
        },

        handle: function(event, type){
            //Keyboard.stop(event) prevents key propagation
            if (!this.active || event.preventKeyboardPropagation) return;
            
            var bubbles = !!this.manager;
            if (bubbles && this.activeKB){
                this.activeKB.handle(event, type);
                if (event.preventKeyboardPropagation) return;
            }
            this.fireEvent(type, event);
            
            if (!bubbles && this.activeKB) this.activeKB.handle(event, type);
        },

        addEvent: function(type, fn, internal) {
            return this.parent(parse(type, this.options.defaultEventType), fn, internal);
        },

        removeEvent: function(type, fn) {
            return this.parent(parse(type, this.options.defaultEventType), fn);
        },

        activate: function(){
            this.active = true;
            return this.enable();
        },

        deactivate: function(){
            this.active = false;
            return this.fireEvent('deactivate');
        },

        toggleActive: function(){
            return this[this.active ? 'deactivate' : 'activate']();
        },

        enable: function(instance){
            if (instance) {
                //if we're stealing focus, store the last keyboard to have it so the relenquish command works
                if (instance != this.activeKB) this.previous = this.activeKB;
                //if we're enabling a child, assign it so that events are now passed to it
                this.activeKB = instance.fireEvent('activate');
            } else if (this.manager) {
                //else we're enabling ourselves, we must ask our parent to do it for us
                this.manager.enable(this);
            }
            return this;
        },

        relenquish: function(){
            if (this.previous) this.enable(this.previous);
        },

        //management logic
        manage: function(instance) {
            if (instance.manager) instance.manager.drop(instance);
            this.instances.push(instance);
            instance.manager = this;
            if (!this.activeKB) this.enable(instance);
            else this._disable(instance);
        },

        _disable: function(instance) {
            if (this.activeKB == instance) this.activeKB = null;
        },

        drop: function(instance) {
            this._disable(instance);
            this.instances.erase(instance);
        },

        instances: [],

        trace: function(){
            this.enableLog();
            var item = this;
            this.log('the following items have focus: ');
            while (item) {
                this.log(document.id(item.widget) || item.widget || item, 'active: ' + this.active);
                item = item.activeKB;
            }
        }

    });

    Keyboard.stop = function(event) {
        event.preventKeyboardPropagation = true;
    };

    Keyboard.manager = new this.Keyboard({
        active: true
    });
    
    Keyboard.trace = function(){
        Keyboard.manager.trace();
    };
    
    var handler = function(event){
        var mods = '';
        modifiers.each(function(mod){
            if (event[mod]) mods += mod + '+';
        });
        Keyboard.manager.handle(event, event.type + ':' + mods + event.key);
    };
    
    document.addEvents({
        'keyup': handler,
        'keydown': handler
    });

    Event.Keys.extend({
        'pageup': 33,
        'pagedown': 34,
        'end': 35,
        'home': 36,
        'capslock': 20,
        'numlock': 144,
        'scrolllock': 145
    });

})();
/*
---

script: Mask.js

description: Creates a mask element to cover another.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Options
- core:1.2.4/Events
- core:1.2.4/Element.Event
- /Class.Binds
- /Element.Position
- /IframeShim

provides: [Mask]

...
*/

var Mask = new Class({

    Implements: [Options, Events],

    Binds: ['resize'],

    options: {
        // onShow: $empty,
        // onHide: $empty,
        // onDestroy: $empty,
        // onClick: $empty,
        //inject: {
        //  where: 'after',
        //  target: null,
        //},
        // hideOnClick: false,
        // id: null,
        // destroyOnHide: false,
        style: {},
        'class': 'mask',
        maskMargins: false,
        useIframeShim: true
    },

    initialize: function(target, options){
        this.target = document.id(target) || document.body;
        this.target.store('mask', this);
        this.setOptions(options);
        this.render();
        this.inject();
    },
    
    render: function() {
        this.element = new Element('div', {
            'class': this.options['class'],
            id: this.options.id || 'mask-' + $time(),
            styles: $merge(this.options.style, {
                display: 'none'
            }),
            events: {
                click: function(){
                    this.fireEvent('click');
                    if (this.options.hideOnClick) this.hide();
                }.bind(this)
            }
        });
        this.hidden = true;
    },

    toElement: function(){
        return this.element;
    },

    inject: function(target, where){
        where = where || this.options.inject ? this.options.inject.where : '' || this.target == document.body ? 'inside' : 'after';
        target = target || this.options.inject ? this.options.inject.target : '' || this.target;
        this.element.inject(target, where);
        if (this.options.useIframeShim) {
            this.shim = new IframeShim(this.element);
            this.addEvents({
                show: this.shim.show.bind(this.shim),
                hide: this.shim.hide.bind(this.shim),
                destroy: this.shim.destroy.bind(this.shim)
            });
        }
    },

    position: function(){
        this.resize(this.options.width, this.options.height);
        this.element.position({
            relativeTo: this.target,
            position: 'topLeft',
            ignoreMargins: !this.options.maskMargins,
            ignoreScroll: this.target == document.body
        });
        return this;
    },

    resize: function(x, y){
        var opt = {
            styles: ['padding', 'border']
        };
        if (this.options.maskMargins) opt.styles.push('margin');
        var dim = this.target.getComputedSize(opt);
        if (this.target == document.body) {
            var win = window.getSize();
            if (dim.totalHeight < win.y) dim.totalHeight = win.y;
            if (dim.totalWidth < win.x) dim.totalWidth = win.x;
        }
        this.element.setStyles({
            width: $pick(x, dim.totalWidth, dim.x),
            height: $pick(y, dim.totalHeight, dim.y)
        });
        return this;
    },

    show: function(){
        if (!this.hidden) return this;
        this.target.addEvent('resize', this.resize);
        if (this.target != document.body) document.id(document.body).addEvent('resize', this.resize);
        this.position();
        this.showMask.apply(this, arguments);
        return this;
    },

    showMask: function(){
        this.element.setStyle('display', 'block');
        this.hidden = false;
        this.fireEvent('show');
    },

    hide: function(){
        if (this.hidden) return this;
        this.target.removeEvent('resize', this.resize);
        this.hideMask.apply(this, arguments);
        if (this.options.destroyOnHide) return this.destroy();
        return this;
    },

    hideMask: function(){
        this.element.setStyle('display', 'none');
        this.hidden = true;
        this.fireEvent('hide');
    },

    toggle: function(){
        this[this.hidden ? 'show' : 'hide']();
    },

    destroy: function(){
        this.hide();
        this.element.destroy();
        this.fireEvent('destroy');
        this.target.eliminate('mask');
    }

});

Element.Properties.mask = {

    set: function(options){
        var mask = this.retrieve('mask');
        return this.eliminate('mask').store('mask:options', options);
    },

    get: function(options){
        if (options || !this.retrieve('mask')){
            if (this.retrieve('mask')) this.retrieve('mask').destroy();
            if (options || !this.retrieve('mask:options')) this.set('mask', options);
            this.store('mask', new Mask(this, this.retrieve('mask:options')));
        }
        return this.retrieve('mask');
    }

};

Element.implement({

    mask: function(options){
        this.get('mask', options).show();
        return this;
    },

    unmask: function(){
        this.get('mask').hide();
        return this;
    }

});/*
---

script: Scroller.js

description: Class which scrolls the contents of any Element (including the window) when the mouse reaches the Element's boundaries.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Events
- core:1.2.4/Options
- core:1.2.4/Element.Event
- core:1.2.4/Element.Dimensions

provides: [Scroller]

...
*/

var Scroller = new Class({

    Implements: [Events, Options],

    options: {
        area: 20,
        velocity: 1,
        onChange: function(x, y){
            this.element.scrollTo(x, y);
        },
        fps: 50
    },

    initialize: function(element, options){
        this.setOptions(options);
        this.element = document.id(element);
        this.listener = ($type(this.element) != 'element') ? document.id(this.element.getDocument().body) : this.element;
        this.timer = null;
        this.bound = {
            attach: this.attach.bind(this),
            detach: this.detach.bind(this),
            getCoords: this.getCoords.bind(this)
        };
    },

    start: function(){
        this.listener.addEvents({
            mouseover: this.bound.attach,
            mouseout: this.bound.detach
        });
    },

    stop: function(){
        this.listener.removeEvents({
            mouseover: this.bound.attach,
            mouseout: this.bound.detach
        });
        this.detach();
        this.timer = $clear(this.timer);
    },

    attach: function(){
        this.listener.addEvent('mousemove', this.bound.getCoords);
    },

    detach: function(){
        this.listener.removeEvent('mousemove', this.bound.getCoords);
        this.timer = $clear(this.timer);
    },

    getCoords: function(event){
        this.page = (this.listener.get('tag') == 'body') ? event.client : event.page;
        if (!this.timer) this.timer = this.scroll.periodical(Math.round(1000 / this.options.fps), this);
    },

    scroll: function(){
        var size = this.element.getSize(), 
            scroll = this.element.getScroll(), 
            pos = this.element.getOffsets(), 
            scrollSize = this.element.getScrollSize(), 
            change = {x: 0, y: 0};
        for (var z in this.page){
            if (this.page[z] < (this.options.area + pos[z]) && scroll[z] != 0)
                change[z] = (this.page[z] - this.options.area - pos[z]) * this.options.velocity;
            else if (this.page[z] + this.options.area > (size[z] + pos[z]) && scroll[z] + size[z] != scrollSize[z])
                change[z] = (this.page[z] - size[z] + this.options.area - pos[z]) * this.options.velocity;
        }
        if (change.y || change.x) this.fireEvent('change', [scroll.x + change.x, scroll.y + change.y]);
    }

});/*
---

script: Tips.js

description: Class for creating nice tips that follow the mouse cursor when hovering an element.

license: MIT-style license

authors:
- Valerio Proietti
- Christoph Pojer

requires:
- core:1.2.4/Options
- core:1.2.4/Events
- core:1.2.4/Element.Event
- core:1.2.4/Element.Style
- core:1.2.4/Element.Dimensions
- /MooTools.More

provides: [Tips]

...
*/

(function(){

var read = function(option, element){
    return (option) ? ($type(option) == 'function' ? option(element) : element.get(option)) : '';
};

this.Tips = new Class({

    Implements: [Events, Options],

    options: {
        /*
        onAttach: $empty(element),
        onDetach: $empty(element),
        */
        onShow: function(){
            this.tip.setStyle('display', 'block');
        },
        onHide: function(){
            this.tip.setStyle('display', 'none');
        },
        title: 'title',
        text: function(element){
            return element.get('rel') || element.get('href');
        },
        showDelay: 100,
        hideDelay: 100,
        className: 'tip-wrap',
        offset: {x: 16, y: 16},
        fixed: false
    },

    initialize: function(){
        var params = Array.link(arguments, {options: Object.type, elements: $defined});
        this.setOptions(params.options);
        document.id(this);
        
        if (params.elements) this.attach(params.elements);
    },

    toElement: function(){
        if (this.tip) return this.tip;
        
        this.container = new Element('div', {'class': 'tip'});
        return this.tip = new Element('div', {
            'class': this.options.className,
            styles: {
                position: 'absolute',
                top: 0,
                left: 0
            }
        }).adopt(
            new Element('div', {'class': 'tip-top'}),
            this.container,
            new Element('div', {'class': 'tip-bottom'})
        ).inject(document.body);
    },

    attach: function(elements){
        $$(elements).each(function(element){
            var title = read(this.options.title, element),
                text = read(this.options.text, element);
            
            element.erase('title').store('tip:native', title).retrieve('tip:title', title);
            element.retrieve('tip:text', text);
            this.fireEvent('attach', [element]);
            
            var events = ['enter', 'leave'];
            if (!this.options.fixed) events.push('move');
            
            events.each(function(value){
                var event = element.retrieve('tip:' + value);
                if (!event) event = this['element' + value.capitalize()].bindWithEvent(this, element);
                
                element.store('tip:' + value, event).addEvent('mouse' + value, event);
            }, this);
        }, this);
        
        return this;
    },

    detach: function(elements){
        $$(elements).each(function(element){
            ['enter', 'leave', 'move'].each(function(value){
                element.removeEvent('mouse' + value, element.retrieve('tip:' + value)).eliminate('tip:' + value);
            });
            
            this.fireEvent('detach', [element]);
            
            if (this.options.title == 'title'){ // This is necessary to check if we can revert the title
                var original = element.retrieve('tip:native');
                if (original) element.set('title', original);
            }
        }, this);
        
        return this;
    },

    elementEnter: function(event, element){
        this.container.empty();
        
        ['title', 'text'].each(function(value){
            var content = element.retrieve('tip:' + value);
            if (content) this.fill(new Element('div', {'class': 'tip-' + value}).inject(this.container), content);
        }, this);
        
        $clear(this.timer);
        this.timer = this.show.delay(this.options.showDelay, this, element);
        this.position((this.options.fixed) ? {page: element.getPosition()} : event);
    },

    elementLeave: function(event, element){
        $clear(this.timer);
        this.timer = this.hide.delay(this.options.hideDelay, this, element);
        this.fireForParent(event, element);
    },

    fireForParent: function(event, element){
        if (!element) return;
        parentNode = element.getParent();
        if (parentNode == document.body) return;
        if (parentNode.retrieve('tip:enter')) parentNode.fireEvent('mouseenter', event);
        else this.fireForParent(parentNode, event);
    },

    elementMove: function(event, element){
        this.position(event);
    },

    position: function(event){
        var size = window.getSize(), scroll = window.getScroll(),
            tip = {x: this.tip.offsetWidth, y: this.tip.offsetHeight},
            props = {x: 'left', y: 'top'},
            obj = {};
        
        for (var z in props){
            obj[props[z]] = event.page[z] + this.options.offset[z];
            if ((obj[props[z]] + tip[z] - scroll[z]) > size[z]) obj[props[z]] = event.page[z] - this.options.offset[z] - tip[z];
        }
        
        this.tip.setStyles(obj);
    },

    fill: function(element, contents){
        if(typeof contents == 'string') element.set('html', contents);
        else element.adopt(contents);
    },

    show: function(element){
        this.fireEvent('show', [this.tip, element]);
    },

    hide: function(element){
        this.fireEvent('hide', [this.tip, element]);
    }

});

})();/*
---

script: Spinner.js

description: Adds a semi-transparent overlay over a dom element with a spinnin ajax icon.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Fx.Tween
- /Class.refactor
- /Mask

provides: [Spinner]

...
*/

var Spinner = new Class({

    Extends: Mask,

    options: {
        /*message: false,*/
        'class':'spinner',
        containerPosition: {},
        content: {
            'class':'spinner-content'
        },
        messageContainer: {
            'class':'spinner-msg'
        },
        img: {
            'class':'spinner-img'
        },
        fxOptions: {
            link: 'chain'
        }
    },

    initialize: function(){
        this.parent.apply(this, arguments);
        this.target.store('spinner', this);

        //add this to events for when noFx is true; parent methods handle hide/show
        var deactivate = function(){ this.active = false; }.bind(this);
        this.addEvents({
            hide: deactivate,
            show: deactivate
        });
    },

    render: function(){
        this.parent();
        this.element.set('id', this.options.id || 'spinner-'+$time());
        this.content = document.id(this.options.content) || new Element('div', this.options.content);
        this.content.inject(this.element);
        if (this.options.message) {
            this.msg = document.id(this.options.message) || new Element('p', this.options.messageContainer).appendText(this.options.message);
            this.msg.inject(this.content);
        }
        if (this.options.img) {
            this.img = document.id(this.options.img) || new Element('div', this.options.img);
            this.img.inject(this.content);
        }
        this.element.set('tween', this.options.fxOptions);
    },

    show: function(noFx){
        if (this.active) return this.chain(this.show.bind(this));
        if (!this.hidden) {
            this.callChain.delay(20, this);
            return this;
        }
        this.active = true;
        return this.parent(noFx);
    },

    showMask: function(noFx){
        var pos = function(){
            this.content.position($merge({
                relativeTo: this.element
            }, this.options.containerPosition));
        }.bind(this);
        if (noFx) {
            this.parent();
            pos();
        } else {
            this.element.setStyles({
                display: 'block',
                opacity: 0
            }).tween('opacity', this.options.style.opacity || 0.9);
            pos();
            this.hidden = false;
            this.fireEvent('show');
            this.callChain();
        }
    },

    hide: function(noFx){
        if (this.active) return this.chain(this.hide.bind(this));
        if (this.hidden) {
            this.callChain.delay(20, this);
            return this;
        }
        this.active = true;
        return this.parent(noFx);
    },

    hideMask: function(noFx){
        if (noFx) return this.parent();
        this.element.tween('opacity', 0).get('tween').chain(function(){
            this.element.setStyle('display', 'none');
            this.hidden = true;
            this.fireEvent('hide');
            this.callChain();
        }.bind(this));
    },

    destroy: function(){
        this.content.destroy();
        this.parent();
        this.target.eliminate('spinner');
    }

});

Spinner.implement(new Chain);

if (window.Request) {
    Request = Class.refactor(Request, {
        
        options: {
            useSpinner: false,
            spinnerOptions: {},
            spinnerTarget: false
        },
        
        initialize: function(options){
            this._send = this.send;
            this.send = function(options){
                if (this.spinner) this.spinner.chain(this._send.bind(this, options)).show();
                else this._send(options);
                return this;
            };
            this.previous(options);
            var update = document.id(this.options.spinnerTarget) || document.id(this.options.update);
            if (this.options.useSpinner && update) {
                this.spinner = update.get('spinner', this.options.spinnerOptions);
                ['onComplete', 'onException', 'onCancel'].each(function(event){
                    this.addEvent(event, this.spinner.hide.bind(this.spinner));
                }, this);
            }
        },
        
        getSpinner: function(){
            return this.spinner;
        }
        
    });
}

Element.Properties.spinner = {

    set: function(options){
        var spinner = this.retrieve('spinner');
        return this.eliminate('spinner').store('spinner:options', options);
    },

    get: function(options){
        if (options || !this.retrieve('spinner')){
            if (this.retrieve('spinner')) this.retrieve('spinner').destroy();
            if (options || !this.retrieve('spinner:options')) this.set('spinner', options);
            new Spinner(this, this.retrieve('spinner:options'));
        }
        return this.retrieve('spinner');
    }

};

Element.implement({

    spin: function(options){
        this.get('spinner', options).show();
        return this;
    },

    unspin: function(){
        var opt = Array.link(arguments, {options: Object.type, callback: Function.type});
        this.get('spinner', opt.options).hide(opt.callback);
        return this;
    }

});/*
---

script: Date.English.US.js

description: Date messages for US English.

license: MIT-style license

authors:
- Aaron Newton

requires:
- /Lang
- /Date

provides: [Date.English.US]

...
*/

MooTools.lang.set('en-US', 'Date', {

    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    //culture's date order: MM/DD/YYYY
    dateOrder: ['month', 'date', 'year'],
    shortDate: '%m/%d/%Y',
    shortTime: '%I:%M%p',
    AM: 'AM',
    PM: 'PM',

    /* Date.Extras */
    ordinal: function(dayOfMonth){
        //1st, 2nd, 3rd, etc.
        return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
    },

    lessThanMinuteAgo: 'less than a minute ago',
    minuteAgo: 'about a minute ago',
    minutesAgo: '{delta} minutes ago',
    hourAgo: 'about an hour ago',
    hoursAgo: 'about {delta} hours ago',
    dayAgo: '1 day ago',
    daysAgo: '{delta} days ago',
    weekAgo: '1 week ago',
    weeksAgo: '{delta} weeks ago',
    monthAgo: '1 month ago',
    monthsAgo: '{delta} months ago',
    yearAgo: '1 year ago',
    yearsAgo: '{delta} years ago',
    lessThanMinuteUntil: 'less than a minute from now',
    minuteUntil: 'about a minute from now',
    minutesUntil: '{delta} minutes from now',
    hourUntil: 'about an hour from now',
    hoursUntil: 'about {delta} hours from now',
    dayUntil: '1 day from now',
    daysUntil: '{delta} days from now',
    weekUntil: '1 week from now',
    weeksUntil: '{delta} weeks from now',
    monthUntil: '1 month from now',
    monthsUntil: '{delta} months from now',
    yearUntil: '1 year from now',
    yearsUntil: '{delta} years from now'

});
/*
---

script: Form.Validator.English.js

description: Date messages for English.

license: MIT-style license

authors:
- Aaron Newton

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.English]

...
*/

MooTools.lang.set('en-US', 'Form.Validator', {

    required:'This field is required.',
    minLength:'Please enter at least {minLength} characters (you entered {length} characters).',
    maxLength:'Please enter no more than {maxLength} characters (you entered {length} characters).',
    integer:'Please enter an integer in this field. Numbers with decimals (e.g. 1.25) are not permitted.',
    numeric:'Please enter only numeric values in this field (i.e. "1" or "1.1" or "-1" or "-1.1").',
    digits:'Please use numbers and punctuation only in this field (for example, a phone number with dashes or dots is permitted).',
    alpha:'Please use letters only (a-z) with in this field. No spaces or other characters are allowed.',
    alphanum:'Please use only letters (a-z) or numbers (0-9) only in this field. No spaces or other characters are allowed.',
    dateSuchAs:'Please enter a valid date such as {date}',
    dateInFormatMDY:'Please enter a valid date such as MM/DD/YYYY (i.e. "12/31/1999")',
    email:'Please enter a valid email address. For example "fred@domain.com".',
    url:'Please enter a valid URL such as http://www.google.com.',
    currencyDollar:'Please enter a valid $ amount. For example $100.00 .',
    oneRequired:'Please enter something for at least one of these inputs.',
    errorPrefix: 'Error: ',
    warningPrefix: 'Warning: ',

    //Form.Validator.Extras

    noSpace: 'There can be no spaces in this input.',
    reqChkByNode: 'No items are selected.',
    requiredChk: 'This field is required.',
    reqChkByName: 'Please select a {label}.',
    match: 'This field needs to match the {matchName} field',
    startDate: 'the start date',
    endDate: 'the end date',
    currendDate: 'the current date',
    afterDate: 'The date should be the same or after {label}.',
    beforeDate: 'The date should be the same or before {label}.',
    startMonth: 'Please select a start month',
    sameMonth: 'These two dates must be in the same month - you must change one or the other.',
    creditcard: 'The credit card number entered is invalid. Please check the number and try again. {length} digits entered.'

});/*
---

script: Date.Catalan.US.js

description: Date messages for Catalan.

license: MIT-style license

authors:
- Alfons Sanchez

requires:
- /Lang
- /Date

provides: [Date.Catalan]

...
*/

MooTools.lang.set('ca-CA', 'Date', {

    months: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juli', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'],
    days: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'],
    //culture's date order: MM/DD/YYYY
    dateOrder: ['date', 'month', 'year'],

    shortDate: '%d/%m/%Y',
    shortTime: '%H:%M',

    AM: 'AM',
    PM: 'PM',

    /* Date.Extras */
    ordinal: '',

    lessThanMinuteAgo: 'fa menys d`un minut',
    minuteAgo: 'fa un minut',
    minutesAgo: 'fa {delta} minuts',
    hourAgo: 'fa un hora',
    hoursAgo: 'fa unes {delta} hores',
    dayAgo: 'fa un dia',
    daysAgo: 'fa {delta} dies',
    lessThanMinuteUntil: 'menys d`un minut des d`ara',
    minuteUntil: 'un minut des d`ara',
    minutesUntil: '{delta} minuts des d`ara',
    hourUntil: 'un hora des d`ara',
    hoursUntil: 'unes {delta} hores des d`ara',
    dayUntil: '1 dia des d`ara',
    daysUntil: '{delta} dies des d`ara'

});/*
Script: Date.Czech.js
    Date messages for Czech.

    License:
        MIT-style license.

    Authors:
        Jan Černý chemiX

*/

MooTools.lang.set('cs-CZ', 'Date', {

    months: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
    days: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
    //culture's date order: MM/DD/YYYY
    dateOrder: ['date', 'month', 'year'],
    shortDate: '%d/%m/%Y',
    shortTime: '%H:%M',
    AM: 'dop.',
    PM: 'odp.',

    /* Date.Extras */
    ordinal: function(dayOfMonth){
        return '.';
    },

    // TODO : in examples use and fix it
    lessThanMinuteAgo: 'méně než minutou',
    minuteAgo: 'přibližně před minutou',
    minutesAgo: 'před {delta} minutami',
    hourAgo: 'přibližně před hodinou',
    hoursAgo: 'před {delta} hodinami',
    dayAgo: 'před dnem',
    daysAgo: 'před {delta} dni',
    lessThanMinuteUntil: 'před méně než minutou',
    minuteUntil: 'asi před minutou',
    minutesUntil: ' asi před {delta} minutami',
    hourUntil: 'asi před hodinou',
    hoursUntil: 'před {delta} hodinami',
    dayUntil: 'před dnem',
    daysUntil: 'před {delta} dni'

});
/*
---

script: Date.Danish.js

description: Date messages for Danish.

license: MIT-style license

authors:
- Martin Overgaard
- Henrik Hansen

requires:
- /Lang
- /Date

provides: [Date.Danish]

...
*/
 
MooTools.lang.set('da-DK', 'Date', {

    months: ['Januar', 'Februa', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'],
    days: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
    //culture's date order: DD/MM/YYYY
    dateOrder: ['date', 'month', 'year'],

    AM: 'AM',
    PM: 'PM',

    shortDate: '%d-%m-%Y',
    shortTime: '%H:%M',

    /* Date.Extras */
    ordinal: function(dayOfMonth){
      //1st, 2nd, 3rd, etc.
      return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
    },

    lessThanMinuteAgo: 'mindre end et minut siden',
    minuteAgo: 'omkring et minut siden',
    minutesAgo: '{delta} minutter siden',
    hourAgo: 'omkring en time siden',
    hoursAgo: 'omkring {delta} timer siden',
    dayAgo: '1 dag siden',
    daysAgo: '{delta} dage siden',
    weekAgo: '1 uge siden',
    weeksAgo: '{delta} uger siden',
    monthAgo: '1 måned siden',
    monthsAgo: '{delta} måneder siden',
    yearthAgo: '1 år siden',
    yearsAgo: '{delta} år siden',
    lessThanMinuteUntil: 'mindre end et minut fra nu',
    minuteUntil: 'omkring et minut fra nu',
    minutesUntil: '{delta} minutter fra nu',
    hourUntil: 'omkring en time fra nu',
    hoursUntil: 'omkring {delta} timer fra nu',
    dayUntil: '1 dag fra nu',
    daysUntil: '{delta} dage fra nu',
    weekUntil: '1 uge fra nu',
    weeksUntil: '{delta} uger fra nu',
    monthUntil: '1 måned fra nu',
    monthsUntil: '{delta} måneder fra nu',
    yearUntil: '1 år fra nu',
    yearsUntil: '{delta} år fra nu'

});
/*
---

script: Date.Dutch.js

description: Date messages in Dutch.

license: MIT-style license

authors:
- Lennart Pilon

requires:
- /Lang
- /Date

provides: [Date.Dutch]

...
*/

MooTools.lang.set('nl-NL', 'Date', {

    months: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
    days: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
    //culture's date order: DD/MM/YYYY
    dateOrder: ['date', 'month', 'year'],

    AM: 'AM',
    PM: 'PM',

    shortDate: '%d/%m/%Y',
    shortTime: '%H:%M',

    /* Date.Extras */
    ordinal: 'e',

    lessThanMinuteAgo: 'minder dan een minuut geleden',
    minuteAgo: 'ongeveer een minuut geleden',
    minutesAgo: 'minuten geleden',
    hourAgo: 'ongeveer een uur geleden',
    hoursAgo: 'ongeveer {delta} uur geleden',
    dayAgo: '{delta} dag geleden',
    daysAgo: 'dagen geleden',
    weekAgo: 'een week geleden',
    weeksAgo: '{delta} weken geleden',
    monthAgo: 'een maand geleden',
    monthsAgo: '{delta} maanden geleden',
    yearAgo: 'een jaar geleden',
    yearsAgo: '{delta} jaar geleden',
    lessThanMinuteUntil: 'minder dan een minuut vanaf nu',
    minuteUntil: 'ongeveer een minuut vanaf nu',
    minutesUntil: '{delta} minuten vanaf nu',
    hourUntil: 'ongeveer een uur vanaf nu',
    hoursUntil: 'ongeveer {delta} uur vanaf nu',
    dayUntil: '1 dag vanaf nu',
    daysUntil: '{delta} dagen vanaf nu',
    weekAgo: 'een week geleden',
    weeksAgo: '{delta} weken geleden',
    monthAgo: 'een maand geleden',
    monthsAgo: '{delta} maanden geleden',
    yearthAgo: 'een jaar geleden',
    yearsAgo: '{delta} jaar geleden',

    weekUntil: 'over een week',
    weeksUntil: 'over {delta} weken',
    monthUntil: 'over een maand',
    monthsUntil: 'over {delta} maanden',
    yearUntil: 'over een jaar',
    yearsUntil: 'over {delta} jaar' 

});/*
---

script: Date.English.GB.js

description: Date messages for British English.

license: MIT-style license

authors:
- Aaron Newton

requires:
- /Lang
- /Date

provides: [Date.English.GB]

...
*/

MooTools.lang.set('en-GB', 'Date', {

    dateOrder: ['date', 'month', 'year'],
    
    shortDate: '%d/%m/%Y',
    shortTime: '%H:%M'

}).set('cascade', ['en-US']);/*
---

script: Date.Estonian.js

description: Date messages for Estonian.

license: MIT-style license

authors:
- Kevin Valdek

requires:
- /Lang
- /Date

provides: [Date.Estonian]

...
*/

MooTools.lang.set('et-EE', 'Date', {

    months: ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'],
    days: ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'],
    //culture's date order: MM.DD.YYYY
    dateOrder: ['month', 'date', 'year'],

    AM: 'AM',
    PM: 'PM',

    shortDate: '%m.%d.%Y',
    shortTime: '%H:%M',

    /* Date.Extras */
    ordinal: '',

    lessThanMinuteAgo: 'vähem kui minut aega tagasi',
    minuteAgo: 'umbes minut aega tagasi',
    minutesAgo: '{delta} minutit tagasi',
    hourAgo: 'umbes tund aega tagasi',
    hoursAgo: 'umbes {delta} tundi tagasi',
    dayAgo: '1 päev tagasi',
    daysAgo: '{delta} päeva tagasi',
    weekAgo: '1 nädal tagasi',
    weeksAgo: '{delta} nädalat tagasi',
    monthAgo: '1 kuu tagasi',
    monthsAgo: '{delta} kuud tagasi',
    yearAgo: '1 aasta tagasi',
    yearsAgo: '{delta} aastat tagasi',
    lessThanMinuteUntil: 'vähem kui minuti aja pärast',
    minuteUntil: 'umbes minuti aja pärast',
    minutesUntil: '{delta} minuti pärast',
    hourUntil: 'umbes tunni aja pärast',
    hoursUntil: 'umbes {delta} tunni pärast',
    dayUntil: '1 päeva pärast',
    daysUntil: '{delta} päeva pärast',
    weekUntil: '1 nädala pärast',
    weeksUntil: '{delta} nädala pärast',
    monthUntil: '1 kuu pärast',
    monthsUntil: '{delta} kuu pärast',
    yearUntil: '1 aasta pärast',
    yearsUntil: '{delta} aasta pärast'

});/*
---

script: Date.French.js

description: Date messages in French.

license: MIT-style license

authors:
- Nicolas Sorosac
- Antoine Abt

requires:
- /Lang
- /Date

provides: [Date.French]

...
*/
 
MooTools.lang.set('fr-FR', 'Date', {

    months: ['janvier', 'f&eacute;vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao&ucirc;t', 'septembre', 'octobre', 'novembre', 'd&eacute;cembre'],
    days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    dateOrder: ['date', 'month', 'year'],

    AM: 'AM',
    PM: 'PM',

    shortDate: '%d/%m/%Y',
    shortTime: '%H:%M',

    /* Date.Extras */
    getOrdinal: function(dayOfMonth){
      return (dayOfMonth > 1) ? '' : 'er';
    },

    lessThanMinuteAgo: 'il y a moins d\'une minute',
    minuteAgo: 'il y a une minute',
    minutesAgo: 'il y a {delta} minutes',
    hourAgo: 'il y a une heure',
    hoursAgo: 'il y a {delta} heures',
    dayAgo: 'il y a un jour',
    daysAgo: 'il y a {delta} jours',
    weekAgo: 'il y a une semaine',
    weeksAgo: 'il y a {delta} semaines',
    monthAgo: 'il y a 1 mois',
    monthsAgo: 'il y a {delta} mois',
    yearthAgo: 'il y a 1 an',
    yearsAgo: 'il y a {delta} ans',
    lessThanMinuteUntil: 'dans moins d\'une minute',
    minuteUntil: 'dans une minute',
    minutesUntil: 'dans {delta} minutes',
    hourUntil: 'dans une heure',
    hoursUntil: 'dans {delta} heures',
    dayUntil: 'dans un jour',
    daysUntil: 'dans {delta} jours',
    weekUntil: 'dans 1 semaine',
    weeksUntil: 'dans {delta} semaines',
    monthUntil: 'dans 1 mois',
    monthsUntil: 'dans {delta} mois',
    yearUntil: 'dans 1 an',
    yearsUntil: 'dans {delta} ans'

});
/*
---

script: Date.Italian.js

description: Date messages for Italian.

license: MIT-style license.

authors:
- Andrea Novero
- Valerio Proietti

requires:
- /Lang
- /Date

provides: [Date.Italian]

...
*/
 
MooTools.lang.set('it-IT', 'Date', {
 
    months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    days: ['Domenica', 'Luned&igrave;', 'Marted&igrave;', 'Mercoled&igrave;', 'Gioved&igrave;', 'Venerd&igrave;', 'Sabato'],
    //culture's date order: DD/MM/YYYY
    dateOrder: ['date', 'month', 'year'],

    AM: 'AM',
    PM: 'PM',

    shortDate: '%d/%m/%Y',
    shortTime: '%H.%M',

    /* Date.Extras */
    ordinal: '&ordm;',

    lessThanMinuteAgo: 'meno di un minuto fa',
    minuteAgo: 'circa un minuto fa',
    minutesAgo: 'circa {delta} minuti fa',
    hourAgo: 'circa un\'ora fa',
    hoursAgo: 'circa {delta} ore fa',
    dayAgo: 'circa 1 giorno fa',
    daysAgo: 'circa {delta} giorni fa',
    lessThanMinuteUntil: 'tra meno di un minuto',
    minuteUntil: 'tra circa un minuto',
    minutesUntil: 'tra circa {delta} minuti',
    hourUntil: 'tra circa un\'ora',
    hoursUntil: 'tra circa {delta} ore',
    dayUntil: 'tra circa un giorno',
    daysUntil: 'tra circa {delta} giorni'

});/*
---

script: Date.Norwegian.js

description: Date messages in Norwegian.

license: MIT-style license

authors:
- Espen 'Rexxars' Hovlandsdal

requires:
- /Lang
- /Date

provides: [Date.Norwegian]

...
*/

MooTools.lang.set('no-NO', 'Date', {

    dateOrder: ['date', 'month', 'year'],

    shortDate: '%d.%m.%Y',
    shortTime: '%H:%M',

    lessThanMinuteAgo: 'kortere enn et minutt siden',
    minuteAgo: 'omtrent et minutt siden',
    minutesAgo: '{delta} minutter siden',
    hourAgo: 'omtrent en time siden',
    hoursAgo: 'omtrent {delta} timer siden',
    dayAgo: '{delta} dag siden',
    daysAgo: '{delta} dager siden'

});/*
---

script: Date.Polish.js

description: Date messages for Polish.

license: MIT-style license

authors:
- Oskar Krawczyk

requires:
- /Lang
- /Date

provides: [Date.Polish]

...
*/

MooTools.lang.set('pl-PL', 'Date', {
    months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
    days: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
    dateOrder: ['year', 'month', 'date'],
    AM: 'nad ranem',
    PM: 'po południu',

    shortDate: '%Y-%m-%d',
    shortTime: '%H:%M',

    /* Date.Extras */
    ordinal: function(dayOfMonth){
        return (dayOfMonth > 3 && dayOfMonth < 21) ? 'ty' : ['ty', 'szy', 'gi', 'ci', 'ty'][Math.min(dayOfMonth % 10, 4)];
    },

    lessThanMinuteAgo: 'mniej niż minute temu',
    minuteAgo: 'około minutę temu',
    minutesAgo: '{delta} minut temu',
    hourAgo: 'około godzinę temu',
    hoursAgo: 'około {delta} godzin temu',
    dayAgo: 'Wczoraj',
    daysAgo: '{delta} dni temu',
    lessThanMinuteUntil: 'za niecałą minutę',
    minuteUntil: 'za około minutę',
    minutesUntil: 'za {delta} minut',
    hourUntil: 'za około godzinę',
    hoursUntil: 'za około {delta} godzin',
    dayUntil: 'za 1 dzień',
    daysUntil: 'za {delta} dni'
});/*
---

script: Date.Portuguese.BR.js

description: Date messages in Portuguese-BR (Brazil).

license: MIT-style license

authors:
- Fabio Miranda Costa

requires:
- /Lang
- /Date

provides: [Date.Portuguese.BR]

...
*/

MooTools.lang.set('pt-BR', 'Date', {

    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    days: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
    //culture's date order: DD/MM/YYYY
    dateOrder: ['date', 'month', 'year'],
    shortDate: '%d/%m/%Y',
    shortTime: '%H:%M',

    /* Date.Extras */
    ordinal: function(dayOfMonth){
        //1º, 2º, 3º, etc.
        return '&ordm;';
    },

    lessThanMinuteAgo: 'há menos de um minuto',
    minuteAgo: 'há cerca de um minuto',
    minutesAgo: 'há {delta} minutos',
    hourAgo: 'há cerca de uma hora',
    hoursAgo: 'há cerca de {delta} horas',
    dayAgo: 'há um dia',
    daysAgo: 'há {delta} dias',
    weekAgo: 'há uma semana',
    weeksAgo: 'há {delta} semanas',
    monthAgo: 'há um mês',
    monthsAgo: 'há {delta} meses',
    yearAgo: 'há um ano',
    yearsAgo: 'há {delta} anos',
    lessThanMinuteUntil: 'em menos de um minuto',
    minuteUntil: 'em um minuto',
    minutesUntil: 'em {delta} minutos',
    hourUntil: 'em uma hora',
    hoursUntil: 'em {delta} horas',
    dayUntil: 'em um dia',
    daysUntil: 'em {delta} dias',
    weekUntil: 'em uma semana',
    weeksUntil: 'em {delta} semanas',
    monthUntil: 'em um mês',
    monthsUntil: 'em {delta} meses',
    yearUntil: 'em um ano',
    yearsUntil: 'em {delta} anos'

});/*
Script: Date.Russian.js
    Date messages for Russian.

    License:
        MIT-style license.

    Authors:
        Evstigneev Pavel
*/

MooTools.lang.set('ru-RU-unicode', 'Date', {

    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    //culture's date order: MM/DD/YYYY
    dateOrder: ['date', 'month', 'year'],
    AM: 'AM',
    PM: 'PM',

    shortDate: '%d/%m/%Y',
    shortTime: '%H:%M',


  /*
   *  Russian language pluralization rules, taken from CLDR project, http://unicode.org/cldr/
   *
   *  one -> n mod 10 is 1 and n mod 100 is not 11;
   *  few -> n mod 10 in 2..4 and n mod 100 not in 12..14;
   *  many -> n mod 10 is 0 or n mod 10 in 5..9 or n mod 100 in 11..14;
   *  other -> everything else (example 3.14)
   */

  pluralize: function (n, one, few, many, other) {
    var modulo10 = n % 10
    var modulo100 = n % 100

    if (modulo10 == 1 && modulo100 != 11) {
      return one;
    } else if ((modulo10 == 2 || modulo10 == 3 || modulo10 == 4) && !(modulo100 == 12 || modulo100 == 13 || modulo100 == 14)) {
      return few;
    } else if (modulo10 == 0 || (modulo10 == 5 || modulo10 == 6 || modulo10 == 7 || modulo10 == 8 || modulo10 == 9) || (modulo100 == 11 || modulo100 == 12 || modulo100 == 13 || modulo100 == 14)) {
      return many;
    } else {
      return other;
    }
  },

    /* Date.Extras */
    ordinal: '',
    lessThanMinuteAgo: 'меньше минуты назад',
    minuteAgo: 'минута назад',
    minutesAgo: function (delta) { return  '{delta} ' + this.pluralize(delta, 'минута', 'минуты', 'минут') + ' назад'},
    hourAgo: 'час назад',
    hoursAgo: function (delta) { return  '{delta} ' + this.pluralize(delta, 'час', 'часа', 'часов') + ' назад'},
    dayAgo: 'вчера',
    daysAgo: function (delta) { return '{delta} ' + this.pluralize(delta, 'день', 'дня', 'дней') + ' назад' },
    lessThanMinuteUntil: 'меньше минуты назад',
    minuteUntil: 'через минуту',
    minutesUntil: function (delta) { return  'через {delta} ' + this.pluralize(delta, 'час', 'часа', 'часов') + ''},
    hourUntil: 'через час',
    hoursUntil: function (delta) { return  'через {delta} ' + this.pluralize(delta, 'час', 'часа', 'часов') + ''},
    dayUntil: 'завтра',
    daysUntil: function (delta) { return 'через {delta} ' + this.pluralize(delta, 'день', 'дня', 'дней') + '' }

});/*
---

script: Date.Spanish.US.js

description: Date messages for Spanish.

license: MIT-style license

authors:
- Ãlfons Sanchez

requires:
- /Lang
- /Date

provides: [Date.Spanish]

...
*/

MooTools.lang.set('es-ES', 'Date', {

    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    days: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
    //culture's date order: MM/DD/YYYY
    dateOrder: ['date', 'month', 'year'],
    AM: 'AM',
    PM: 'PM',

    shortDate: '%d/%m/%Y',
    shortTime: '%H:%M',

    /* Date.Extras */
    ordinal: '',

    lessThanMinuteAgo: 'hace menos de un minuto',
    minuteAgo: 'hace un minuto',
    minutesAgo: 'hace {delta} minutos',
    hourAgo: 'hace una hora',
    hoursAgo: 'hace unas {delta} horas',
    dayAgo: 'hace un dia',
    daysAgo: 'hace {delta} dias',
    weekAgo: 'hace una semana',
    weeksAgo: 'hace unas {delta} semanas',
    monthAgo: 'hace un mes',
    monthsAgo: 'hace {delta} meses',
    yearAgo: 'hace un año',
    yearsAgo: 'hace {delta} años',
    lessThanMinuteUntil: 'menos de un minuto desde ahora',
    minuteUntil: 'un minuto desde ahora',
    minutesUntil: '{delta} minutos desde ahora',
    hourUntil: 'una hora desde ahora',
    hoursUntil: 'unas {delta} horas desde ahora',
    dayUntil: 'un dia desde ahora',
    daysUntil: '{delta} dias desde ahora',
    weekUntil: 'una semana desde ahora',
    weeksUntil: 'unas {delta} semanas desde ahora',
    monthUntil: 'un mes desde ahora',
    monthsUntil: '{delta} meses desde ahora',
    yearUntil: 'un año desde ahora',
    yearsUntil: '{delta} años desde ahora'

});/*
---

script: Date.Swedish.js

description: Date messages for Swedish (SE).

license: MIT-style license

authors:
- Martin Lundgren

requires:
- /Lang
- /Date

provides: [Date.Swedish]

...
*/

MooTools.lang.set('sv-SE', 'Date', {

    months: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
    days: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
    // culture's date order: YYYY-MM-DD
    dateOrder: ['year', 'month', 'date'],
    AM: '',
    PM: '',

    shortDate: '%Y-%m-%d',
    shortTime: '%H:%M',

    /* Date.Extras */
    ordinal: function(dayOfMonth){
        // Not used in Swedish
        return '';
    },

    lessThanMinuteAgo: 'mindre än en minut sedan',
    minuteAgo: 'ungefär en minut sedan',
    minutesAgo: '{delta} minuter sedan',
    hourAgo: 'ungefär en timme sedan',
    hoursAgo: 'ungefär {delta} timmar sedan',
    dayAgo: '1 dag sedan',
    daysAgo: '{delta} dagar sedan',
    lessThanMinuteUntil: 'mindre än en minut sedan',
    minuteUntil: 'ungefär en minut sedan',
    minutesUntil: '{delta} minuter sedan',
    hourUntil: 'ungefär en timme sedan',
    hoursUntil: 'ungefär {delta} timmar sedan',
    dayUntil: '1 dag sedan',
    daysUntil: '{delta} dagar sedan'

});/*
---

script: Date.Ukrainian.js

description: Date messages for Ukrainian.

license: MIT-style license

authors:
- Slik

requires:
- /Lang
- /Date

provides: [Date.Ukrainian]

...
*/

MooTools.lang.set('uk-UA', 'Date', {
    months: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
    days: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'],
    //culture's date order: DD/MM/YYYY
    dateOrder: ['date', 'month', 'year'],
    AM: 'до полудня',
    PM: 'по полудню',

    shortDate: '%d/%m/%Y',
    shortTime: '%H:%M',

    pluralize: function(n, one, few, many, other) {
        var d = parseInt(n / 10);
        var z = n % 10;
        var s = parseInt(n / 100);

        if(d == 1 && n > 10) {
            return many;
        }

        if(z == 1) {
            return one;
        } else if(z > 0 && z < 5) {
            return few;
        } else {
            return many; 
        }
    },

    /* Date.Extras */
    ordinal: '',
    lessThanMinuteAgo: 'меньше хвилини тому',
    minuteAgo: 'хвилину тому',
    minutesAgo: function (delta) { return  '{delta} ' + this.pluralize(delta, 'хвилину', 'хвилини', 'хвилин') + ' назад'},
    hourAgo: 'годину назад',
    hoursAgo: function (delta) { return  '{delta} ' + this.pluralize(delta, 'годину', 'години', 'годин') + ' назад'},
    dayAgo: 'вчора',
    daysAgo: function (delta) { return '{delta} ' + this.pluralize(delta, 'день', 'дня', 'днів') + ' назад' },
    lessThanMinuteUntil: 'за мить',
    minuteUntil: 'через хвилину',
    minutesUntil: function (delta) { return  'через {delta} ' + this.pluralize(delta, 'хвилину', 'хвилини', 'хвилин')},
    hourUntil: 'через годину',
    hoursUntil: function (delta) { return  'через {delta} ' + this.pluralize(delta, 'годину', 'години', 'годин')},
    dayUntil: 'завтра',
    daysUntil: function (delta) { return 'через {delta} ' + this.pluralize(delta, 'день', 'дня', 'днів')}

});
/*
---

script: Form.Validator.Arabic.js

description: Form.Validator messages in Arabic.

license: MIT-style license

authors:
- Chafik Barbar

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Arabic]

...
*/

MooTools.lang.set('ar', 'Form.Validator', {
    required:'هذا الحقل مطلوب.',
    minLength:'رجاءً إدخال {minLength}  أحرف على الأقل (تم إدخال {length} أحرف).',
    maxLength:'الرجاء عدم إدخال أكثر من {maxLength} أحرف (تم إدخال {length} أحرف).',
    integer:'الرجاء إدخال عدد صحيح في هذا الحقل. أي رقم ذو كسر عشري أو مئوي (مثال 1.25 ) غير مسموح.',
    numeric:'الرجاء إدخال قيم رقمية في هذا الحقل (مثال "1" أو "1.1" أو "-1" أو "-1.1").',
    digits:'الرجاء أستخدام قيم رقمية وعلامات ترقيمية فقط في هذا الحقل (مثال, رقم هاتف مع نقطة أو شحطة)',
    alpha:'الرجاء أستخدام أحرف فقط (ا-ي) في هذا الحقل. أي فراغات أو علامات غير مسموحة.',
    alphanum:'الرجاء أستخدام أحرف فقط (ا-ي) أو أرقام (0-9) فقط في هذا الحقل. أي فراغات أو علامات غير مسموحة.',
    dateSuchAs:'الرجاء إدخال تاريخ صحيح كالتالي {date}',
    dateInFormatMDY:'الرجاء إدخال تاريخ صحيح (مثال, 31-12-1999)',
    email:'الرجاء إدخال بريد إلكتروني صحيح.',
    url:'الرجاء إدخال عنوان إلكتروني صحيح مثل http://www.google.com',
    currencyDollar:'الرجاء إدخال قيمة $ صحيحة.  مثال, 100.00$',
    oneRequired:'الرجاء إدخال قيمة في أحد هذه الحقول على الأقل.',
    errorPrefix: 'خطأ: ',
    warningPrefix: 'تحذير: '
}).set('ar', 'Date', {
    dateOrder: ['date', 'month', 'year', '/']
});/*
---

script: Form.Validator.Catalan.js

description: Date messages for Catalan.

license: MIT-style license

authors:
- Miquel Hudin
- Alfons Sanchez

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Catalan]

...
*/

MooTools.lang.set('ca-CA', 'Form.Validator', {

    required:'Aquest camp es obligatori.',
    minLength:'Per favor introdueix al menys {minLength} caracters (has introduit {length} caracters).',
    maxLength:'Per favor introdueix no mes de {maxLength} caracters (has introduit {length} caracters).',
    integer:'Per favor introdueix un nombre enter en aquest camp. Nombres amb decimals (p.e. 1,25) no estan permesos.',
    numeric:'Per favor introdueix sols valors numerics en aquest camp (p.e. "1" o "1,1" o "-1" o "-1,1").',
    digits:'Per favor usa sols numeros i puntuacio en aquest camp (per exemple, un nombre de telefon amb guions i punts no esta permes).',
    alpha:'Per favor utilitza lletres nomes (a-z) en aquest camp. No s´admiteixen espais ni altres caracters.',
    alphanum:'Per favor, utilitza nomes lletres (a-z) o numeros (0-9) en aquest camp. No s´admiteixen espais ni altres caracters.',
    dateSuchAs:'Per favor introdueix una data valida com {date}',
    dateInFormatMDY:'Per favor introdueix una data valida com DD/MM/YYYY (p.e. "31/12/1999")',
    email:'Per favor, introdueix una adreça de correu electronic valida. Per exemple,  "fred@domain.com".',
    url:'Per favor introdueix una URL valida com http://www.google.com.',
    currencyDollar:'Per favor introdueix una quantitat valida de €. Per exemple €100,00 .',
    oneRequired:'Per favor introdueix alguna cosa per al menys una d´aquestes entrades.',
    errorPrefix: 'Error: ',
    warningPrefix: 'Avis: ',

    //Form.Validator.Extras

    noSpace: 'No poden haver espais en aquesta entrada.',
    reqChkByNode: 'No hi han elements seleccionats.',
    requiredChk: 'Aquest camp es obligatori.',
    reqChkByName: 'Per favor selecciona una {label}.',
    match: 'Aquest camp necessita coincidir amb el camp {matchName}',
    startDate: 'la data de inici',
    endDate: 'la data de fi',
    currendDate: 'la data actual',
    afterDate: 'La data deu ser igual o posterior a {label}.',
    beforeDate: 'La data deu ser igual o anterior a {label}.',
    startMonth: 'Per favor selecciona un mes d´orige',
    sameMonth: 'Aquestes dos dates deuen estar dins del mateix mes - deus canviar una o altra.'

});/*
Script: FormValidator.Czech.js
    Date messages for Czech

    License:
        MIT-style license.

    Authors:
        Jan Černý chemiX

*/

MooTools.lang.set('cs-CZ', 'FormValidator', {

    required:'Tato položka je povinná.',
    minLength:'Zadejte prosím alespoň {minLength} znaků (napsáno {length} znaků).',
    maxLength:'Zadejte prosím méně než {maxLength} znaků (nápsáno {length} znaků).',
    integer:'Zadejte prosím celé číslo. Desetinná čísla (např. 1.25) nejsou povolena.',
    numeric:'Zadejte jen číselné hodnoty  (tj. "1" nebo "1.1" nebo "-1" nebo "-1.1").',
    digits:'Zadejte prosím pouze čísla a interpunkční znaménka(například telefonní číslo s pomlčkami nebo tečkami je povoleno).',
    alpha:'Zadejte prosím pouze písmena (a-z). Mezery nebo jiné znaky nejsou povoleny.',
    alphanum:'Zadejte prosím pouze písmena (a-z) nebo číslice (0-9). Mezery nebo jiné znaky nejsou povoleny.',
    dateSuchAs:'Zadejte prosím platné datum jako {date}',
    dateInFormatMDY:'Zadejte prosím platné datum jako MM / DD / RRRR (tj. "12/31/1999")',
    email:'Zadejte prosím platnou e-mailovou adresu. Například "fred@domain.com".',
    url:'Zadejte prosím platnou URL adresu jako http://www.google.com.',
    currencyDollar:'Zadejte prosím platnou částku. Například $100.00.',
    oneRequired:'Zadejte prosím alespoň jednu hodnotu pro tyto položky.',
    errorPrefix: 'Chyba: ',
    warningPrefix: 'Upozornění: ',

    //FormValidator.Extras

    noSpace: 'V této položce nejsou povoleny mezery',
    reqChkByNode: 'Nejsou vybrány žádné položky.',
    requiredChk: 'Tato položka je vyžadována.',
    reqChkByName: 'Prosím vyberte {label}.',
    match: 'Tato položka se musí shodovat s položkou {matchName}',
    startDate: 'datum zahájení',
    endDate: 'datum ukončení',
    currendDate: 'aktuální datum',
    afterDate: 'Datum by mělo být stejné nebo větší než {label}.',
    beforeDate: 'Datum by mělo být stejné nebo menší než {label}.',
    startMonth: 'Vyberte počáteční měsíc.',
    sameMonth: 'Tyto dva datumy musí být ve stejném měsíci - změňte jeden z nich.'
});
/*
---

script: Form.Validator.Chinese.js

description: Form.Validator messages in chinese (both simplified and traditional).

license: MIT-style license

authors:
- 陈桂军 - guidy <at> ixuer [dot] net

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Chinese]

...
*/

/*
In Chinese:
------------
需要指出的是：
简体中文适用于中国大陆，
繁体中文适用于香港、澳门和台湾省。
简体中文和繁体中文在字体和语法上有很多的不同之处。

我可以确保简体中文语言包的准确性，
但对于繁体中文，我可以保证用户可以准确的理解，但无法保证语句符合他们的阅读习惯。
如果您不能确认的话，可以只使用简体中文语言包，因为它是最通用的。

In English:
------------
It should be noted that:
Simplified  Chinese apply to mainland Chinese,
Traditional Chinese apply to Hong Kong, Macao and Taiwan Province.
There are a lot of different from Simplified  Chinese and Traditional Chinese , Contains font and syntax .

I can assure Simplified Chinese language pack accuracy .
For Traditional Chinese, I can only guarantee that users can understand, but not necessarily in line with their reading habits.
If you are unsure, you can only use the simplified Chinese language pack, as it is the most common.

*/

// Simplified Chinese
MooTools.lang.set('zhs-CN', 'Form.Validator', {
    required:'这是必填项。',
    minLength:'请至少输入 {minLength} 个字符 (已输入 {length} 个)。',
    maxLength:'最多只能输入 {maxLength} 个字符 (已输入 {length} 个)。',
    integer:'请输入一个整数，不能包含小数点。例如："1", "200"。',
    numeric:'请输入一个数字，例如："1", "1.1", "-1", "-1.1"。',
    digits:'这里只能接受数字和标点的输入，标点可以是："(", ")", ".", ":", "-", "+", "#"和空格。',
    alpha:'请输入 A-Z 的 26 个字母，不能包含空格或任何其他字符。',
    alphanum:'请输入 A-Z 的 26 个字母或 0-9 的 10 个数字，不能包含空格或任何其他字符。',
    dateSuchAs:'请输入合法的日期格式，如：{date}。',
    dateInFormatMDY:'请输入合法的日期格式，例如：MM/DD/YYYY ("12/31/1999")。',
    email:'请输入合法的电子信箱地址，例如："fred@domain.com"。',
    url:'请输入合法的 Url 地址，例如：http://www.google.com。',
    currencyDollar:'请输入合法的货币符号，例如：￥',
    oneRequired:'请至少选择一项。',
    errorPrefix: '错误：',
    warningPrefix: '警告：'
});

// Traditional Chinese
MooTools.lang.set('zht-CN', 'Form.Validator', {
    required:'這是必填項。',
    minLength:'請至少鍵入 {minLength} 個字符(已鍵入 {length} 個)。',
    maxLength:'最多只能鍵入 {maxLength} 個字符(已鍵入 {length} 個)。',
    integer:'請鍵入一個整數，不能包含小數點。例如："1", "200"。',
    numeric:'請鍵入一個數字，例如："1", "1.1", "-1", "-1.1"。',
    digits:'這裡只能接受數字和標點的鍵入，標點可以是："(", ")", ".", ":", "-", "+", "#"和空格。',
    alpha:'請鍵入 A-Z 的 26 個字母，不能包含空格或任何其他字符。',
    alphanum:'請鍵入 A-Z 的 26 個字母或 0-9 的 10 個數字，不能包含空格或任何其他字符。',
    dateSuchAs:'請鍵入合法的日期格式，如：{date}。',
    dateInFormatMDY:'請鍵入合法的日期格式，例如：MM/DD/YYYY ("12/31/1999")。',
    email:'請鍵入合法的電子信箱地址，例如："fred@domain.com"。',
    url:'請鍵入合法的 Url 地址，例如：http://www.google.com。',
    currencyYuan:'請鍵入合法的貨幣符號，例如：￥',
    oneRequired:'請至少選擇一項。',
    errorPrefix: '錯誤：',
    warningPrefix: '警告：'
});

Form.Validator.add('validate-currency-yuan', {
    errorMsg: function(){
        return Form.Validator.getMsg('currencyYuan');
    },
    test: function(element) {
        // [￥]1[##][,###]+[.##]
        // [￥]1###+[.##]
        // [￥]0.##
        // [￥].##
        return Form.Validator.getValidator('IsEmpty').test(element) ||  (/^￥?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/).test(element.get('value'));
    }
});
/*
---

script: Form.Validator.Dutch.js

description: Form.Validator messages in Dutch.

license: MIT-style license

authors:
- Lennart Pilon

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Dutch]

...
*/

MooTools.lang.set('nl-NL', 'Form.Validator', {
    required:'Dit veld is verplicht.',
    minLength:'Vul minimaal {minLength} karakters in (je hebt {length} karakters ingevoerd).',
    maxLength:'Vul niet meer dan {maxLength} karakters in (je hebt {length} karakters ingevoerd).',
    integer:'Vul een getal in. Getallen met decimalen (bijvoorbeeld 1,25) zijn niet toegestaan.',
    numeric:'Vul alleen numerieke waarden in (bijvoorbeeld. "1" of "1.1" of "-1" of "-1.1").',
    digits:'Vul alleen nummers en leestekens in (bijvoorbeeld een telefoonnummer met een streepje).',
    alpha:'Vul alleen letters in (a-z). Spaties en andere karakters zijn niet toegestaan.',
    alphanum:'Vul alleen letters in (a-z) of nummers (0-9). Spaties en andere karakters zijn niet toegestaan.',
    dateSuchAs:'Vul een geldige datum in, zoals {date}',
    dateInFormatMDY:'Vul een geldige datum, in het formaat MM/DD/YYYY (bijvoorbeeld "12/31/1999")',
    email:'Vul een geldig e-mailadres in. Bijvoorbeeld "fred@domein.nl".',
    url:'Vul een geldige URL in, zoals http://www.google.nl.',
    currencyDollar:'Vul een geldig $ bedrag in. Bijvoorbeeld $100.00 .',
    oneRequired:'Vul iets in bij minimaal een van de invoervelden.',
    warningPrefix: 'Waarschuwing: ',
    errorPrefix: 'Fout: '
});/*
---

script: Form.Validator.Estonian.js

description: Date messages for Estonian.

license: MIT-style license

authors:
- Kevin Valdek

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Estonian]

...
*/

MooTools.lang.set('et-EE', 'Form.Validator', {

    required:'Väli peab olema täidetud.',
    minLength:'Palun sisestage vähemalt {minLength} tähte (te sisestasite {length} tähte).',
    maxLength:'Palun ärge sisestage rohkem kui {maxLength} tähte (te sisestasite {length} tähte).',
    integer:'Palun sisestage väljale täisarv. Kümnendarvud (näiteks 1.25) ei ole lubatud.',
    numeric:'Palun sisestage ainult numbreid väljale (näiteks "1", "1.1", "-1" või "-1.1").',
    digits:'Palun kasutage ainult numbreid ja kirjavahemärke (telefoninumbri sisestamisel on lubatud kasutada kriipse ja punkte).',
    alpha:'Palun kasutage ainult tähti (a-z). Tühikud ja teised sümbolid on keelatud.',
    alphanum:'Palun kasutage ainult tähti (a-z) või numbreid (0-9). Tühikud ja teised sümbolid on keelatud.',
    dateSuchAs:'Palun sisestage kehtiv kuupäev kujul {date}',
    dateInFormatMDY:'Palun sisestage kehtiv kuupäev kujul MM.DD.YYYY (näiteks: "12.31.1999").',
    email:'Palun sisestage kehtiv e-maili aadress (näiteks: "fred@domain.com").',
    url:'Palun sisestage kehtiv URL (näiteks: http://www.google.com).',
    currencyDollar:'Palun sisestage kehtiv $ summa (näiteks: $100.00).',
    oneRequired:'Palun sisestage midagi vähemalt ühele antud väljadest.',
    errorPrefix: 'Viga: ',
    warningPrefix: 'Hoiatus: ',

    //Form.Validator.Extras

    noSpace: 'Väli ei tohi sisaldada tühikuid.',
    reqChkByNode: 'Ükski väljadest pole valitud.',
    requiredChk: 'Välja täitmine on vajalik.',
    reqChkByName: 'Palun valige üks {label}.',
    match: 'Väli peab sobima {matchName} väljaga',
    startDate: 'algkuupäev',
    endDate: 'lõppkuupäev',
    currendDate: 'praegune kuupäev',
    afterDate: 'Kuupäev peab olema võrdne või pärast {label}.',
    beforeDate: 'Kuupäev peab olema võrdne või enne {label}.',
    startMonth: 'Palun valige algkuupäev.',
    sameMonth: 'Antud kaks kuupäeva peavad olema samas kuus - peate muutma ühte kuupäeva.'

});/*
---

script: Form.Validator.French.js

description: Form.Validator messages in French.

license: MIT-style license

authors: 
- Miquel Hudin
- Nicolas Sorosac <nicolas <dot> sorosac <at> gmail <dot> com>

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.French]

...
*/
 
MooTools.lang.set('fr-FR', 'Form.Validator', {
  required:'Ce champ est obligatoire.',
  minLength:'Veuillez saisir un minimum de {minLength} caract&egrave;re(s) (vous avez saisi {length} caract&egrave;re(s)).',
  maxLength:'Veuillez saisir un maximum de {maxLength} caract&egrave;re(s) (vous avez saisi {length} caract&egrave;re(s)).',
  integer:'Veuillez saisir un nombre entier dans ce champ. Les nombres d&eacute;cimaux (ex : "1,25") ne sont pas autoris&eacute;s.',
  numeric:'Veuillez saisir uniquement des chiffres dans ce champ (ex : "1" ou "1,1" ou "-1" ou "-1,1").',
  digits:'Veuillez saisir uniquement des chiffres et des signes de ponctuation dans ce champ (ex : un num&eacute;ro de t&eacute;l&eacute;phone avec des traits d\'union est autoris&eacute;).',
  alpha:'Veuillez saisir uniquement des lettres (a-z) dans ce champ. Les espaces ou autres caract&egrave;res ne sont pas autoris&eacute;s.',
  alphanum:'Veuillez saisir uniquement des lettres (a-z) ou des chiffres (0-9) dans ce champ. Les espaces ou autres caract&egrave;res ne sont pas autoris&eacute;s.',
  dateSuchAs:'Veuillez saisir une date correcte comme {date}',
  dateInFormatMDY:'Veuillez saisir une date correcte, au format JJ/MM/AAAA (ex : "31/11/1999").',
  email:'Veuillez saisir une adresse de courrier &eacute;lectronique. Par example "fred@domaine.com".',
  url:'Veuillez saisir une URL, comme http://www.google.com.',
  currencyDollar:'Veuillez saisir une quantit&eacute; correcte. Par example 100,00&euro;.',
  oneRequired:'Veuillez s&eacute;lectionner au moins une de ces options.',
  errorPrefix: 'Erreur : ',
  warningPrefix: 'Attention : ',
  
  //Form.Validator.Extras
 
  noSpace: 'Ce champ n\'accepte pas les espaces.',
  reqChkByNode: 'Aucun &eacute;l&eacute;ment n\'est s&eacute;lectionn&eacute;.',
  requiredChk: 'Ce champ est obligatoire.',
  reqChkByName: 'Veuillez s&eacute;lectionner un(e) {label}.',
  match: 'Ce champ doit correspondre avec le champ {matchName}.',
  startDate: 'date de d&eacute;but',
  endDate: 'date de fin',
  currendDate: 'date actuelle',
  afterDate: 'La date doit &ecirc;tre identique ou post&eacute;rieure &agrave; {label}.',
  beforeDate: 'La date doit &ecirc;tre identique ou ant&eacute;rieure &agrave; {label}.',
  startMonth: 'Veuillez s&eacute;lectionner un mois de d&eacute;but.',
  sameMonth: 'Ces deux dates doivent &ecirc;tre dans le m&ecirc;me mois - vous devez en modifier une.'
 
});/*
---

script: Form.Validator.Italian.js

description: Form.Validator messages in Italian.

license: MIT-style license

authors:
- Leonardo Laureti
- Andrea Novero

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Italian]

...
*/
 
MooTools.lang.set('it-IT', 'Form.Validator', {

    required:'Il campo &egrave; obbligatorio.',
    minLength:'Inserire almeno {minLength} caratteri (ne sono stati inseriti {length}).',
    maxLength:'Inserire al massimo {maxLength} caratteri (ne sono stati inseriti {length}).',
    integer:'Inserire un numero intero. Non sono consentiti decimali (es.: 1.25).',
    numeric:'Inserire solo valori numerici (es.: "1" oppure "1.1" oppure "-1" oppure "-1.1").',
    digits:'Inserire solo numeri e caratteri di punteggiatura. Per esempio &egrave; consentito un numero telefonico con trattini o punti.',
    alpha:'Inserire solo lettere (a-z). Non sono consentiti spazi o altri caratteri.',
    alphanum:'Inserire solo lettere (a-z) o numeri (0-9). Non sono consentiti spazi o altri caratteri.',
    dateSuchAs:'Inserire una data valida del tipo {date}',
    dateInFormatMDY:'Inserire una data valida nel formato MM/GG/AAAA (es.: "12/31/1999")',
    email:'Inserire un indirizzo email valido. Per esempio "nome@dominio.com".',
    url:'Inserire un indirizzo valido. Per esempio "http://www.dominio.com".',
    currencyDollar:'Inserire un importo valido. Per esempio "$100.00".',
    oneRequired:'Completare almeno uno dei campi richiesti.',
    errorPrefix: 'Errore: ',
    warningPrefix: 'Attenzione: ',

    //Form.Validator.Extras

    noSpace: 'Non sono consentiti spazi.',
    reqChkByNode: 'Nessuna voce selezionata.',
    requiredChk: 'Il campo &egrave; obbligatorio.',
    reqChkByName: 'Selezionare un(a) {label}.',
    match: 'Il valore deve corrispondere al campo {matchName}',
    startDate: 'data d\'inizio',
    endDate: 'data di fine',
    currendDate: 'data attuale',
    afterDate: 'La data deve corrispondere o essere successiva al {label}.',
    beforeDate: 'La data deve corrispondere o essere precedente al {label}.',
    startMonth: 'Selezionare un mese d\'inizio',
    sameMonth: 'Le due date devono essere dello stesso mese - occorre modificarne una.'

});/*
---

script: Form.Validator.Norwegian.js

description: Form.Validator messages in Norwegian.

license: MIT-style license

authors:
- Espen 'Rexxars' Hovlandsdal

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Norwegian]

...
*/

MooTools.lang.set('no-NO', 'Form.Validator', {
   required:'Dette feltet er pÃ¥krevd.',
   minLength:'Vennligst skriv inn minst {minLength} tegn (du skrev {length} tegn).',
   maxLength:'Vennligst skriv inn maksimalt {maxLength} tegn (du skrev {length} tegn).',
   integer:'Vennligst skriv inn et tall i dette feltet. Tall med desimaler (for eksempel 1,25) er ikke tillat.',
   numeric:'Vennligst skriv inn kun numeriske verdier i dette feltet (for eksempel "1", "1.1", "-1" eller "-1.1").',
   digits:'Vennligst bruk kun nummer og skilletegn i dette feltet.',
   alpha:'Vennligst bruk kun bokstaver (a-z) i dette feltet. Ingen mellomrom eller andre tegn er tillat.',
   alphanum:'Vennligst bruk kun bokstaver (a-z) eller nummer (0-9) i dette feltet. Ingen mellomrom eller andre tegn er tillat.',
   dateSuchAs:'Vennligst skriv inn en gyldig dato, som {date}',
   dateInFormatMDY:'Vennligst skriv inn en gyldig dato, i formatet MM/DD/YYYY (for eksempel "12/31/1999")',
   email:'Vennligst skriv inn en gyldig epost-adresse. For eksempel "espen@domene.no".',
   url:'Vennligst skriv inn en gyldig URL, for eksempel http://www.google.no.',
   currencyDollar:'Vennligst fyll ut et gyldig $ belÃ¸p. For eksempel $100.00 .',
   oneRequired:'Vennligst fyll ut noe i minst ett av disse feltene.',
   errorPrefix: 'Feil: ',
   warningPrefix: 'Advarsel: '
});/*
---

script: Form.Validator.Polish.js

description: Date messages for Polish.

license: MIT-style license

authors:
- Oskar Krawczyk

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Polish]

...
*/

MooTools.lang.set('pl-PL', 'Form.Validator', {

    required:'To pole jest wymagane.',
    minLength:'Wymagane jest przynajmniej {minLenght} znaków (wpisanych zostało tylko {length}).',
    maxLength:'Dozwolone jest nie więcej niż {maxLenght} znaków (wpisanych zostało {length})',
    integer:'To pole wymaga liczb całych. Liczby dziesiętne (np. 1.25) są niedozwolone.',
    numeric:'Prosimy używać tylko numerycznych wartości w tym polu (np. "1", "1.1", "-1" lub "-1.1").',
    digits:'Prosimy używać liczb oraz zankow punktuacyjnych w typ polu (dla przykładu, przy numerze telefonu myślniki i kropki są dozwolone).',
    alpha:'Prosimy używać tylko liter (a-z) w tym polu. Spacje oraz inne znaki są niedozwolone.',
    alphanum:'Prosimy używać tylko liter (a-z) lub liczb (0-9) w tym polu. Spacje oraz inne znaki są niedozwolone.',
    dateSuchAs:'Prosimy podać prawidłową datę w formacie: {date}',
    dateInFormatMDY:'Prosimy podać poprawną date w formacie DD.MM.RRRR (i.e. "12.01.2009")',
    email:'Prosimy podać prawidłowy adres e-mail, np. "jan@domena.pl".',
    url:'Prosimy podać prawidłowy adres URL, np. http://www.google.pl.',
    currencyDollar:'Prosimy podać prawidłową sumę w PLN. Dla przykładu: 100.00 PLN.',
    oneRequired:'Prosimy wypełnić chociaż jedno z pól.',
    errorPrefix: 'Błąd: ',
    warningPrefix: 'Uwaga: ',

    //Form.Validator.Extras

    noSpace: 'W tym polu nie mogą znajdować się spacje.',
    reqChkByNode: 'Brak zaznaczonych elementów.',
    requiredChk: 'To pole jest wymagane.',
    reqChkByName: 'Prosimy wybrać z {label}.',
    match: 'To pole musi być takie samo jak {matchName}',
    startDate: 'data początkowa',
    endDate: 'data końcowa',
    currendDate: 'aktualna data',
    afterDate: 'Podana data poinna być taka sama lub po {label}.',
    beforeDate: 'Podana data poinna być taka sama lub przed {label}.',
    startMonth: 'Prosimy wybrać początkowy miesiąc.',
    sameMonth: 'Te dwie daty muszą być w zakresie tego samego miesiąca - wymagana jest zmiana któregoś z pól.'

});/*
---

script: Form.Validator.Portuguese.js

description: Form.Validator messages in Portuguese.

license: MIT-style license

authors:
- Miquel Hudin

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Portuguese]

...
*/

MooTools.lang.set('pt-PT', 'Form.Validator', {
    required:'Este campo é necessário.',
    minLength:'Digite pelo menos{minLength} caracteres (comprimento {length} caracteres).',
    maxLength:'Não insira mais de {maxLength} caracteres (comprimento {length} caracteres).',
    integer:'Digite um número inteiro neste domínio. Com números decimais (por exemplo, 1,25), não são permitidas.',
    numeric:'Digite apenas valores numéricos neste domínio (p.ex., "1" ou "1.1" ou "-1" ou "-1,1").',
    digits:'Por favor, use números e pontuação apenas neste campo (p.ex., um número de telefone com traços ou pontos é permitida).',
    alpha:'Por favor use somente letras (a-z), com nesta área. Não utilize espaços nem outros caracteres são permitidos.',
    alphanum:'Use somente letras (a-z) ou números (0-9) neste campo. Não utilize espaços nem outros caracteres são permitidos.',
    dateSuchAs:'Digite uma data válida, como {date}',
    dateInFormatMDY:'Digite uma data válida, como DD/MM/YYYY (p.ex. "31/12/1999")',
    email:'Digite um endereço de email válido. Por exemplo "fred@domain.com".',
    url:'Digite uma URL válida, como http://www.google.com.',
    currencyDollar:'Digite um valor válido $. Por exemplo $ 100,00. ',
    oneRequired:'Digite algo para pelo menos um desses insumos.',
    errorPrefix: 'Erro: ',
    warningPrefix: 'Aviso: '

}).set('pt-PT', 'Date', {
    dateOrder: ['date', 'month', 'year', '/']
});/*
---

script: Form.Validator.Portuguese.BR.js

description: Form.Validator messages in Portuguese-BR.

license: MIT-style license

authors:
- Fábio Miranda Costa

requires:
- /Lang
- /Form.Validator.Portuguese

provides: [Form.Validator.Portuguese.BR]

...
*/

MooTools.lang.set('pt-BR', 'Form.Validator', {

    required: 'Este campo é obrigatório.',
    minLength: 'Digite pelo menos {minLength} caracteres (tamanho atual: {length}).',
    maxLength: 'Não digite mais de {maxLength} caracteres (tamanho atual: {length}).',
    integer: 'Por favor digite apenas um número inteiro neste campo. Não são permitidos números decimais (por exemplo, 1,25).',
    numeric: 'Por favor digite apenas valores numéricos neste campo (por exemplo, "1" ou "1.1" ou "-1" ou "-1,1").',
    digits: 'Por favor use apenas números e pontuação neste campo (por exemplo, um número de telefone com traços ou pontos é permitido).',
    alpha: 'Por favor use somente letras (a-z). Espaço e outros caracteres não são permitidos.',
    alphanum: 'Use somente letras (a-z) ou números (0-9) neste campo. Espaço e outros caracteres não são permitidos.',
    dateSuchAs: 'Digite uma data válida, como {date}',
    dateInFormatMDY: 'Digite uma data válida, como DD/MM/YYYY (por exemplo, "31/12/1999")',
    email: 'Digite um endereço de email válido. Por exemplo "nome@dominio.com".',
    url: 'Digite uma URL válida. Exemplo: http://www.google.com.',
    currencyDollar: 'Digite um valor em dinheiro válido. Exemplo: R$100,00 .',
    oneRequired: 'Digite algo para pelo menos um desses campos.',
    errorPrefix: 'Erro: ',
    warningPrefix: 'Aviso: ',

    //Form.Validator.Extras

    noSpace: 'Não é possível digitar espaços neste campo.',
    reqChkByNode: 'Não foi selecionado nenhum item.',
    requiredChk: 'Este campo é obrigatório.',
    reqChkByName: 'Por favor digite um {label}.',
    match: 'Este campo deve ser igual ao campo {matchName}.',
    startDate: 'a data inicial',
    endDate: 'a data final',
    currendDate: 'a data atual',
    afterDate: 'A data deve ser igual ou posterior a {label}.',
    beforeDate: 'A data deve ser igual ou anterior a {label}.',
    startMonth: 'Por favor selecione uma data inicial.',
    sameMonth: 'Estas duas datas devem ter o mesmo mês - você deve modificar uma das duas.',
    creditcard: 'O número do cartão de crédito informado é inválido. Por favor verifique o valor e tente novamente. {length} números informados.'

});/*
---

script: Form.Validator.Russian.js

description: Form.Validator messages in Russian (utf-8 and cp1251).

license: MIT-style license

authors:
- Chernodarov Egor

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Russian]

...
*/

MooTools.lang.set('ru-RU-unicode', 'Form.Validator', {
    required:'Это поле обязательно к заполнению.',
    minLength:'Пожалуйста, введите хотя бы {minLength} символов (Вы ввели {length}).',
    maxLength:'Пожалуйста, введите не больше {maxLength} символов (Вы ввели {length}).',
    integer:'Пожалуйста, введите в это поле число. Дробные числа (например 1.25) тут не разрешены.',
    numeric:'Пожалуйста, введите в это поле число (например "1" или "1.1", или "-1", или "-1.1").',
    digits:'В этом поле Вы можете использовать только цифры и знаки пунктуации (например, телефонный номер со знаками дефиса или с точками).',
    alpha:'В этом поле можно использовать только латинские буквы (a-z). Пробелы и другие символы запрещены.',
    alphanum:'В этом поле можно использовать только латинские буквы (a-z) и цифры (0-9). Пробелы и другие символы запрещены.',
    dateSuchAs:'Пожалуйста, введите корректную дату {date}',
    dateInFormatMDY:'Пожалуйста, введите дату в формате ММ/ДД/ГГГГ (например "12/31/1999")',
    email:'Пожалуйста, введите корректный емейл-адрес. Для примера "fred@domain.com".',
    url:'Пожалуйста, введите правильную ссылку вида http://www.google.com.',
    currencyDollar:'Пожалуйста, введите сумму в долларах. Например: $100.00 .',
    oneRequired:'Пожалуйста, выберите хоть что-нибудь в одном из этих полей.',
    errorPrefix: 'Ошибка: ',
    warningPrefix: 'Внимание: '
});

//translation in windows-1251 codepage
MooTools.lang.set('ru-RU', 'Form.Validator', {
    required:'Ýòî ïîëå îáÿçàòåëüíî ê çàïîëíåíèþ.',
    minLength:'Ïîæàëóéñòà, ââåäèòå õîòÿ áû {minLength} ñèìâîëîâ (Âû ââåëè {length}).',
    maxLength:'Ïîæàëóéñòà, ââåäèòå íå áîëüøå {maxLength} ñèìâîëîâ (Âû ââåëè {length}).',
    integer:'Ïîæàëóéñòà, ââåäèòå â ýòî ïîëå ÷èñëî. Äðîáíûå ÷èñëà (íàïðèìåð 1.25) òóò íå ðàçðåøåíû.',
    numeric:'Ïîæàëóéñòà, ââåäèòå â ýòî ïîëå ÷èñëî (íàïðèìåð "1" èëè "1.1", èëè "-1", èëè "-1.1").',
    digits:'Â ýòîì ïîëå Âû ìîæåòå èñïîëüçîâàòü òîëüêî öèôðû è çíàêè ïóíêòóàöèè (íàïðèìåð, òåëåôîííûé íîìåð ñî çíàêàìè äåôèñà èëè ñ òî÷êàìè).',
    alpha:'Â ýòîì ïîëå ìîæíî èñïîëüçîâàòü òîëüêî ëàòèíñêèå áóêâû (a-z). Ïðîáåëû è äðóãèå ñèìâîëû çàïðåùåíû.',
    alphanum:'Â ýòîì ïîëå ìîæíî èñïîëüçîâàòü òîëüêî ëàòèíñêèå áóêâû (a-z) è öèôðû (0-9). Ïðîáåëû è äðóãèå ñèìâîëû çàïðåùåíû.',
    dateSuchAs:'Ïîæàëóéñòà, ââåäèòå êîððåêòíóþ äàòó {date}',
    dateInFormatMDY:'Ïîæàëóéñòà, ââåäèòå äàòó â ôîðìàòå ÌÌ/ÄÄ/ÃÃÃÃ (íàïðèìåð "12/31/1999")',
    email:'Ïîæàëóéñòà, ââåäèòå êîððåêòíûé åìåéë-àäðåñ. Äëÿ ïðèìåðà "fred@domain.com".',
    url:'Ïîæàëóéñòà, ââåäèòå ïðàâèëüíóþ ññûëêó âèäà http://www.google.com.',
    currencyDollar:'Ïîæàëóéñòà, ââåäèòå ñóììó â äîëëàðàõ. Íàïðèìåð: $100.00 .',
    oneRequired:'Ïîæàëóéñòà, âûáåðèòå õîòü ÷òî-íèáóäü â îäíîì èç ýòèõ ïîëåé.',
    errorPrefix: 'Îøèáêà: ',
    warningPrefix: 'Âíèìàíèå: '
});/*
---

script: Form.Validator.Spanish.js

description: Date messages for Spanish.

license: MIT-style license

authors:
- Ãlfons Sanchez

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Spanish]

...
*/

MooTools.lang.set('es-ES', 'Form.Validator', {

    required:'Este campo es obligatorio.',
    minLength:'Por favor introduce al menos {minLength} caracteres (has introducido {length} caracteres).',
    maxLength:'Por favor introduce no mas de {maxLength} caracteres (has introducido {length} caracteres).',
    integer:'Por favor introduce un numero entero en este campo. Numeros con decimales (p.e. 1,25) no se permiten.',
    numeric:'Por favor introduce solo valores numericos en este campo (p.e. "1" o "1,1" o "-1" o "-1,1").',
    digits:'Por favor usa solo numeros y puntuacion en este campo (por ejemplo, un numero de telefono con guines y puntos no esta permitido).',
    alpha:'Por favor usa letras solo (a-z) en este campo. No se admiten espacios ni otros caracteres.',
    alphanum:'Por favor, usa solo letras (a-z) o numeros (0-9) en este campo. No se admiten espacios ni otros caracteres.',
    dateSuchAs:'Por favor introduce una fecha valida como {date}',
    dateInFormatMDY:'Por favor introduce una fecha valida como DD/MM/YYYY (p.e. "31/12/1999")',
    email:'Por favor, introduce una direccione de email valida. Por ejemplo,  "fred@domain.com".',
    url:'Por favor introduce una URL valida como http://www.google.com.',
    currencyDollar:'Por favor introduce una cantidad valida de €. Por ejemplo €100,00 .',
    oneRequired:'Por favor introduce algo para por lo menos una de estas entradas.',
    errorPrefix: 'Error: ',
    warningPrefix: 'Aviso: ',

    //Form.Validator.Extras

    noSpace: 'No pueden haber espacios en esta entrada.',
    reqChkByNode: 'No hay elementos seleccionados.',
    requiredChk: 'Este campo es obligatorio.',
    reqChkByName: 'Por favor selecciona una {label}.',
    match: 'Este campo necesita coincidir con el campo {matchName}',
    startDate: 'la fecha de inicio',
    endDate: 'la fecha de fin',
    currendDate: 'la fecha actual',
    afterDate: 'La fecha debe ser igual o posterior a {label}.',
    beforeDate: 'La fecha debe ser igual o anterior a {label}.',
    startMonth: 'Por favor selecciona un mes de origen',
    sameMonth: 'Estas dos fechas deben estar en el mismo mes - debes cambiar una u otra.'

});/*
---

script: Form.Validator.Swedish.js

description: Date messages for Swedish.

license: MIT-style license

authors:
- Martin Lundgren

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Swedish]

...
*/

MooTools.lang.set('sv-SE', 'Form.Validator', {

    required:'Fältet är obligatoriskt.',
    minLength:'Ange minst {minLength} tecken (du angav {length} tecken).',
    maxLength:'Ange högst {maxLength} tecken (du angav {length} tecken). ',
    integer:'Ange ett heltal i fältet. Tal med decimaler (t.ex. 1,25) är inte tillåtna.',
    numeric:'Ange endast numeriska värden i detta fält (t.ex. "1" eller "1.1" eller "-1" eller "-1,1").',
    digits:'Använd endast siffror och skiljetecken i detta fält (till exempel ett telefonnummer med bindestreck tillåtet).',
    alpha:'Använd endast bokstäver (a-ö) i detta fält. Inga mellanslag eller andra tecken är tillåtna.',
    alphanum:'Använd endast bokstäver (a-ö) och siffror (0-9) i detta fält. Inga mellanslag eller andra tecken är tillåtna.',
    dateSuchAs:'Ange ett giltigt datum som t.ex. {date}',
    dateInFormatMDY:'Ange ett giltigt datum som t.ex. YYYY-MM-DD (i.e. "1999-12-31")',
    email:'Ange en giltig e-postadress. Till exempel "erik@domain.com".',
    url:'Ange en giltig webbadress som http://www.google.com.',
    currencyDollar:'Ange en giltig belopp. Exempelvis 100,00.',
    oneRequired:'Vänligen ange minst ett av dessa alternativ.',
    errorPrefix: 'Fel: ',
    warningPrefix: 'Varning: ',

    //Form.Validator.Extras

    noSpace: 'Det får inte finnas några mellanslag i detta fält.',
    reqChkByNode: 'Inga objekt är valda.',
    requiredChk: 'Detta är ett obligatoriskt fält.',
    reqChkByName: 'Välj en {label}.',
    match: 'Detta fält måste matcha {matchName}',
    startDate: 'startdatumet',
    endDate: 'slutdatum',
    currendDate: 'dagens datum',
    afterDate: 'Datumet bör vara samma eller senare än {label}.',
    beforeDate: 'Datumet bör vara samma eller tidigare än {label}.',
    startMonth: 'Välj en start månad',
    sameMonth: 'Dessa två datum måste vara i samma månad - du måste ändra det ena eller det andra.'

});/*
---

script: Form.Validator.Ukrainian.js

description: Form.Validator messages in Ukrainian (utf-8).

license: MIT-style license

authors:
- Slik

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Ukrainian]

...
*/

MooTools.lang.set('uk-UA', 'Form.Validator', {
    required:'Це поле повинне бути заповненим.',
    minLength:'Введіть хоча б {minLength} символів (Ви ввели {length}).',
    maxLength:'Кількість символів не може бути більше {maxLength} (Ви ввели {length}).',
    integer:'Введіть в це поле число. Дробові числа (наприклад 1.25) не дозволені.',
    numeric:'Введіть в це поле число (наприклад "1" або "1.1", або "-1", або "-1.1").',
    digits:'В цьому полі ви можете використовувати лише цифри і знаки пунктіації (наприклад, телефонний номер з знаками дефізу або з крапками).',
    alpha:'В цьому полі можна використовувати лише латинські літери (a-z). Пробіли і інші символи заборонені.',
    alphanum:'В цьому полі можна використовувати лише латинські літери (a-z) і цифри (0-9). Пробіли і інші символи заборонені.',
    dateSuchAs:'Введіть коректну дату {date}.',
    dateInFormatMDY:'Введіть дату в форматі ММ/ДД/РРРР (наприклад "12/31/2009").',
    email:'Введіть коректну адресу електронної пошти (наприклад "name@domain.com").',
    url:'Введіть коректне інтернет-посилання (наприклад http://www.google.com).',
    currencyDollar:'Введіть суму в доларах (наприклад "$100.00").',
    oneRequired:'Заповніть одне з полів.',
    errorPrefix: 'Помилка: ',
    warningPrefix: 'Увага: '
});
/*
Script: Clientcide.js
    The Clientcide namespace.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
var Clientcide = {
    version: '%build%',
    assetLocation: "http://github.com/anutron/clientcide/raw/master/Assets",
    setAssetLocation: function(baseHref) {
        Clientcide.assetLocation = baseHref;
        if (Clientcide.preloaded) Clientcide.preLoadCss();
    },
    preLoadCss: function(){
        if (window.StickyWin && StickyWin.ui) StickyWin.ui();
        if (window.StickyWin && StickyWin.pointy) StickyWin.pointy();
        Clientcide.preloaded = true;
        return true;
    },
    preloaded: false
};
(function(){
    if (!window.addEvent) return;
    var preload = function(){
        if (window.dbug) dbug.log('preloading clientcide css');
        if (!Clientcide.preloaded) Clientcide.preLoadCss();
    };
    window.addEvent('domready', preload);
    window.addEvent('load', preload);
})();
setCNETAssetBaseHref = Clientcide.setAssetLocation;/*
Script: ToElement.js
    Defines the toElement method for a class.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
Class.ToElement = new Class({
    toElement: function(){
        return this.element;
    }
});
var ToElement = Class.ToElement;/*
Script: dbug.js
    A wrapper for Firebug console.* statements.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
var dbug = {
    logged: [],    
    timers: {},
    firebug: false, 
    enabled: false, 
    log: function() {
        dbug.logged.push(arguments);
    },
    nolog: function(msg) {
        dbug.logged.push(arguments);
    },
    time: function(name){
        dbug.timers[name] = new Date().getTime();
    },
    timeEnd: function(name){
        if (dbug.timers[name]) {
            var end = new Date().getTime() - dbug.timers[name];
            dbug.timers[name] = false;
            dbug.log('%s: %s', name, end);
        } else dbug.log('no such timer: %s', name);
    },
    enable: function(silent) { 
        var con = window.firebug ? firebug.d.console.cmd : window.console;

        if((!!window.console && !!window.console.warn) || window.firebug) {
            try {
                dbug.enabled = true;
                dbug.log = function(){
                        try {
                            (con.debug || con.log).apply(con, arguments);
                        } catch(e) {
                            console.log(Array.slice(arguments));
                        }
                };
                dbug.time = function(){
                    con.time.apply(con, arguments);
                };
                dbug.timeEnd = function(){
                    con.timeEnd.apply(con, arguments);
                };
                if(!silent) dbug.log('enabling dbug');
                for(var i=0;i<dbug.logged.length;i++){ dbug.log.apply(con, dbug.logged[i]); }
                dbug.logged=[];
            } catch(e) {
                dbug.enable.delay(400);
            }
        }
    },
    disable: function(){ 
        if(dbug.firebug) dbug.enabled = false;
        dbug.log = dbug.nolog;
        dbug.time = function(){};
        dbug.timeEnd = function(){};
    },
    cookie: function(set){
        var value = document.cookie.match('(?:^|;)\\s*jsdebug=([^;]*)');
        var debugCookie = value ? unescape(value[1]) : false;
        if((!$defined(set) && debugCookie != 'true') || ($defined(set) && set)) {
            dbug.enable();
            dbug.log('setting debugging cookie');
            var date = new Date();
            date.setTime(date.getTime()+(24*60*60*1000));
            document.cookie = 'jsdebug=true;expires='+date.toGMTString()+';path=/;';
        } else dbug.disableCookie();
    },
    disableCookie: function(){
        dbug.log('disabling debugging cookie');
        document.cookie = 'jsdebug=false;path=/;';
    }
};

(function(){
    var fb = !!window.console || !!window.firebug;
    var con = window.firebug ? window.firebug.d.console.cmd : window.console;
    var debugMethods = ['debug','info','warn','error','assert','dir','dirxml'];
    var otherMethods = ['trace','group','groupEnd','profile','profileEnd','count'];
    function set(methodList, defaultFunction) {
        for(var i = 0; i < methodList.length; i++){
            dbug[methodList[i]] = (fb && con[methodList[i]])?con[methodList[i]]:defaultFunction;
        }
    };
    set(debugMethods, dbug.log);
    set(otherMethods, function(){});
})();
if ((!!window.console && !!window.console.warn) || window.firebug){
    dbug.firebug = true;
    var value = document.cookie.match('(?:^|;)\\s*jsdebug=([^;]*)');
    var debugCookie = value ? unescape(value[1]) : false;
    if(window.location.href.indexOf("jsdebug=true")>0 || debugCookie=='true') dbug.enable();
    if(debugCookie=='true')dbug.log('debugging cookie enabled');
    if(window.location.href.indexOf("jsdebugCookie=true")>0){
        dbug.cookie();
        if(!dbug.enabled)dbug.enable();
    }
    if(window.location.href.indexOf("jsdebugCookie=false")>0)dbug.disableCookie();
}/*
Script: StyleWriter.js

Provides a simple method for injecting a css style element into the DOM if it's not already present.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/

var StyleWriter = new Class({
    createStyle: function(css, id) {
        window.addEvent('domready', function(){
            try {
                if (document.id(id) && id) return;
                var style = new Element('style', {id: id||''}).inject($$('head')[0]);
                if (Browser.Engine.trident) style.styleSheet.cssText = css;
                else style.set('text', css);
            }catch(e){dbug.log('error: %s',e);}
        }.bind(this));
    }
});/*
Script: StickyWin.js

Creates a div within the page with the specified contents at the location relative to the element you specify; basically an in-page popup maker.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/


var StickyWin = new Class({
    Binds: ['destroy', 'hide', 'togglepin', 'esc'],
    Implements: [Options, Events, StyleWriter, Class.ToElement],
    options: {
//        onDisplay: $empty,
//        onClose: $empty,
//        onDestroy: $empty,
        closeClassName: 'closeSticky',
        pinClassName: 'pinSticky',
        content: '',
        zIndex: 10000,
        className: '',
//        id: ... set above in initialize function
/*      these are the defaults for Element.position anyway
        ************************************************
        edge: false, //see Element.position
        position: 'center', //center, corner == upperLeft, upperRight, bottomLeft, bottomRight
        offset: {x:0,y:0},
        relativeTo: document.body, */
        width: false,
        height: false,
        timeout: -1,
        allowMultipleByClass: true,
        allowMultiple: true,
        showNow: true,
        useIframeShim: true,
        iframeShimSelector: '',
        destroyOnClose: false,
        closeOnClickOut: false,
        closeOnEsc: false,
        getWindowManager: function(){ return StickyWin.WM; }
    },

    css: '.SWclearfix:after {content: "."; display: block; height: 0; clear: both; visibility: hidden;}'+
         '.SWclearfix {display: inline-table;} * html .SWclearfix {height: 1%;} .SWclearfix {display: block;}',
    
    initialize: function(options){
        this.options.inject = this.options.inject || {
            target: document.body,
            where: 'bottom'
        };
        this.setOptions(options);
        this.windowManager = this.options.getWindowManager();
        this.id = this.options.id || 'StickyWin_'+new Date().getTime();
        this.makeWindow();
        if (this.windowManager) this.windowManager.add(this);

        if (this.options.content) this.setContent(this.options.content);
        if (this.options.timeout > 0) {
            this.addEvent('onDisplay', function(){
                this.hide.delay(this.options.timeout, this);
            }.bind(this));
        }
        //add css for clearfix
        this.createStyle(this.css, 'StickyWinClearFix');
        if (this.options.closeOnClickOut || this.options.closeOnEsc) this.attach();
        if (this.options.destroyOnClose) this.addEvent('close', this.destroy);
        if (this.options.showNow) this.show();
    },
    attach: function(attach){
        var method = $pick(attach, true) ? 'addEvents' : 'removeEvents';
        var events = {};
        if (this.options.closeOnClickOut) events.click = this.esc;
        if (this.options.closeOnEsc) events.keyup = this.esc;
        document[method](events);
    },
    esc: function(e) {
        if (e.key == "esc") this.hide();
        if (e.type == "click" && this.element != e.target && !this.element.hasChild(e.target)) this.hide();
    },
    makeWindow: function(){
        this.destroyOthers();
        if (!document.id(this.id)) {
            this.win = new Element('div', {
                id:        this.id
            }).addClass(this.options.className).addClass('StickyWinInstance').addClass('SWclearfix').setStyles({
                 display:'none',
                position:'absolute',
                zIndex:this.options.zIndex
            }).inject(this.options.inject.target, this.options.inject.where).store('StickyWin', this);            
        } else this.win = document.id(this.id);
        this.element = this.win;
        if (this.options.width && $type(this.options.width.toInt())=="number") this.win.setStyle('width', this.options.width.toInt());
        if (this.options.height && $type(this.options.height.toInt())=="number") this.win.setStyle('height', this.options.height.toInt());
        return this;
    },
    show: function(suppressEvent){
        this.showWin();
        if (!suppressEvent) this.fireEvent('display');
        if (this.options.useIframeShim) this.showIframeShim();
        this.visible = true;
        return this;
    },
    showWin: function(){
        if (this.windowManager) this.windowManager.focus(this);
        if (!this.positioned) this.position();
        this.win.show();
    },
    hide: function(suppressEvent){
        if ($type(suppressEvent) == "event" || !suppressEvent) this.fireEvent('close');
        this.hideWin();
        if (this.options.useIframeShim) this.hideIframeShim();
        this.visible = false;
        return this;
    },
    hideWin: function(){
        this.win.setStyle('display','none');
    },
    destroyOthers: function() {
        if (!this.options.allowMultipleByClass || !this.options.allowMultiple) {
            $$('div.StickyWinInstance').each(function(sw) {
                if (!this.options.allowMultiple || (!this.options.allowMultipleByClass && sw.hasClass(this.options.className))) 
                    sw.retrieve('StickyWin').destroy();
            }, this);
        }
    },
    setContent: function(html) {
        if (this.win.getChildren().length>0) this.win.empty();
        if ($type(html) == "string") this.win.set('html', html);
        else if (document.id(html)) this.win.adopt(html);
        this.win.getElements('.'+this.options.closeClassName).each(function(el){
            el.addEvent('click', this.hide);
        }, this);
        this.win.getElements('.'+this.options.pinClassName).each(function(el){
            el.addEvent('click', this.togglepin);
        }, this);
        return this;
    },
    position: function(options){
        this.positioned = true;
        this.setOptions(options);
        this.win.position({
            allowNegative: $pick(this.options.allowNegative, this.options.relativeTo != document.body),
            relativeTo: this.options.relativeTo,
            position: this.options.position,
            offset: this.options.offset,
            edge: this.options.edge
        });
        if (this.shim) this.shim.position();
        return this;
    },
    pin: function(pin) {
        if (!this.win.pin) {
            dbug.log('you must include element.pin.js!');
            return this;
        }
        this.pinned = $pick(pin, true);
        this.win.pin(pin);
        return this;
    },
    unpin: function(){
        return this.pin(false);
    },
    togglepin: function(){
        return this.pin(!this.pinned);
    },
    makeIframeShim: function(){
        if (!this.shim){
            var el = (this.options.iframeShimSelector)?this.win.getElement(this.options.iframeShimSelector):this.win;
            this.shim = new IframeShim(el, {
                display: false,
                name: 'StickyWinShim'
            });
        }
    },
    showIframeShim: function(){
        if (this.options.useIframeShim) {
            this.makeIframeShim();
            this.shim.show();
        }
    },
    hideIframeShim: function(){
        if (this.shim) this.shim.hide();
    },
    destroy: function(){
        if (this.windowManager) this.windowManager.remove(this);
        if (this.win) this.win.destroy();
        if (this.options.useIframeShim && this.shim) this.shim.destroy();
        if (document.id('modalOverlay')) document.id('modalOverlay').destroy();
        this.fireEvent('destroy');
    }
});

StickyWin.Stacker = new Class({
    Implements: [Options, Events],
    Binds: ['click'],
    instances: [],
    options: {
        zIndexBase: 9000
    },
    initialize: function(options) {
        this.setOptions(options);
        this.zIndex = this.options.zIndex;
    },
    add: function(sw) {
        this.instances.include(sw);
        $(sw).addEvent('mousedown', this.click);
    },
    click: function(e) {
        this.instances.each(function(sw){
            var el = $(sw);
            if (el == e.target || el.hasChild($(e.target))) this.focus(sw);
        }, this);
    },
    focus: function(instance){
        if (this.focused == instance) return;
        this.focused = instance;
        if (instance) this.instances.erase(instance).push(instance);
        this.instances.each(function(current, i){
            $(current).setStyle('z-index', this.options.zIndexBase + i);
        }, this);
        this.focused = instance;
    },
    remove: function(sw) {
        this.instances.erase(sw);
        $(sw).removeEvent('click', this.click);
    }
});
StickyWin.WM = new StickyWin.Stacker();/*
Script: StickyWin.Fx.js

    Extends StickyWin to create popups that fade in and out.

    License:
        MIT-style license.

    Authors:
        Aaron Newton
*/

/*
Script: StickyWin.Fx.js

Extends StickyWin to create popups that fade in and out and can be dragged and resized (requires StickyWin.Fx.Drag.js).

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin = Class.refactor(StickyWin, {
    options: {
        //fadeTransition: 'sine:in:out',
        fade: true,
        fadeDuration: 150
    },
    hideWin: function(){
        if (this.options.fade) this.fade(0);
        else this.previous();
    },
    showWin: function(){
        if (this.options.fade) this.fade(1);
        else this.previous();
    },
    hide: function(){
        this.previous(this.options.fade);
    },
    show: function(){
        this.previous(this.options.fade);
    },
    fade: function(to){
        if (!this.fadeFx) {
            this.win.setStyles({
                opacity: 0,
                display: 'block'
            });
            var opts = {
                property: 'opacity',
                duration: this.options.fadeDuration
            };
            if (this.options.fadeTransition) opts.transition = this.options.fadeTransition;
            this.fadeFx = new Fx.Tween(this.win, opts);
        }
        if (to > 0) {
            this.win.setStyle('display','block');
            this.position();
        }
        this.fadeFx.clearChain();
        this.fadeFx.start(to).chain(function (){
            if (to == 0) {
                this.win.setStyle('display', 'none');
                this.fireEvent('onClose');
            } else {
                this.fireEvent('onDisplay');
            }
        }.bind(this));
        return this;
    }
});
StickyWin.Fx = StickyWin;/*
Script: StickyWin.Modal.js

This script extends StickyWin and StickyWin.Fx classes to add Mask functionality.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.Modal = new Class({

    Extends: StickyWin,

    options: {
        modalize: true,
        maskOptions: {
            style: {
                'background-color':'#333',
                opacity:0.8
            }
        },
        hideOnClick: true,
        getWindowManager: function(){ return StickyWin.ModalWM; }
    },

    initialize: function(options) {
        this.options.maskTarget = this.options.maskTarget || document.body;
        this.setOptions(options);
        this.mask = new Mask(this.options.maskTarget, this.options.maskOptions).addEvent('click', function() {
            if (this.options.hideOnClick) this.hide();
        }.bind(this));
        this.parent(options);
    },

    show: function(showModal){
        if ($pick(showModal, this.options.modalize)) this.mask.show();
        this.parent();
    },

    hide: function(hideModal){
        if ($pick(hideModal, true)) this.mask.hide();
        this.parent();
    }

});

StickyWin.ModalWM = new StickyWin.Stacker({
    zIndexBase: 11000
});
if (StickyWin.Fx) StickyWin.Fx.Modal = StickyWin.Modal; /*
Script: StickyWin.ui.js

Creates an html holder for in-page popups using a default style.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.UI = new Class({
    Implements: [Options, Class.ToElement, StyleWriter],
    options: {
        width: 300,
        css: "div.DefaultStickyWin {font-family:verdana; font-size:11px; line-height: 13px;position: relative;}"+
            "div.DefaultStickyWin div.top{-moz-user-select: none;-khtml-user-select: none;}"+
            "div.DefaultStickyWin div.top_ul{background:url({%baseHref%}full.png) top left no-repeat; height:30px; width:15px; float:left}"+
            "div.DefaultStickyWin div.top_ur{position:relative; left:0px !important; left:-4px; background:url({%baseHref%}full.png) top right !important; height:30px; margin:0px 0px 0px 15px !important; margin-right:-4px; padding:0px}"+
            "div.DefaultStickyWin h1.caption{clear: none !important; margin:0px !important; overflow: hidden; padding:0 !important; font-weight:bold; color:#555; font-size:14px !important; position:relative; top:8px !important; left:5px !important; float: left; height: 22px !important;}"+
            "div.DefaultStickyWin div.middle, div.DefaultStickyWin div.closeBody {background:url({%baseHref%}body.png) top left repeat-y; margin:0px 20px 0px 0px !important;    margin-bottom: -3px; position: relative;    top: 0px !important; top: -3px;}"+
            "div.DefaultStickyWin div.body{background:url({%baseHref%}body.png) top right repeat-y; padding:8px 23px 8px 0px !important; margin-left:5px !important; position:relative; right:-20px !important; z-index: 1;}"+
            "div.DefaultStickyWin div.bottom{clear:both;}"+
            "div.DefaultStickyWin div.bottom_ll{background:url({%baseHref%}full.png) bottom left no-repeat; width:15px; height:15px; float:left}"+
            "div.DefaultStickyWin div.bottom_lr{background:url({%baseHref%}full.png) bottom right; position:relative; left:0px !important; left:-4px; margin:0px 0px 0px 15px !important; margin-right:-4px; height:15px}"+
            "div.DefaultStickyWin div.closeButtons{text-align: center; background:url({%baseHref%}body.png) top right repeat-y; padding: 4px 30px 8px 0px; margin-left:5px; position:relative; right:-20px}"+
            "div.DefaultStickyWin a.button:hover{background:url({%baseHref%}big_button_over.gif) repeat-x}"+
            "div.DefaultStickyWin a.button {background:url({%baseHref%}big_button.gif) repeat-x; margin: 2px 8px 2px 8px; padding: 2px 12px; cursor:pointer; border: 1px solid #999 !important; text-decoration:none; color: #000 !important;}"+
            "div.DefaultStickyWin div.closeButton{width:13px; height:13px; background:url({%baseHref%}closebtn.gif) no-repeat; position: absolute; right: 0px; margin:10px 15px 0px 0px !important; cursor:pointer;top:0px}"+
            "div.DefaultStickyWin div.dragHandle {    width: 11px;    height: 25px;    position: relative;    top: 5px;    left: -3px;    cursor: move;    background: url({%baseHref%}drag_corner.gif); float: left;}",
        cornerHandle: false,
        cssClass: '',
        buttons: [],
        cssId: 'defaultStickyWinStyle',
        cssClassName: 'DefaultStickyWin',
        closeButton: true
/*    These options are deprecated:
        closeTxt: false,
        onClose: $empty,
        confirmTxt: false,
        onConfirm: $empty    */
    },
    initialize: function() {
        var args = this.getArgs(arguments);
        this.setOptions(args.options);
        this.legacy();
        var css = this.options.css.substitute({baseHref: this.options.baseHref || Clientcide.assetLocation + '/stickyWinHTML/'}, /\\?\{%([^}]+)%\}/g);
        if (Browser.Engine.trident4) css = css.replace(/png/g, 'gif');
        this.createStyle(css, this.options.cssId);
        this.build();
        if (args.caption || args.body) this.setContent(args.caption, args.body);
    },
    getArgs: function(){
        return StickyWin.UI.getArgs.apply(this, arguments);
    },
    legacy: function(){
        var opt = this.options; //saving bytes
        //legacy support
        if (opt.confirmTxt) opt.buttons.push({text: opt.confirmTxt, onClick: opt.onConfirm || $empty});
        if (opt.closeTxt) opt.buttons.push({text: opt.closeTxt, onClick: opt.onClose || $empty});
    },
    build: function(){
        var opt = this.options;

        var container = new Element('div', {
            'class': opt.cssClassName
        });
        if (opt.width) container.setStyle('width', opt.width);
        this.element = container;
        this.element.store('StickyWinUI', this);
        if (opt.cssClass) container.addClass(opt.cssClass);
        

        var bodyDiv = new Element('div').addClass('body');
        this.body = bodyDiv;
        
        var top_ur = new Element('div').addClass('top_ur');
        this.top_ur = top_ur;
        this.top = new Element('div').addClass('top').adopt(
                new Element('div').addClass('top_ul')
            ).adopt(top_ur);
        container.adopt(this.top);
        
        if (opt.cornerHandle) new Element('div').addClass('dragHandle').inject(top_ur, 'top');
        
        //body
        container.adopt(new Element('div').addClass('middle').adopt(bodyDiv));
        //close buttons
        if (opt.buttons.length > 0){
            var closeButtons = new Element('div').addClass('closeButtons');
            opt.buttons.each(function(button){
                if (button.properties && button.properties.className){
                    button.properties['class'] = button.properties.className;
                    delete button.properties.className;
                }
                var properties = $merge({'class': 'closeSticky'}, button.properties);
                new Element('a').addEvent('click', button.onClick || $empty)
                    .appendText(button.text).inject(closeButtons).set(properties).addClass('button');
            });
            container.adopt(new Element('div').addClass('closeBody').adopt(closeButtons));
        }
        //footer
        container.adopt(
            new Element('div').addClass('bottom').adopt(
                    new Element('div').addClass('bottom_ll')
                ).adopt(
                    new Element('div').addClass('bottom_lr')
            )
        );
        if (this.options.closeButton) container.adopt(new Element('div').addClass('closeButton').addClass('closeSticky'));
        return this;
    },
    setCaption: function(caption) {
        this.caption = caption;
        if (!this.h1) {
            this.makeCaption(caption);
        } else {
            if (document.id(caption)) this.h1.adopt(caption);
            else this.h1.set('html', caption);
        }
        return this;
    },
    makeCaption: function(caption) {
        if (!caption) return this.destroyCaption();
        var opt = this.options;
        this.h1 = new Element('h1').addClass('caption');
        if (opt.width) this.h1.setStyle('width', (opt.width-(opt.cornerHandle?55:40)-(opt.closeButton?10:0)));
        this.setCaption(caption);
        this.top_ur.adopt(this.h1);
        if (!this.options.cornerHandle) this.h1.addClass('dragHandle');
        return this;
    },
    destroyCaption: function(){
        if (this.h1) {
            this.h1.destroy();
            this.h1 = null;
        }
        return this;
    },
    setContent: function(){
        var args = this.getArgs.apply(this, arguments);
        var caption = args.caption;
        var body = args.body;
        this.setCaption(caption);
        if (document.id(body)) this.body.empty().adopt(body);
        else this.body.set('html', body);
        return this;
    }
});
StickyWin.UI.getArgs = function(){
    var input = $type(arguments[0]) == "arguments"?arguments[0]:arguments;
    if (Browser.Engine.presto && 1 === input.length) input = input[0];

    var cap = input[0], bod = input[1];
    var args = Array.link(input, {options: Object.type});
    if (input.length == 3 || (!args.options && input.length == 2)) {
        args.caption = cap;
        args.body = bod;
    } else if (($type(bod) == 'object' || !bod) && cap && $type(cap) != 'object'){
        args.body = cap;
    }
    return args;
};

StickyWin.ui = function(caption, body, options){
    return document.id(new StickyWin.UI(caption, body, options));
};
/*
Script: StickyWin.Ajaxjs

Adds ajax functionality to all the StickyWin classes.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
(function(){
    var SWA = function(extend){
        return {
            Extends: extend,
            options: {
                //onUpdate: $empty,
                url: '',
                showNow: false,
                requestOptions: {
                    method: 'get',
                    evalScripts: true
                },
                wrapWithUi: false, 
                caption: '',
                uiOptions:{},
                handleResponse: function(response){
                    var responseScript = "";
                    this.Request.response.text.stripScripts(function(script){    responseScript += script; });
                    if (this.options.wrapWithUi) response = StickyWin.ui(this.options.caption, response, this.options.uiOptions);
                    this.setContent(response);
                    this.show();
                    if (this.evalScripts) $exec(responseScript);
                    this.fireEvent('update');
                }
            },
            initialize: function(options){
                var showNow;
                if (options && options.showNow) {
                    showNow = true;
                    options.showNow = false;
                }
                this.parent(options);
                this.evalScripts = this.options.requestOptions.evalScripts;
                this.options.requestOptions.evalScripts = false;
                this.createRequest();
                if (showNow) this.update();
            },
            createRequest: function(){
                this.Request = new Request(this.options.requestOptions).addEvent('onSuccess',
                    this.options.handleResponse.bind(this));
            },
            update: function(url, options){
                this.Request.setOptions(options).send({url: url||this.options.url});
                return this;
            }
        };
    };
    try {    StickyWin.Ajax = new Class(SWA(StickyWin)); } catch(e){}
    try {    StickyWin.Modal.Ajax = new Class(SWA(StickyWin.Modal)); } catch(e){}
})();/*
Script: StickyWin.Alert.js
    Defines StickyWin.Alert, a simple little alert box with a close button.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.Alert = new Class({
    Implements: Options,
    Extends: StickyWin.Modal,
    options: {
        destroyOnClose: true,
        modalOptions: {
            modalStyle: {
                zIndex: 11000
            }
        },
        zIndex: 110001,
        uiOptions: {
            width: 250,
            buttons: [
                {text: 'Ok'}
            ]
        },
        getWindowManager: $empty
    },
    initialize: function(caption, message, options) {
        this.message = message;
        this.caption = caption;
        this.setOptions(options);
        this.setOptions({
            content: this.build()
        });
        this.parent(options);
    },
    makeMessage: function() {
        return new Element('p', {
            'class': 'errorMsg SWclearfix',
            styles: {
                margin: 0,
                minHeight: 10
            },
            html: this.message
        });
    },
    build: function(){
        return StickyWin.ui(this.caption, this.makeMessage(), this.options.uiOptions);
    }
});

StickyWin.Error = new Class({
    Extends: StickyWin.Alert, 
    makeMessage: function(){
        var message = this.parent();
        new Element('img', {
            src: (this.options.baseHref || Clientcide.assetLocation + '/simple.error.popup') + '/icon_problems_sm.gif',
            'class': 'bang clearfix',
            styles: {
                'float': 'left',
                width: 30,
                height: 30,
                margin: '3px 5px 5px 0px'
            }
        }).inject(message, 'top');
        return message;
    }
});

StickyWin.alert = function(caption, message, options) {
    if ($type(options) == "string") options = {baseHref: options};
    return new StickyWin.Alert(caption, message, options);
};

StickyWin.error = function(caption, message, options) {
    return new StickyWin.Error(caption, message, options);
};/*
Script: StickyWin.Confirm.js
    Defines StickyWin.Conferm, a simple confirmation box with an ok and a close button.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.Confirm = new Class({
    Extends: StickyWin.Alert,
    options: {
        uiOptions: {
            width: 250
        }
    },
    build: function(callback){
        this.setOptions({
            uiOptions: {
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: 'Ok', 
                        onClick: callback || function(){
                            this.fireEvent('confirm');
                        }.bind(this)
                    }
                ]
            }
        });
        return this.parent();
    }
});

StickyWin.confirm = function(caption, message, callback, options) {
    return new StickyWin.Confirm(caption, message, options).addEvent('confirm', callback);
};/*
name: TabSwapper.js
description: Handles the scripting for a common UI layout; the tabbed box.
License: http://www.clientcide.com/wiki/cnet-libraries#license

requires:
 - core: Element.Event, Fx.Tween, Fx.Morph
 - more: Element.Shortcuts, Element.Dimensions, Element.Measure

*/
var TabSwapper = new Class({
    Implements: [Options, Events],
    options: {
        selectedClass: 'tabSelected',
        mouseoverClass: 'tabOver',
        deselectedClass: '',
        rearrangeDOM: true,
        initPanel: 0, 
        smooth: false, 
        smoothSize: false,
        maxSize: null,
        effectOptions: {
            duration: 500
        },
        cookieName: null, 
        cookieDays: 999
//    onActive: $empty,
//    onActiveAfterFx: $empty,
//    onBackground: $empty
    },
    tabs: [],
    sections: [],
    clickers: [],
    sectionFx: [],
    initialize: function(options){
        this.setOptions(options);
        var prev = this.setup();
        if (prev) return prev;
        if (this.options.cookieName && this.recall()) this.show(this.recall().toInt());
        else this.show(this.options.initPanel);
    },
    setup: function(){
        var opt = this.options;
        sections = $$(opt.sections);
        tabs = $$(opt.tabs);
        if (tabs[0] && tabs[0].retrieve('tabSwapper')) return tabs[0].retrieve('tabSwapper');
        clickers = $$(opt.clickers);
        tabs.each(function(tab, index){
            this.addTab(tab, sections[index], clickers[index], index);
        }, this);
    },
    addTab: function(tab, section, clicker, index){
        tab = document.id(tab); clicker = document.id(clicker); section = document.id(section);
        //if the tab is already in the interface, just move it
        if (this.tabs.indexOf(tab) >= 0 && tab.retrieve('tabbered') 
             && this.tabs.indexOf(tab) != index && this.options.rearrangeDOM) {
            this.moveTab(this.tabs.indexOf(tab), index);
            return this;
        }
        //if the index isn't specified, put the tab at the end
        if (!$defined(index)) index = this.tabs.length;
        //if this isn't the first item, and there's a tab
        //already in the interface at the index 1 less than this
        //insert this after that one
        if (index > 0 && this.tabs[index-1] && this.options.rearrangeDOM) {
            tab.inject(this.tabs[index-1], 'after');
            section.inject(this.tabs[index-1].retrieve('section'), 'after');
        }
        this.tabs.splice(index, 0, tab);
        clicker = clicker || tab;

        tab.addEvents({
            mouseout: function(){
                tab.removeClass(this.options.mouseoverClass);
            }.bind(this),
            mouseover: function(){
                tab.addClass(this.options.mouseoverClass);
            }.bind(this)
        });

        clicker.addEvent('click', function(e){
            e.preventDefault();
            this.show(index);
        }.bind(this));

        tab.store('tabbered', true);
        tab.store('section', section);
        tab.store('clicker', clicker);
        this.hideSection(index);
        return this;
    },
    removeTab: function(index){
        var now = this.tabs[this.now];
        if (this.now == index){
            if (index > 0) this.show(index - 1);
            else if (index < this.tabs.length) this.show(index + 1);
        }
        this.now = this.tabs.indexOf(now);
        return this;
    },
    moveTab: function(from, to){
        var tab = this.tabs[from];
        var clicker = tab.retrieve('clicker');
        var section = tab.retrieve('section');
        
        var toTab = this.tabs[to];
        var toClicker = toTab.retrieve('clicker');
        var toSection = toTab.retrieve('section');
        
        this.tabs.erase(tab).splice(to, 0, tab);

        tab.inject(toTab, 'before');
        clicker.inject(toClicker, 'before');
        section.inject(toSection, 'before');
        return this;
    },
    show: function(i){
        if (!$chk(this.now)) {
            this.tabs.each(function(tab, idx){
                if (i != idx) 
                    this.hideSection(idx);
            }, this);
        }
        this.showSection(i).save(i);
        return this;
    },
    save: function(index){
        if (this.options.cookieName) 
            Cookie.write(this.options.cookieName, index, {duration:this.options.cookieDays});
        return this;
    },
    recall: function(){
        return (this.options.cookieName)?$pick(Cookie.read(this.options.cookieName), false): false;
    },
    hideSection: function(idx) {
        var tab = this.tabs[idx];
        if (!tab) return this;
        var sect = tab.retrieve('section');
        if (!sect) return this;
        if (sect.getStyle('display') != 'none') {
            this.lastHeight = sect.getSize().y;
            sect.setStyle('display', 'none');
            tab.swapClass(this.options.selectedClass, this.options.deselectedClass);
            this.fireEvent('onBackground', [idx, sect, tab]);
        }
        return this;
    },
    showSection: function(idx) {
        var tab = this.tabs[idx];
        if (!tab) return this;
        var sect = tab.retrieve('section');
        if (!sect) return this;
        var smoothOk = this.options.smooth && !Browser.Engine.trident4;
        if (this.now != idx) {
            if (!tab.retrieve('tabFx')) 
                tab.store('tabFx', new Fx.Morph(sect, this.options.effectOptions));
            var overflow = sect.getStyle('overflow');
            var start = {
                display:'block',
                overflow: 'hidden'
            };
            if (smoothOk) start.opacity = 0;
            var effect = false;
            if (smoothOk) {
                effect = {opacity: 1};
            } else if (sect.getStyle('opacity').toInt() < 1) {
                sect.setStyle('opacity', 1);
                if (!this.options.smoothSize) this.fireEvent('onActiveAfterFx', [idx, sect, tab]);
            }
            if (this.options.smoothSize) {
                var size = sect.getDimensions().height;
                if ($chk(this.options.maxSize) && this.options.maxSize < size) 
                    size = this.options.maxSize;
                if (!effect) effect = {};
                effect.height = size;
            }
            if ($chk(this.now)) this.hideSection(this.now);
            if (this.options.smoothSize && this.lastHeight) start.height = this.lastHeight;
            sect.setStyles(start);
            if (effect) {
                tab.retrieve('tabFx').start(effect).chain(function(){
                    this.fireEvent('onActiveAfterFx', [idx, sect, tab]);
                    sect.setStyles({
                        height: this.options.maxSize == effect.height ? this.options.maxSize : "auto",
                        overflow: overflow
                    });
                    sect.getElements('input, textarea').setStyle('opacity', 1);
                }.bind(this));
            }
            this.now = idx;
            this.fireEvent('onActive', [idx, sect, tab]);
        }
        tab.swapClass(this.options.deselectedClass, this.options.selectedClass);
        return this;
    }
});
/*
Script: Confirmer.js
    Fades a message in and out for the user to tell them that some event (like an ajax save) has occurred.

License:
    http://www.clientcide.com/wiki/cnet-libraries#license
*/
var Confirmer = new Class({
    Implements: [Options, Events],
    options: {
        reposition: true, //for elements already in the DOM
        //if position = false, just fade
        positionOptions: {
            relativeTo: false,
            position: 'upperRight', //see <Element.Position>
            offset: {x:-225,y:0},
            zIndex: 9999
        },
        msg: 'your changes have been saved', //string or dom element
        msgContainerSelector: '.body',
        delay: 250,
        pause: 1000,
        effectOptions:{
            duration: 500
        },
        prompterStyle:{
            padding: '2px 6px',
            border: '1px solid #9f0000',
            backgroundColor: '#f9d0d0',
            fontWeight: 'bold',
            color: '#000',
            width: 210
        }
//    onComplete: $empty
    },
    initialize: function(options){
            this.setOptions(options);
            this.options.positionOptions.relativeTo = document.id(this.options.positionOptions.relativeTo) || document.body;
            this.prompter = (document.id(this.options.msg))?document.id(this.options.msg):this.makePrompter(this.options.msg);
            if (this.options.reposition){
                this.prompter.setStyles({
                    position: 'absolute',
                    display: 'none',
                    zIndex: this.options.positionOptions.zIndex
                });
                if (!Browser.Engine.trident4) this.prompter.setStyle('opacity',0);
            } else if (!Browser.Engine.trident4) this.prompter.setStyle('opacity',0);
            else this.prompter.setStyle('visibility','hidden');
            if (!this.prompter.getParent()){
                window.addEvent('domready', function(){
                    this.prompter.inject(document.body);
                }.bind(this));
            }
        try {
            this.msgHolder = this.prompter.getElement(this.options.msgContainerSelector);
            if (!this.msgHolder) this.msgHolder = this.prompter;
        } catch(e){dbug.log(e)}
    },
    makePrompter: function(msg){
        return new Element('div').setStyles(this.options.prompterStyle).appendText(msg);
    },
    prompt: function(options){
        if (!this.paused)this.stop();
        var msg = (options)?options.msg:false;
        options = $merge(this.options, {saveAsDefault: false}, options||{});
        if (document.id(options.msg) && msg) this.msgHolder.empty().adopt(options.msg);
        else if (!document.id(options.msg) && options.msg) this.msgHolder.empty().appendText(options.msg);
        if (!this.paused) {
            if (options.reposition) this.position(options.positionOptions);
            (function(){
                this.timer = this.fade(options.pause);
            }).delay(options.delay, this);
        }
        if (options.saveAsDefault) this.setOptions(options);
        return this;
    },
    fade: function(pause){
        this.paused = true;
        pause = $pick(pause, this.options.pause);
        if (!this.fx && !Browser.Engine.trident4)
            this.fx = new Fx.Tween(this.prompter, $merge({property: 'opacity'}, this.options.effectOptions));
        if (this.options.reposition) this.prompter.setStyle('display','block');
        if (!Browser.Engine.trident4){
            this.prompter.setStyle('visibility','visible');
            this.fx.start(0,1).chain(function(){
                this.timer = (function(){
                    this.fx.start(0).chain(function(){
                        if (this.options.reposition) this.prompter.hide();
                        this.paused = false;
                    }.bind(this));
                }).delay(pause, this);
            }.bind(this));
        } else {
            this.prompter.setStyle('visibility','visible');
            this.timer = (function(){
                this.prompter.setStyle('visibility','hidden');
                this.fireEvent('onComplete');
                this.paused = false;
            }).delay(pause+this.options.effectOptions.duration, this);
        }
        return this;
    },
    stop: function(){    
        this.paused = false;
        $clear(this.timer);
        if (this.fx) this.fx.set(0);
        if (this.options.reposition) this.prompter.hide();
        return this;
    },
    position: function(positionOptions){
        this.prompter.position($merge(this.options.positionOptions, positionOptions));
        return this;
    }
});
