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
