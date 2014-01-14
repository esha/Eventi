_.off = function(target, events, fn) {
	if (!events) {
		return _.wipe(target);
	}

	var listeners = _.listener(target).s;
	for (var i=0,m=events.length; i<m; i++) {
		var type = events[i],
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
			_.cleaned(handlers.splice(i--, 1)[0]);
		}
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
_.cleaned = _.noop;// extension hook (called with cleaned handler as arg)

Eventi.off = _.wrap(_.off, 3);
