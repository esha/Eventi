/*! Eventi - v0.5.1 - 2014-02-21
* https://github.com/nbubna/Eventi
* Copyright (c) 2014 ESHA Research; Licensed MIT */

(function(global, document) {
    "use strict";

    // polyfill CustomEvent constructor
    if (!global.CustomEvent) {
        global.CustomEvent = document ? function CustomEvent(type, args) {
            args = args || {};
            var e = document.createEvent('CustomEvent');
            e.initCustomEvent(type, !!args.bubbles, !!args.cancelable, args.detail);
            return e;
        } : function CustomEvent(type, args) {
            args = args || {};
            this.type = type;
            this.bubbles = !!args.bubbles;
            this.detail = args.detail;
            this.timestamp = Date.now();
        };
    }

function Eventi(){ return _.create.apply(this, arguments); }
var _ = {
    global: new Function('return this')(),
    noop: function(){},
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    copy: function(a, b, p) {
        if (a){ for (p in a){ if (a.hasOwnProperty(p)){ b[p] = a[p]; }}}
    },
    async: global.setImmediate || function async(fn){ return setTimeout(fn, 0); },
    resolveRE: /^([\w\$]+)?((\.[\w\$]+)|\[(\d+|'(\\'|[^'])+'|"(\\"|[^"])+")\])*$/,
    resolve: function(reference, context) {
        if (_.resolveRE.test(reference)) {
            context = context || global;
            return eval('context'+(reference.charAt(0) !== '[' ? '.'+reference : reference));
        }
    },

    create: function(type, copyThese) {
        var props = { text: type+'' };
        type = _.parse(props.text, props);
        _.copy(copyThese, props);
        if (!('bubbles' in props)) {
            props.bubbles = true;// must bubble by default
        }

        var event = new CustomEvent(type, props);
        for (var prop in props) {
            if (_.skip.indexOf(prop) < 0) {
                event[_.prop(prop)] = props[prop];
            }
        }
        return event;
    },
    skip: 'bubbles cancelable detail type'.split(' '),
    prop: function(prop){ return prop; },// only an extension hook
    parse: function(type, props) {
        _.properties.forEach(function(property) {
            type = type.replace(property[0], function() {
                return property[1].apply(props, arguments) || '';
            });
        });
        return type ? props.type = type : type;
    },
    properties: [
        [/^_/, function nobubble() {
            this.bubbles = false;
        }],
        [/\((.*)\)/, function detail(m, val) {
            try {
                this.detail = _.resolve(val) || JSON.parse(val);
            } catch (e) {
                this.detail = val;
            }
        }],
        [/#(\w+)/g, function tags(m, tag) {
            (this.tags||(this.tags=[])).push(tag);
            this[tag] = true;
        }],
        [/^(\w+):/, function category(m, cat) {//
            this.category = cat;
        }]
    ],

    splitRE: / (?![^\(\)]*\))+/g,
    wrap: function(name, expect, index) {
        index = index || 1;
        var wrapper = function wrapper(target) {
            var args = _.slice(arguments);
            // ensure target param precedes event text
            if (!target || typeof target === "string") {
                target = !this || this === Eventi ? _.global : this;
                args.unshift(target);
            }
            // ensure array of event text inputs
            args[index] = args[index] ? (args[index]+'').split(_.splitRE) : [''];
            // gather ...data the old way
            if (args.length > expect) {
                args[expect] = args.slice(expect);
                args = args.slice(0, expect+1);
            }
            // call fn for each target
            var fn = _[name], ret;
            if ('length' in target && target !== _.global) {
                for (var i=0,m=target.length; i<m; i++) {
                    ret = fn.apply(args[0] = target[i], args);
                }
            } else {
                ret = fn.apply(target, args);
            }
            // be fluent
            return ret === undefined ? this : ret;
        };
        wrapper.index = index;
        return wrapper;
    }   
};
Eventi._ = _;
(Eventi.fy = function fy(o) {
    for (var p in Eventi) {
        var fn = Eventi[p];
        if (typeof fn === "function" && !fn.utility) {
            Object.defineProperty(o, p, {value:fn, writable:true, configurable:true});
        }
    }
    return o;
}).utility = true;

_.fire = function(target, events, props, data) {
    if (typeof props === "object" && !(props instanceof Event) &&
        ('bubbles' in props || 'detail' in props || 'cancelable' in props)) {
        props.data = data;
    } else {
        if (props !== undefined) {
            data = data ? data.unshift(props) && data : [props];
        }
        props = { data: data };
    }
    return _.fireAll(target, events, props);
};
_.fireAll = function(target, events, props) {
    var event;
    for (var i=0; i<events.length; i++) {
        event = _.create(events[i], props);
        _.dispatch(target, event);
    }
    return event;
};
_.dispatch = function(target, event, objectBubbling) {
    (target.dispatchEvent || target[_key] || _.noop).call(target, event);
    if (target.parentObject && event.bubbles && !event.propagationStopped) {
        _.dispatch(target.parentObject, event, true);
    }
    // icky test/call, but lighter than wrapping or firing internal event
    if (!objectBubbling && event.singleton && _.singleton) {
        _.singleton(target, event);
    }
};
Eventi.fire = _.wrap('fire', 3);
_.on = function(target, events, selector, fn, data) {
    // adjust for absence of selector
    if (typeof selector !== "string") {
        if (fn !== undefined) {
            data = data ? data.unshift(fn) && data : [fn];
        }
        fn = selector; selector = null;
    }
    for (var i=0,m=events.length; i<m; i++) {
        _.handler(target, events[i], selector, fn, data);
    }
};
_.handler = function(target, text, selector, fn, data) {
    var handler = { target:target, selector:selector, fn:fn, data:data, text:text, match:{} },
        listener = _.listener(target),
        type = _.parse(text, handler.match),
        handlers = listener.s[type];
    delete handler.match.tags;// superfluous for matching
    if (!handlers) {
        handlers = listener.s[type] = [];
        if (target.addEventListener) {
            target.addEventListener(type, listener);
        }
    }
    handlers.push(handler);
    if (target !== _) {// ignore internal events
        Eventi.fire(_, 'handler#new', handler);
    }
    return handler;
};

var _key = _._key = '_eventi'+Date.now();
_.listener = function(target) {
    var listener = target[_key];
    if (!listener) {
        listener = function(event) {
            var handlers = listener.s[event.type];
            if (handlers){ _.handle(event, handlers); }
        };
        listener.s = {};
        Object.defineProperty(target, _key, {
            value:listener, writeable:false, configurable:true
        });
    }
    return listener;
};

_.handle = function(event, handlers) {
    for (var i=0, m=handlers.length, handler, target; i<m; i++) {
        if (_.matches(event, (handler = handlers[i]).match)) {
            if (target = _.target(handler, event.target)) {
                _.execute(target, event, handler);
                if (event.immediatePropagationStopped){ i = m; }
            }
        }
    }
};
_.execute = function(target, event, handler) {
    var args = [event];
    if (event.data){ args.push.apply(args, event.data); }
    if (handler.data){ args.push.apply(args, handler.data); }
    try {
        handler.fn.apply(target, args);
    } catch (e) {
        _.async(function(){ throw e; });
    }
};
_.unhandle = function noop(handler){ handler.fn = _.noop; };

_.matches = function(event, match) {
    for (var key in match) {
        if (match[key] !== event[key] && key !== 'singleton') {// more singleton bleed, ick
            return false;
        }
    }
    return true;
};

_.target = function(handler, target) {
    return handler.selector ? _.closest(target, handler.selector) : handler.target;
};
_.closest = function(el, selector) {
    while (el && el.matches) {
        if (el.matches(selector)) {
            return el;
        }
        el = el.parentNode;
    }
};
if (global.Element) {
    var Ep = Element.prototype,
        aS = 'atchesSelector';
    Object.defineProperty(Ep, 'matches', {value:Ep['webkitM'+aS]||Ep['mozM'+aS]||Ep['msM'+aS]});
}   

Eventi.on = _.wrap('on', 4);

    _.version = "0.5.1";

    var sP = (Event && Event.prototype.stopPropagation) || _.noop,
        sIP = (Event && Event.prototype.stopImmediatePropagation) || _.noop;
    CustomEvent.prototype.stopPropagation = function() {
        this.propagationStopped = true;
        sP.call(this);
    };
    CustomEvent.prototype.stopImmediatePropagation = function() {
        this.immediatePropagationStopped = true;
        sIP.call(this);
    };

    // export Eventi (AMD, commonjs, or window/env)
    var define = global.define || _.noop;
    define((global.exports||global).Eventi = Eventi);

})(this, this.document);
