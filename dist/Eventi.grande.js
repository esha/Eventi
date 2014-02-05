/*! Eventi - v0.1.0 - 2014-02-05
* https://github.com/nbubna/Eventi
* Copyright (c) 2014 ESHA Research; Licensed MIT */

(function(global, document) {
    "use strict";

function Eventi(){ return _.create.apply(this, arguments); }
var _ = {
    global: new Function('return this')(),
    noop: function(){},
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    copy: function(a, b, p) {
        if (a){ for (p in a){ if (a.hasOwnProperty(p)){ b[p] = a[p]; }}}
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
        delete props.bubbles;
        delete props.cancelable;
        delete props.detail;
        for (var prop in props) {
            event[_.prop(prop)] = props[prop];
        }
        event.stopImmediatePropagation = _.sIP;//TODO: consider prototype extension
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
    wrap: function(name, expect, index) {
        index = index || 1;
        var wrapper = function wrapper(target) {
            var args = _.slice(arguments);
            // ensure target param precedes event text
            if (!target || typeof target === "string") {
                target = !this || this === Eventi ? _.global : this;
                args.unshift(target);
            }
            // convert to array of event text inputs
            args[index] = (args[index]+'').split(_.splitRE);
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
_.dispatch = function(target, event) {
    (target.dispatchEvent || target[_.secret] || _.noop).call(target, event);
    if (target.parentObject) {
        _.dispatch(target.parentObject, event);
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
	var handler = { target:target, selector:selector, fn:fn, data:data, match:{} },
		listener = _.listener(target),
		type = handler.match.type = _.parse(text, handler.match),
		handlers = listener.s[type];
	delete handler.match.text;// not an event prop
	delete handler.match.tags;// superfluous
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
        Object.defineProperty(target, _._key, {
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

_.matches = function(event, match) {
	for (var key in match) {
		if (match[key] !== event[key]) {
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

if (document) {
    _.init = function init() {
        var nodes = document.querySelectorAll('[data-eventi]');
        for (var i=0,m=nodes.length; i<m; i++) {
            var node = nodes[i],
                mapping = node.getAttribute('data-eventi');
            if (mapping) {
                _.declare(mapping, node);
            }
        }
        if (nodes.length || document.querySelectorAll('[click]').length) {
            Eventi.on('click keyup', _.check);
        }
    };
    _.declare = function declare(mapping, node) {// register listener
        var types = mapping.split(_.splitRE);
        for (var i=0,m=types.length; i<m; i++) {
            var type = types[i],
                eq = type.lastIndexOf('='),
                alias = eq > 0 ? type.substring(eq+1) : undefined,
                global = type.charAt(0) === '/';
            if (alias) {
                type = type.substring(0, eq);
            }
            if (global) {
                type = type.substring(1);
                node = _.global;
            }
            Eventi.on(node || _.global, type, _.declared, alias);
        }
    };
    _.declared = function(e, alias) {// lookup handler
        var type = alias || e.type,
            target = _.closest(e.target, '['+type+']'),
            value = target && target.getAttribute(type);
        if (value) {
            _.trigger(target, value, e);
        }
    };
    _.trigger = function(node, response, e) {// execute handler
        var fn = _.resolve(response, node) || _.resolve(response);
        if (typeof fn === "function") {
            fn.call(node, e);
        } else {
            Eventi.fire(node, response, e);
        }
    };
    _.check = function(e) {
        if ((e.type === 'click' && _.click(e.target)) ||
            (e.keyCode === 13 && _.enter(e.target))) {
            _.declared(e, 'click');
            // someone remind me why i've always done this?
            if (!_.allowDefault(e)) {
                e.preventDefault();
            }
        }
    };
    _.click = function(el) {
        return el.getAttribute('click') || _.parentalClick(el);
    };
    _.enter = function(el) {
        return el.getAttribute('click') !== "false" && _.parentalClick(el, true);
    };
    _.allowDefault = function(e) {
        var inputType = e.target.type;
        return inputType && (inputType === 'radio' || inputType === 'checkbox');
    };
    _.parentalClick = function(el, enter) {
        // editables, select, textarea, non-button inputs all use click to alter focus w/o action
        // textarea and editables use enter to add a new line w/o action
        // a[href], buttons, button inputs all automatically dispatch 'click' on enter
        // in all three situations, dev must declare on element, not on parent to avoid insanity
        if (!el.isContentEditable) {
            var name = el.nodeName.toLowerCase();
            if (name !== 'textarea' && name !== (enter ? 'button' : 'select')) {
                var button = _.buttonRE.test(el.type);
                return enter ? !(button || (name === 'a' && el.getAttribute('href'))) :
                            button || name !== 'input';
            }
        }
    };
    _.buttonRE = /^(submit|button|reset)$/;

    Eventi.on('DOMContentLoaded', _.init);
}

// add singleton to _.parse's supported event properties
_.singletonRE = /^_?\^/;
_.properties.splice(1,0, [_.singletonRE, function(){ this.singleton = true; }]);

// wrap _.fire's _.dispatch to save singletons with node and all parents
_.singleton_dispatch = _.dispatch;
_.dispatch = function(target, event) {
	_.singleton_dispatch(target, event);
	if (event.singleton) {
		do {
			var saved = target[_._sKey];
			if (saved) {
				saved.push(event);
			} else {
				Object.defineProperty(target, _._sKey, {value:[event],configurable:true});
			}
		} while (target = target.parentNode);
	}
};
_._sKey = _._key+'s.e.';

// wrap _.on's _.handler to execute fired singletons immediately
//TODO: ensure that combo.js wraps this _.handler instead of vice versa
//      combo events should be able to include singletons, but not be singletons
_.singleton_handler = _.handler;
_.handler = function(target, text, selector, fn) {
	var handler = _.singleton_handler.apply(this, arguments);
	if (handler.singleton) {
		handler.after = function after() {
			if (_.off){ _.off(target, text, fn); }
			handler.fn = _.noop;
		};
		// search target's saved singletons, execute handler upon match
		var saved = target[_._sKey];
		if (saved) {
			for (var i=0,m=saved.length; i<m; i++) {
				var event = saved[i];
				if (_.handles(event, handler)) {
					if (target = _.target(handler, event.target)) {
						_.execute(target, event, handler);
						break;
					}
				}
			}
		}
	}
	return handler;
};

if (document) {
	Eventi.on('DOMContentLoaded', function ready(e) {
		_.fire(document.documentElement, ['^ready'], undefined, e);
	});
}
// add key syntax to _.parse's supported event properties
_.keyRE = /\[([a-z-0-9,\.\/\[\`\\\]\']+)\]/;
_.properties.push([_.keyRE, function parseKey(m, name) {
    var dash, key;
    while ((dash = name.indexOf('-')) > 0) {
        key = name.substring(0, dash);
        name = name.substring(dash+1);
        this[(_.special[key]||key)+'Key'] = true;
    }
    this.keyCode = _.codes[name] || parseInt(name, 10) || 0;
}]);
_.special = { command: 'meta', apple: 'meta' };
_.codes = {
    backspace:8, tab:9, enter:13, shift:16, ctrl:17, alt:18, capsLock:20, escape:27, start:91, command:224,
    pageUp:33, pageDown:34, end:35, home:36, left:37, up:38, right:39, down:40, insert:45, 'delete':46,
    multiply:106, plus:107, minus:109, point:110, divide:111, numLock:144,// numpad controls
    ',':188, '.':190, '/':191, '`':192, '[':219, '\\':220, ']':221, '\'':222, space:32// symbols
};
for (var n=0; n<10; n++){ _.codes['num'+n] = 96+n; }// numpad numbers
for (var f=1; f<13; f++){ _.codes['f'+f] = 111+f; }// function keys
'abcdefghijklmnopqrstuvwxyz 0123456789'.split('').forEach(function(c) {
    _.codes[c] = c.toUpperCase().charCodeAt(0);// ascii keyboard
});
    _.version = "0.1.0";

    // export Eventi (AMD, commonjs, or window/env)
    var define = global.define || _.noop;
    define((global.exports||global).Eventi = Eventi);

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

})(this, this.document);
