/*! Eventi - v0.1.0 - 2014-01-17
* https://github.com/nbubna/Eventi
* Copyright (c) 2014 ESHA Research; Licensed MIT */

(function(global, document, HTML) {
    "use strict";

function Eventi(){ return _.create.apply(this, arguments); }
var _ = {
    global: document || global,
    noop: function(){},
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    copy: function(a, b, p) {
        for (p in a){ if (a.hasOwnProperty(p)){ b[p] = a[p]; } }
    },
    resolveRE: /^([\w\$]+)?((\.[\w\$]+)|\[(\d+|'(\\'|[^'])+'|"(\\"|[^"])+")\])*$/,
    resolve: function(reference, context) {
        if (_.resolveRE.test(reference)) {
            context = context || global;
            return eval('context'+(reference.charAt(0) !== '[' ? '.'+reference : reference));
        }
    },

    create: function(type, copyThese) {
        var props = {};
        type = _.parse(type+'', props);
        _.copy(copyThese, props);
        if (!('bubbles' in props)) {
            props.bubbles = true;// must bubble by default
        }

        var event = new CustomEvent(type, props);
        for (var prop in props) {
            event[_.prop(prop)] = props[prop];
        }
        event.stopImmediatePropagation = _.sIP;
        return event;
    },
    prop: function(prop){ return prop; },// only an extension hook
    sIP: function() {
        this.immediatePropagationStopped = true;
        (Event.prototype.stopImmediatePropagation || _.noop).call(this);
    },
    parse: function(type, props) {
        props.text = type;// save original
        _.properties.forEach(function(property) {
            type = type.replace(property[0], function() {
                return property[1].apply(props, arguments) || '';
            });
        });
        return type;
    },
    properties: [
/*nobubble*/[/^_/,          function(){ this.bubbles = false; }],
/*detail*/  [/\((.*)\)/,    function(m, val) {
                                try {
                                    this.detail = _.resolve(val) || JSON.parse(val);
                                } catch (e) {
                                    this.detail = val;
                                }
                            }],
/*tags*/    [/#(\w+)/g,     function(m, tag) {
                                (this.tags||(this.tags=[])).push(tag);
                                this[tag] = true;
                            }],
/*category*/[/^(\w+):/,     function(m, category){ this.category = category; }]//
    ],

    splitRE: / (?![^\(\)]*\))+/g,
    wrap: function(fn, expect, index) {
        return function(target) {
            var args = _.slice(arguments);
            // ensure target param precedes event text
            if (typeof target === "string" || target instanceof Event) {
                target = !this || this === Eventi ? _.global : this;
                args.unshift(target);
            }
            // convert to array of event text inputs
            args[index||1] = args[index||1].split(_.splitRE);
            // gather ...data the old way
            if (args.length > expect) {
                args[expect] = args.slice(expect);
                args = args.slice(0, expect+1);
            }
            // call fn for each target
            var ret;
            if ('length' in target) {
                for (var i=0,m=target.length; i<m; i++) {
                    ret = fn.apply(args[0] = target[i], args);
                }
            } else {
                ret = fn.apply(target, args);
            }
            // be fluent
            return ret === undefined ? this : ret;
        };
    }   
};
Eventi._ = _;
Eventi.fy = function(o, p, v) {
    for (p in Eventi) {
        if (p !== 'fy' && !(p in o) && typeof (v=Eventi[p]) === "function") {
            o[p] = v;
        }
    }
    return o;
};

_.fire = function(target, events, props, data) {
    if (props) {
        if (typeof props !== "object" ||
            (!('bubbles' in props) && !('detail' in props) && !('cancelable' in props))) {
            data = data ? data.unshift(props) && data : [props];
        }
    } else {
        props = {};
    }
    if (data && data.length) {
        props.data = data;
    }
    return _.trigger(target, events, props);
};
_.trigger = function(target, events, props) {
    var event;
    for (var i=0; i<events.length; i++) {
        event = _.create(events[i], props);
        _.dispatch(target, event);
    }
    return event;
};
_.dispatch = function(target, event) {
    (target.dispatchEvent || target[_.secret] || _.noop)(event);
};
Eventi.fire = _.wrap(_.fire, 3);

_.on = function(target, events, selector, fn, data) {
	// adjust for absence of selector
	if (typeof selector !== "string") {
		if (fn !== undefined) {
			data = data ? data.unshift(fn) && data : [fn];
		}
		fn = selector;
	}
	for (var i=0,m=events.length; i<m; i++) {
		_.handler(target, events[i], selector, fn, data);
	}
};
_.handler = function(target, text, selector, fn, data) {
	var handler = { target:target, selector:selector, fn:fn, data:data },
		listener = _.listener(target),
		type = handler.type = _.parse(text, handler),
		handlers = listener.s[type];
	if (!handlers) {
		handlers = listener.s[type] = [];
		if (target.addEventListener) {
			target.addEventListener(type, listener);
		}
	}
	handlers.push(handler);
	return handler;
};
_._key = 'Eventi'+Math.random();
_.listener = function(target) {
    var listener = target[_._key];
    if (!listener) {
		listener = function(event){ return _.handle(event, listener.s[event.type]); };
        listener.s = {};
        Object.defineProperty(target, _._key, {value:listener,configurable:true});
    }
    return listener;
};

_.handle = function(event, handlers) {
	for (var i=0, m=handlers.length, handler, target; i<m; i++) {
		if (_.handles(event, (handler = handlers[i]))) {
			if (target = _.target(handler, event.target)) {
				_.execute(target, event, handler);
				if (event.immediatePropagationStopped){ i = m; }
			}
		}
	}
	return !event.defaultPrevented;
};
_.execute = function(target, event, handler) {
	var args = [event];
	//TODO: consider putting all data args after event and
	//      letting handler data act as defaults that event data can override
	//      this may introduce more surprise but is more obviously useful
	if (event.data){ args.push.apply(args, event.data); }
	if (handler.data){ args.unshift.apply(args, handler.data); }
	if (handler.before){ handler.before(); }
	try {
		handler.fn.apply(target, args);
	} catch (e) {
		setTimeout(function(){ throw e; }, 0);
	}
	if (handler.after){ handler.after(); }
};

_.handles = function(event, handler) {
	return (!handler.type || event.type === handler.type) &&
			(!handler.category || event.category === handler.category) &&
			(!handler.tags || _.subset(handler.tags, event.tags));
};
_.subset = function(subset, set) {
	if (set && set.length) {
		for (var i=0,m=subset.length; i<m; i++) {
			if (set.indexOf(subset[i]) < 0){ return false; }
		}
		return true;
	}
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
var Ep = Element && Element.prototype, aS = 'atchesSelector';
if (Ep) {
	Object.defineProperty(Ep, 'matches', {value:Ep['webkitM'+aS]||Ep['mozM'+aS]||Ep['msM'+aS]});
}   

Eventi.on = _.wrap(_.on, 4);

    _.version = "0.1.0";

    // export Eventi (AMD, commonjs, or window/env)
    var define = global.define || _.noop;
    define((global.exports||global).Eventi = Eventi);

    // polyfill CustomEvent constructor
    if (!global.CustomEvent) {
        global.CustomEvent = function(type, args) {
            args = args || {};
            var e = document.createEvent('CustomEvent');
            e.initCustomEvent(type, !!args.bubbles, !!args.cancelable, args.detail);
            return e;
        };
    }

	// extend HTML(.js), if present and not prohibited
    if (HTML._ && HTML.getAttribute('data-eventier-html') !== "false") {
        Eventi.fy(HTML._.fn);
        if (_.target) {
            var target = _.target;
            _.target = function() {
                return HTML._.node(target.apply(this, arguments));
            };
        }
    }
})(this, document, (document||{}).documentElement);
