_.off = function(target, events, fn) {
	var listener = target[_._key];
	if (listener) {
		for (var i=0, m=events.length; i<m; i++) {
			var filter = { fn:fn },
				type = _.parse(events[i], filter.match = {});
			if (type) {
				_.clean(type, filter, listener, target);
			} else {
				for (type in listener.s) {
					_.clean(type, filter, listener, target);
				}
			}
		}
		if (_.empty(listener.s)) {
			delete target[_._key];
		}
	}
};
_.empty = function(o){ for (var k in o){ return !k; } return true; };
_.clean = function(type, filter, listener, target) {
	var handlers = listener.s[type];
	if (handlers) {
		for (var i=0, m=handlers.length; i<m; i++) {
			if (_.cleans(handlers[i], filter)) {
				_.cleaned(handlers.splice(i--, 1)[0]);
				m--;
			}
		}
		if (!handlers.length) {
			if (target.removeEventListener) {
				target.removeEventListener(type, listener);
			}
			delete listener.s[type];
		}
	}
};
_.cleans = function(handler, filter) {
	return _.matches(handler.match, filter.match) && (!filter.fn || handler.fn === filter.fn);
};
_.cleaned = _.noop;// extension hook (called with cleaned handler as arg)

Eventi.off = _.wrap('off', 3);
