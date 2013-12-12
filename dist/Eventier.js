/*! Eventier - v0.1.0 - 2013-12-12
* https://github.com/nbubna/Eventier
* Copyright (c) 2013 ESHA Research; Licensed MIT */

(function(global, document, HTML) {
    "use strict";

var Eventier = function(a) {
    return a && typeof a === "string" ? _.create.apply(this, arguments) : _.copyTo(a) || a;
},
AppEvent = global.CustomEvent || function(type, args) {
    args = args || {};
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, !!args.bubbles, !!args.cancelable, args.detail);
    return e;
},
_ = {
    global: document || global,
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    resolveRE: /^([\w\$]+)?((\.[\w\$]+)|\[(\d+|'(\\'|[^'])+'|"(\\"|[^"])+")\])*$/,
    splitRE: / (?![^\(\)]*\))+/g,
    noop: function(){},

    create: function(type, props) {
        var copy = { text: type },
            prop;
        type = _.parse(type, copy);
        if (props) {
            for (prop in props) {
                if (props.hasOwnProperty(prop)) {
                    copy[prop] = props[prop];
                }
            }
        }
        if (!('bubbles' in copy)) {
            copy.bubbles = true;// must bubble by default
        }

        var event = new AppEvent(type, copy);
        for (prop in copy) {
            event[_.prop(prop)] = copy[prop];
        }
        _.propagation(event);
        return event;
    },
    propagation: function(event) {
        var iFn = event.stopImmediatePropagation || _.noop;
        event.stopImmediatePropagation = function() {
            iFn.call(this);
            event.immediatePropagationStopped = true;
        };
    },

    parsers: [
        [/^_/, function(){ this.bubbles = false; }],
        [/\((.*)\)/, function(m, val) {
            try {
                this.detail = _.resolve(val) || JSON.parse(val);
            } catch (e) {
                this.detail = val;
            }
        }],
        [/#(\w+)/g, function(m, tag) {
            (this.tags||(this.tags=[])).push(tag);
            this[tag] = true;
        }],
        [/^(\w+):/, function(m, category){ this.category = category; }]//
    ],
    parse: function(type, props) {
        props.text = type;// save original
        _.parsers.forEach(function(parser) {
            type = type.replace(parser[0], function() {
                return parser[1].apply(props, arguments) || '';
            });
        });
        return type;
    },

    prop: function(prop){ return prop; },// only an extension hook

    copyTo: function(o, p, v) {
        if (typeof o === "object") {
            for (p in Eventier) {
                if (Eventier.hasOwnProperty(p) && typeof (v=Eventier[p]) === "function") {
                    o[p] = v;
                }
            }
            return o;
        }
    },

    // common utilities
    resolve: function(reference, context) {
        if (_.resolveRE.test(reference)) {
            context = context || global;
            return eval('context'+(reference.charAt(0) !== '[' ? '.'+reference : reference));
        }
    },
    fixArgs: function(expect, fn) {
        return function(target) {
            var args = _.slice(arguments),
                ret;
            // must have a target
            if (typeof target !== "object") {
                target = !this || this === Eventier ? _.global : this;
                args.unshift(target);
            }
            // may have extraneous data args
            if (args.length > expect) {
                args[expect] = args.slice(expect);
                args = args.slice(0, expect);
            }
            // sequence may be 2nd or 3rd
            var seqIndex = typeof args[1] === "string" ? 1 : 2;
            if (typeof args[seqIndex] === "string") {
                args[seqIndex] = args[seqIndex].split(_.splitRE);
            }
            // iterate over multiple targets
            if ('length' in target) {
                for (var i=0,m=target.length; i<m; i++) {
                    ret = fn.apply(target, args);
                }
            } else {
                ret = fn.apply(target, args);
            }
            // be fluent
            return ret === undefined ? this : ret;
        };
    }
};
Eventier._ = _;

_.fire = function(target, sequence, props, data, _resumeIndex) {
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

    var event;
    if (sequence.length === 1) {
        event = _.create(sequence[0], props);
        _.dispatch(event);
    } else {
        props.sequence = sequence;
        for (var i=_resumeIndex||0; i < sequence.length && (!event||!event.isSequenceStopped()); i++) {
            if (sequence[i]) {
                props.index = i;
                event = props.previousEvent = _.create(sequence[i], props);
                _.sequence(event, props, target);
                _.dispatch(event);
            } else {
                sequence.splice(i--, 1);
            }
        }
    }
    return event;
};
_.dispatch = function(target, event) {
    return (target.dispatchEvent || target[_.secret] || _.noop)(event);
};
_.sequence = function(event, props, target, stopped) {
    event.resumeSequence = function(index) {
        if (stopped) {
            stopped = false;
            _.fire(target, props.sequence, props, null, index||props.index);
        }
    };
    event.stopSequence = function(promise) {
        if (stopped !== false) {// multiple stops is nonsense
            stopped = true;
            return promise && promise.then(this.resumeSequence);
        }
    };
    event.isSequenceStopped = function(){ return !!stopped; };
};

Eventier.fire = _.fixArgs(3, _.fire);

_.on = function(target, after, sequence, selector, fn, data) {
	// argument resolution
	if (Array.isArray(after)) {
		if (fn !== undefined) {
			data = data ? data.unshift(fn) && data : [fn];
		}
		fn = selector;selector = sequence;sequence = after;after = undefined;
	}
	if (typeof selector !== "string") {
		if (fn !== undefined) {
			data = data ? data.unshift(fn) && data : [fn];
		}
		fn = selector;
	}
	
	for (var i=0,m=sequence.length; i<m; i++) {
		var handler = {
			selector:selector, fn:fn, data:data,
			after: _.after(after)
		};
		handler.type = _.parse(sequence[i], handler);
		_.addHandler(target, handler);
		if (handler.type.indexOf('+')) {
			_.compound(handler);
		}
	}
};
_.after = function(after) {
	switch (typeof after) {
		case "undefined":
		case "function": return after;
		case "number":   return function(){ return !--after; };
		default:         return function(){ return after; };
		//TODO: handle late calls where after===true (i.e remember "once" events)
	}
};
_.addHandler = function(target, handler) {
	var listener = _.listener(target),
		type = handler.type,
		handlers = listener.s[type];
	handler.target = target;
	if (!handlers) {
		handlers = listener.s[type] = [];
		if (target.addEventListener) {
			target.addEventListener(type, listener);
		}
	}
	handlers.push(handler);
};
_.compound = function(handler) {
	var types = handler.type.split('+'),
		timeout = (handler.detail && handler.detail.timeout) || _.compound.timeout,
		fn = handler.compound = _.compounder(types, timeout);
	for (var i=0,m=types.length; i<m; i++) {
		_.addHandler(handler.target, {
			type:types[i], selector:handler.selector, fn:fn
		});
	}
};
_.compound.timeout = 1000;
_.compounder = function(types, timeout) {
	var need = types.slice(),
		clear,
		reset = function() {
			if (clear){ clearTimeout(clear); }
			need = types.slice();
		};
	return function() {
		if (!clear){ clear = setTimeout(reset, timeout); }
		var i = need.indexOf(this.type);
		if (i >= 0) {
			need.splice(i, 1);
			if (!need.length) {
				_.fire(this.target, this.text);
				reset();
			}
		}
	};
};
_.secret = 'Eventier'+Math.random();
_.listener = function(target) {
    var listener = target[_.secret];
    if (!listener) {
		listener = function(event){ return _.handle(event, listener.s[event.type]); };
        listener.s = {};
        Object.defineProperty(target, _.secret, {value:listener,configurable:true});
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
	if (event.data){ args.push.apply(args, event.data); }
	if (handler.data){ args.unshift.apply(args, handler.data); }
	try {
		handler.fn.apply(target, args);
	} catch (e) {
		setTimeout(function(){ throw e; }, 0);
	}
	if (handler.after && handler.after() === true) {
		if (_.off) {
			_.off(handler.target, handler.text, handler.fn);
		} else {
			handler.fn = _.noop;// do what we can
		}
	}
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
	Object.defineProperty(Ep, 'matches', Ep['webkitM'+aS]||Ep['mozM'+aS]||Ep['msM'+aS]);
}   

Eventier.on = _.fixArgs(5, _.on);

_.off = function(target, sequence, fn) {
	if (!sequence) {
		return _.wipe(target);
	}

	var listeners = _.listener(target).s;
	for (var i=0,m=sequence.length; i<m; i++) {
		var type = sequence[i],
			filter = { fn: fn, target: target };
		type = filter.type = _.parse(type, filter);

		if (type) {
			_.filter(listeners[type], filter);
		} else {
			for (type in listeners) {
				_.clean(listeners[type], filter);
			}
			if (_.empty(listeners)) {
				_.wipe(target);
			}
		}
	}
};
_.empty = function(o){ for (var k in o){ return !k; } return true; };
_.wipe = function(target){ delete target[_.secret]; };

_.clean = function(handlers, filter) {
	for (var i=0,m=handlers.length; i<m; i++) {
		if (_.cleans(handlers[i], filter)) {
			handlers.splice(i--, 1);
		}
		//TODO: teach _.off to watch for handler.compound and remove part-handlers
	}
	if (!handlers.length && filter.target.removeEventListener) {
		filter.target.removeEventListener(filter.type, _.listener(filter.target));
		return true;
	}
};
_.cleans = function(handler, filter) {
	return _.handles(handler, filter) &&
		(!filter.detail || handler.detail === filter.detail) &&
		(!filter.fn || handler.fn === filter.fn);
};

Eventier.off = _.fixArgs(3, _.off);

    _.version = "0.1.0";

    // export Eventier (AMD, commonjs, or window/env)
    var define = global.define || _.noop;
    define((global.exports||global).Eventier = Eventier);

	// extend HTML(.js), if present and not prohibited
    if (HTML._ && HTML.getAttribute('data-eventier-html') !== "false") {
        _.copyTo(HTML._.fn);
        if (_.target) {
            var target = _.target;
            _.target = function() {
                return HTML._.node(target.apply(this, arguments));
            };
        }
    }
})(this, document, (document||{}).documentElement);
