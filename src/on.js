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
