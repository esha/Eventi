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
		if (_.cleans(handler[i], filter)) {
			handlers.splice(i--, 1);
		}
	}
	if (!handlers.length && filter.target.removeEventListener) {
		filter.target.removeEventListener(type, listener);
		return true;
	}
};
_.cleans = function(handler, filter) {
	return _.handles(handler, filter) &&
		(!filter.detail || handler.detail === filter.detail) &&
		(!filter.fn || handler.fn === filter.fn);
}

Eventier.off = _.fixArgs(3, _.off);
