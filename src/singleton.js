// add singleton to _.parse's supported event properties
_.properties.unshift([/^\^/, function singleton(){ this.singleton = true; }]);

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

Eventi.on(_, 'handler#new', function singletonHandler(e, handler) {
	if (handler.match.singleton) {
		delete handler.match.singleton;// singleton never needs matching
		var fn = handler._fn = handler.fn,
			target = handler.target;
		handler.fn = function single(e) {
			_.unhandle(handler);
			if (!e[_skey]) {// remember this non-singleton as singleton for handler's sake
				_.remember(target, e);
			}
			fn.apply(this, arguments);
		};

		// search target's saved singletons, execute handler upon match
		var saved = target[_skey]||[];
		for (var i=0,m=saved.length; i<m; i++) {
			var event = saved[i];
			if (_.matches(event, handler.match)) {
				var etarget = _.target(handler, event.target);
				if (etarget) {
					return _.execute(etarget, event, handler);
				}
			}
		}
	}
});

if (document) {
	Eventi.on('DOMContentLoaded', function ready(e) {
		_.fire(document.documentElement, ['^ready'], undefined, [e]);
	});
}