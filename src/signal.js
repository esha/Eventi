// memoizes results
_.signal = function(type) {
	return _.signal[type] || (_.signal[type] = function signal(target) {
		var args = _.slice(arguments),
			index = this.index || 1;
		if (typeof target !== "object" || !(target.dispatchEvent || target[_key])) {
			index--;
		}
		args.splice(index, 0, type);
		return this.apply(null, args);
	});
};
// a simple, more debugging-friendly bind
_.bind = function(o, fn) {
	var bound = function bound(){ return fn.apply(o, arguments); };
	bound.index = fn.index;// keep index for _.signal to use
	return bound;
};
(Eventi.signal = function(o) {
	var signals = _.slice(arguments);
	if (typeof o === "string") {
		o = Eventi;
	}
	for (var p in Eventi) {
		var fn = o[p];
		if (typeof fn === "function" && !fn.utility) {
			if (o !== Eventi && fn === Eventi[p]) {
				// use local copy of fn to bind context and avoid shared signals
				fn = o[p] = _.bind(o, fn);
			}
			for (var i=0,m=signals.length; i<m; i++) {
				var type = signals[i];
				fn[type] = _.signal(type);
			}
		}
	}
}).utility = true;