_.on = function(target, sequence, selector, fn, data) {
	if (typeof selector !== "string") {
		data = fn;
		fn = selector;
	}
	var listener = _.listener(target);
	for (var i=0,m=sequence.length; i<m; i++) {
		var type = sequence[i],
			handler = {
				target: target,
				selector: selector,
				fn: fn,
				data: data
			};
		type = handler.type = _.parse(type, handler);

		var handlers = listener.s[type];
		if (!handlers) {
			handlers = listener.s[type] = [];
			if (target.addEventListener) {
				target.addEventListener(type, listener);
			}
		}
		handlers.push(handler);
	}
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
	for (var i=0, m=handlers.length, handler, error, target, args; i<m; i++) {
		if (_.handles(event, (handler = handlers[i]))) {
			if (target = _.target(handler, event.target)) {
				args = [event];
				if (event.data){ args.push.apply(args, event.data); }
				if (handler.data){ args.unshift.apply(args, handler.data); }
				try {
					handler.fn.apply(target, args);
				} catch (e) {
					if (!error){ error = e; }
				}
				if (event.immediatePropagationStopped){ i = m; }
			}
		}
	}
	if (error) {
		throw error;
	}
	return !event.defaultPrevented;
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

Eventier.on = _.fixArgs(4, _.on);
