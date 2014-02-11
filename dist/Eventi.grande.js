/*! Eventi - v0.1.0 - 2014-02-10
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
        event.stopImmediatePropagation = _.sIP;//TODO: consider prototype extension
        return event;
    },
    skip: 'bubbles cancelable detail type'.split(' '),
    prop: function(prop){ return prop; },// only an extension hook
    sIP: function() {
        this.immediatePropagationStopped = true;
        (Event.prototype.stopImmediatePropagation || _.noop).call(this);
    },
    parse: function(type, props) {
        _.properties.forEach(function(property) {
            type = type.replace(property[0], function() {
                return property[1].apply(props, arguments) || '';
            });
        });
        return type ? props.type = type : type;
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
_.dispatch = function(target, event) {
    (target.dispatchEvent || target[_._key] || _.noop).call(target, event);
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
	return handler;
};
_._key = 'Eventi'+Math.random();
_.listener = function(target) {
    var listener = target[_._key];
    if (!listener) {
		listener = function(event){ _.handle(event, listener.s[event.type]||[]); };
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
};
_.execute = function(target, event, handler) {
	var args = [event];
	if (event.data){ args.push.apply(args, event.data); }
	if (handler.data){ args.push.apply(args, handler.data); }
	try {
		handler.fn.apply(target, args);
	} catch (e) {
		setTimeout(function(){ throw e; }, 0);
	}
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
    _.declare = function(mapping, mapper) {// register listener
        var types = mapping.split(_.splitRE);
        for (var i=0,m=types.length; i<m; i++) {
            var type = types[i],
                eq = type.lastIndexOf('='),
                alias = eq > 0 ? type.substring(eq+1) : undefined,
                global = type.charAt(0) === '/',
                context = global ? _.global : mapper;
            mapper = mapper || document;
            if (alias){ type = type.substring(0, eq); }
            if (global){ type = type.substring(1); }
            Eventi.on(context, type, _.mapped, mapper, alias);
        }
    };
    _.mapped = function(e, mapper, alias) {// lookup handlers
        var type = alias || e.type,
            nodes = _.declarers(mapper, type, this !== _.global && e.target);
        for (var i=0,m=nodes.length; i<m; i++) {
            _.declared(nodes[i], type, e);
        }
    };
    _.declarers = function(mapper, type, target) {
        var query = '['+type+']';
        if (target) {
            // gather matching parents up to the mapper
            var nodes = [];
            while (target && target.matches && target !== mapper.parentNode) {
                if (target.matches(query)) {
                    nodes.push(target);
                }
                target = target.parentNode;
            }
            return nodes;
        }
        // gather all declarations within the mapper
        return mapper.querySelectorAll(query);
    };
    _.declared = function(node, type, e) {// execute handler
        var response = node.getAttribute(type);
        if (response) {
            response = _.resolve(response, node) || _.resolve(response) || response;
            if (typeof response === "function") {
                response.call(node, e);
            } else {
                Eventi.fire(node, response, e);
            }
        }
    };
    _.check = function(e) {
        if ((e.type === 'click' && _.click(e.target)) ||
            (e.keyCode === 13 && _.click(e.target, true))) {
            _.mapped(e, document.documentElement, 'click');
            // someone remind me why i've always done this?
            if (!_.allowDefault(e)) {
                e.preventDefault();
            }
        }
    };
    _.allowDefault = function(e) {
        var inputType = e.target.type;
        return inputType && (inputType === 'radio' || inputType === 'checkbox');
    };
    _.click = function(el, enter) {
        // click attributes with non-false value override everything
        var click = el.getAttribute('click');
        if (click && click !== "false") {
            return true;
        }
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
