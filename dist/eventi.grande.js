/*! Eventi - v1.0.1 - 2014-04-07
* https://github.com/nbubna/Eventi
* Copyright (c) 2014 ESHA Research; Licensed MIT */

(function(global, document) {
    "use strict";

    try {
        new global.CustomEvent('test');
    } catch (err) {
        // polyfill CustomEvent constructor
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
        if (!global.Event){ global.Event = global.CustomEvent; }
    }

function Eventi(){ return _.create.apply(this, arguments); }
var _ = {
    global: new Function('return this')(),
    noop: function(){},
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    copy: function(a, b, p) {
        if (typeof a === "object"){ for (p in a){ if (a.hasOwnProperty(p)){ b[p] = a[p]; }}}
    },
    async: (global.setImmediate && setImmediate.bind(global)) ||
           function async(fn){ return setTimeout(fn, 0); },
    resolveRE: /^([\w\$]+)?((\.[\w\$]+)|\[(\d+|'(\\'|[^'])+'|"(\\"|[^"])+")\])*$/,
    resolve: function(reference, context, tested) {
        if (tested || _.resolveRE.test(reference)) {
            context = context || global;
            try {
                return eval('context'+(reference.charAt(0) !== '[' ? '.'+reference : reference));
            } catch (e) {}
        }
    },

    create: function(type, copyThese) {
        var props = { text: type+'' };
        type = _.parse(props.text, props, props);
        _.copy(copyThese, props);
        if (!('bubbles' in props)) {
            props.bubbles = true;// we bubble by default around here
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
    parse: function(type, event, handler) {
        _.parsers.forEach(function(property) {
            type = type.replace(property[0], function() {
                var args = _.slice(arguments, 1);
                args.unshift(event, handler);
                return property[1].apply(event, args) || '';
            });
        });
        return type ? event.type = type : type;
    },
    parsers: [
        [/^(\W*)_/, function(event, handler, other) {
            event.bubbles = false;
            return other;
        }],
        [/\((.*)\)/, function(event, handler, val) {
            try {
                event.detail = _.resolve(val) || JSON.parse(val);
            } catch (e) {
                event.detail = val;
            }
        }],
        [/#(\w+)/g, function(event, handler, tag) {
            (event.tags||(event.tags=[])).push(tag);
            event[tag] = true;
        }],
        [/^(\w+):/, function(event, handler, cat) {//
            event.category = cat;
        }]
    ],

    wrap: function(name, dataIndex) {
        return function wrapper(target) {
            var args = _.slice(arguments);
            if (!target || typeof target === "string" || target instanceof global.Event) {// ensure target
                args.unshift(target = !this || this === Eventi ? _.global : this);
            }
            if (args.length > dataIndex) {// gather ...data the old way
                args[dataIndex] = args.slice(dataIndex);
                args = args.slice(0, dataIndex+1);
            }
            if (!args[1] || typeof args[1] === "string") {
                args[1] = _.split.ter(args[1]);
            }
            var fn = _[name], ret;
            if ('length' in target && target !== _.global) {// apply to each target
                for (var i=0,m=target.length; i<m; i++) {
                    ret = fn.apply(args[0] = target[i], args);
                }
            } else {
                ret = fn.apply(target, args);
            }
            return ret === undefined ? this : ret;// be fluent
        };
    },
    split: {
        guard: { '(':')' },
        ter: function(texts, delims) {
            var parts = [],
                text = '',
                guard;
            if (texts) {
                delims = _.slice(arguments, 1);
                delims.unshift(' ');
                for (var i=0,m=texts.length; i<m; i++) {
                    var c = texts.charAt(i);
                    if (!guard && delims.indexOf(c) >= 0) {
                        if (text) {
                            parts.push(text);
                        }
                        text = '';
                    } else {
                        text += c;
                        if (guard) {
                            if (guard === c) {
                                if (text.charAt(text.length-2) === '\\') {
                                    text = text.replace("\\"+c, c);
                                } else {
                                    guard = null;
                                }
                            }
                        } else {
                            guard = _.split.guard[c];
                        }
                    }
                }
                if (text) {
                    parts.push(text);
                }
            } else {
                parts.push('');
            }
            return parts;
        }
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

_.parsers.unshift([/^(\W*)\//, function(event, handler, other) {
    handler.global = true;
    return other;
}]);
_.fire = function(target, events, data) {
    if (events instanceof Event) {
        events.data = data;
        _.dispatch(target, events);
        return events;
    }
    return _.fireAll(target, events, {data:data});
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
    if (event.global){ target = _.global; }
    (target.dispatchEvent || target[_key] || _.noop).call(target, event);
    if (target.parentObject && event.bubbles && !event.propagationStopped) {
        _.dispatch(target.parentObject, event, true);
    }
    // icky test/call, but lighter than wrapping or firing internal event
    if (!objectBubbling && event.singleton) {
        _.singleton(target, event);
    }
};
Eventi.fire = _.wrap('fire', 2);
_.parsers.unshift([/^(\W*)\!/, function(e, handler, other) {//
    handler.important = true;
    return other;
}]);
_.on = function(target, events, fn, data) {
    if (!Array.isArray(events)) {
        if (fn !== undefined) {
            data = data ? data.unshift(fn) && data : [fn];
        }
        for (var event in events) {
            _.handler(target, event, events[event], data);
        }
    } else {
        for (var i=0,m=events.length; i<m; i++) {
            _.handler(target, events[i], fn, data);
        }
    }
};
_.handler = function(target, text, fn, data) {
    var handler = { target:target, fn:fn, data:data, text:text, event:{} };
    _.parse(text, handler.event, handler);
    delete handler.event.tags;// superfluous for handlers
    if (target !== _) {// ignore internal events
        Eventi.fire(_, 'on:handler', handler);
    }
    // allow on:handler listeners to change these things
    if (handler.fn !== _.noop) {
        target = handler.global === true ? _.global : handler.target;
        _.handlers(target, handler.event.type).push(handler);
    }
    return handler;
};
_.handlers = function(target, type) {
    var listener = _.listener(target),
        handlers = listener.s[type];
    if (!handlers) {
        handlers = listener.s[type] = [];
        if (target.addEventListener) {
            target.addEventListener(type, listener);
        }
    }
    return handlers;
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
    for (var i=0, handler; i<handlers.length; i++) {
        if (_.matches(event, (handler = handlers[i]).event)) {
            _.execute(event, handler);
            if (event.immediatePropagationStopped){ break; }
        }
    }
};
_.execute = function(event, handler) {
    var args = [event],
        fn = handler.fn,
        call = { target: handler.target, args:args };
    if (event.data){ args.push.apply(args, event.data); }
    if (handler.data){ args.push.apply(args, handler.data); }
    if (handler.filters) {
        for (var i=0,m=handler.filters.length; i<m && call.target; i++) {
            handler.filters[i].call(call, event, handler);
        }
    }
    if (call.target) {
        try {
            fn.apply(call.target, call.args);
        } catch (e) {
            _.async(function(){ throw e; });
        }
        if (handler.end && handler.end.apply(call.target, call.args)) {
            _.unhandle(handler);
        }
    }
};
_.filter = function(handler, fn) {
    handler.filters = handler.filters || [];
    handler.filters.push(fn);
};
_.unhandle = function noop(handler){ handler.fn = _.noop; };
_.matches = function(event, match) {
    for (var key in match) {
        if (match[key] !== event[key]) {
            return false;
        }
    }
    return true;
};

Eventi.on = _.wrap('on', 3);

_.split.guard['<'] = '>';
_.parsers.unshift([/<(.+)>/, function(event, handler, selector) {
    handler.selector = selector;
    if (_.delegate && event !== handler) {
        _.filter(handler, _.delegate);
    }
}]);
if (global.Element) {
    _.delegate = function delegate(event, handler) {
        this.target = _.closest(event.target, handler.selector);
    };
    _.closest = function(el, selector) {
        while (el && el.matches) {
            if (el.matches(selector)) {
                return el;
            }
            el = el.parentNode;
        }
    };

    var Ep = Element.prototype,
        aS = 'atchesSelector';
    if (!Ep['matches']) {
        Object.defineProperty(Ep, 'matches', {value:Ep['webkitM'+aS]||Ep['mozM'+aS]||Ep['msM'+aS]});
    }
}   

_.parsers.unshift([/=>(\w+)$/, function(event, handler, alias) {
    handler.alias = alias;
    if (handler !== event) {
        handler.data = handler.data || [];
        handler.data.push(alias);
    }
}]);
if (document) {
    _.init = function init() {
        var nodes = document.querySelectorAll('[data-eventi]');
        for (var i=0,m=nodes.length; i<m; i++) {
            var target = nodes[i],
                mapping = target.getAttribute('data-eventi');
            if (mapping !== target.eventi) {
                if (_.off && target.eventi) {
                    Eventi.off(target, target.eventi, _.declared);
                }
                target.eventi = mapping;
                _.declare(target, mapping);
            }
        }
        if (nodes.length || document.querySelectorAll('[click]').length) {
            Eventi.on('click keyup', _.check);
        }
    };
    _.declare = function(target, mapping) {// register listener
        var texts = _.split.ter(mapping);
        for (var i=0,m=texts.length; i<m; i++) {
            Eventi.on(target, texts[i], _.declared);
        }
    };
    _.declared = function(e, alias) {// lookup handlers
        alias = typeof alias === "string" ? alias : e.type;
        var nodes = _.declarers(this, alias, e.target);
        for (var i=0,m=nodes.length; i<m; i++) {
            _.respond(nodes[i], alias, e);
        }
    };
    _.declarers = function(target, alias, node) {
        var query = '['+alias+']',
            // gather matching parents up to the target
            nodes = [],
            descendant = false;
        while (node && node.matches) {
            if (node.matches(query)) {
                nodes.push(node);
            }
            if (node === target) {
                descendant = true;
                break;
            }
            node = node.parentNode;
        }
        // if node isn't a descendant of target, handler must be global
        return descendant ? nodes : target.querySelectorAll(query);
    };
    _.respond = function(node, alias, e) {// execute handler
        var response = node.getAttribute(alias);
        if (response) {
            var fn = _.resolve(response, node) || _.resolve(response);
            if (typeof fn === "function") {
                fn.call(node, e);
            } else {
                Eventi.fire(node, response, e);
            }
        }
    };
    _.check = function(e) {
        var click = e.target.getAttribute &&
                    ((e.type === 'click' && _.click(e.target)) ||
                     (e.keyCode === 13 && _.click(e.target, true)));
        if (click) {
            _.declared.call(document.documentElement, e, 'click');
            if (click === 'noDefault' && !_.allowDefault(e.target)) {
                e.preventDefault();
            }
        }
    };
    _.allowDefault = function(el) {
        return el.type === 'radio' || el.type === 'checkbox';
    };
    _.click = function(el, enter) {
        // click attributes with non-false value override everything
        var click = el.getAttribute('click');
        if (click && click !== "false") {
            return 'noDefault';
        }
        // editables, select, textarea, non-button inputs all use click to alter focus w/o action
        // textarea and editables use enter to add a new line w/o action
        // a[href], buttons, button inputs all automatically dispatch 'click' on enter
        // in all three situations, dev must declare on element, not on parent to avoid insanity
        if (!el.isContentEditable) {
            var name = el.nodeName.toLowerCase();
            return name !== 'textarea' &&
                   (name !== 'select' || enter) &&
                   (enter ? (name !== 'a' || !el.getAttribute('href')) &&
                            name !== 'button' &&
                            (name !== 'input' || !_.buttonRE.test(el.type))
                          : name !== 'input' || _.buttonRE.test(el.type));
        }
    };
    _.buttonRE = /^(submit|button|reset)$/;

    Eventi.on('DOMContentLoaded', _.init);
}

// add singleton to _.parse's supported event properties
_.parsers.unshift([/^(\W*)\^/, function(event, handler, other) {
	handler.singleton = true;
	if (event !== handler) {
		_.filter(handler, _.before);
	}
	return other;
}]);

// _.fire's _.dispatch will call this when appropriate
_.singleton = function(target, event) {
	_.remember(target, event);
	if (event.bubbles && !event.propagationStopped && target !== _.global) {
		_.singleton(target.parentNode || target.parentObject || _.global, event);
	}
};
var _skey = _._skey = '^'+_key;
_.remember = function remember(target, event) {
	var saved = target[_skey] || [];
	if (!saved.length) {
		Object.defineProperty(target, _skey, {value:saved,configurable:true});
	}
	event[_skey] = true;
	saved.push(event);
};
_.before = function singleton(event, handler) {
	_.unhandle(handler);
	handler.fn = _.noop;// tell _.handler not to keep this
	if (!event[_skey]) {// remember this non-singleton as singleton for handler's sake
		_.remember(this.target, event);
	}
};

Eventi.on(_, 'on:handler', function singleton(e, handler) {
	if (handler.singleton) {
		// search target's saved singletons, execute handler upon match
		var saved = handler.target[_skey]||[];
		for (var i=0,m=saved.length; i<m; i++) {
			var event = saved[i];
			if (_.matches(event, handler.event)) {
				_.execute(event, handler);
				break;
			}
		}
	}
});

if (document) {
	Eventi.on('DOMContentLoaded', function ready(e) {
		Eventi.fire(document.documentElement, '^ready', e);
	});
}
_.split.guard['['] = ']';
_.parsers.push([/\[([^ ]+)\]/, function(event, handler, key) {//'
    var dash;
    while ((dash = key.indexOf('-')) > 0) {
        event[key.substring(0, dash)+'Key'] = true;
        key = key.substring(dash+1);
    }
    if (key) {
        event.keyCode = _.codes[key] || parseInt(key, 10) || key;
    }
}]);
_.codes = {
    backspace:8, tab:9, enter:13, shift:16, ctrl:17, alt:18, capsLock:20, escape:27, start:91, command:224,
    pageUp:33, pageDown:34, end:35, home:36, left:37, up:38, right:39, down:40, insert:45, 'delete':46,
    multiply:106, plus:107, minus:109, point:110, divide:111, numLock:144,// numpad controls
    ';':186, '=':187, ',':188, '-':189, '.':190, '/':191, '`':192, '[':219, '\\':220, ']':221, '\'':222, space:32// symbols
};
for (var n=0; n<10; n++){ _.codes['num'+n] = 96+n; }// numpad numbers
for (var f=1; f<13; f++){ _.codes['f'+f] = 111+f; }// function keys
'abcdefghijklmnopqrstuvwxyz 0123456789'.split('').forEach(function(c) {
    _.codes[c] = c.toUpperCase().charCodeAt(0);// ascii keyboard
});
_.split.guard['@'] = '@';
_.parsers.unshift([/@([^@]+)(@|$)/, function(event, handler, uri) {
    handler.location = uri;
    if (_.location && event !== handler) {
        _.locationHandler(uri, handler);
    }
}]);
if (global.history && global.location) {
    var current;
    _.pushState = history.pushState;
    history.pushState = function() {
        var ret = _.pushState.apply(this, arguments);
        _.dispatch(_.global, new CustomEvent('pushstate'));
        return ret;
    };
    _.location = function(e, uri) {
        uri = uri || decodeURI(location.pathname + location.search + location.hash);
        if (uri !== current) {
            _.dispatch(_.global, new Eventi('location', {
                oldLocation: current,
                location: current = uri,
                srcEvent: e
            }));
        }
        return current;
    };
    _.setLocation = function(e, uri, fill) {
        if (typeof uri !== "string") {
            fill = uri;
            uri = e.location;
        }
        if (uri) {
            var keys = _.keys(uri);
            if (keys) {
                uri = keys.reduce(function(s, key) {
                    return s.replace(new RegExp('\\{'+key+'\\}',"g"),
                                     fill[key] || location[key] || '');
                }, uri);
            }
            if (uri !== current) {
                history.pushState(null, null, encodeURI(uri));
            }
        }
    };
    _.keys = function(tmpl) {
        var keys = tmpl.match(/\{\w+\}/g);
        return keys && keys.map(function(key) {
            return key.substring(1, key.length-1);
        });
    };
    _.locationHandler = function(uri, handler) {
        var re = uri;
        if (uri.charAt(0) === '`') {
            re = re.substring(1, re.length-1);
        } else {
            re = re.replace(/([.*+?^=!:$(|\[\/\\])/g, "\\$1");// escape uri/regexp conflicts
            if (handler.keys = _.keys(re)) {
                re = re.replace(/\{\w+\}/g, "([^\/?#]+)");
            } else {
                re.replace(/\{/g, '\\{');
            }
        }
        handler.uriRE = new RegExp(re);
        _.filter(handler, _.locationFilter);
    };
    _.locationFilter = function(event, handler) {
        var matches = (event.uri || current).match(handler.uriRE);
        if (matches) {
            this.args.splice.apply(this.args, [1,0].concat(matches));
            if (handler.keys) {
                // put key/match object in place of full match
                this.args[1] = handler.keys.reduce(function(o, key) {
                    o[key] = matches.shift();
                    return o;
                }, { match: matches.shift() });
            }
        } else {
            this.target = undefined;
        }
    };
    Eventi.on('!popstate !hashchange !pushstate', _.location)
    .on('!location', _.setLocation)
    .on(_, 'on:handler', function location(e, handler) {
        if (handler.event.type === 'location') {
            // force global
            handler.global = true;
            // try for current uri match immediately
            if (!current) {
                _.location();
            }
            _.execute(new Eventi('location',{location:current, srcEvent:e}), handler);
        }
    });
}
    _.version = "1.0.1";

    var sP = (global.Event && Event.prototype.stopPropagation) || _.noop,
        sIP = (global.Event && Event.prototype.stopImmediatePropagation) || _.noop;
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
