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

Eventi.on(_, 'handler#new', function singleton(e, handler) {
	if (handler.match.singleton) {
		var fn = handler._fn = handler.fn;
		handler.fn = function singleton(e) {
			_.unhandle(handler);
			if (!e[_skey]) {// remember this non-singleton as singleton for handler's sake
				_.remember(handler.target, e);
			}
			fn.apply(this, arguments);
		};

		// search target's saved singletons, execute handler upon match
		var saved = handler.target[_skey]||[];
		for (var i=0,m=saved.length; i<m; i++) {
			var event = saved[i];
			if (_.matches(event, handler.match)) {
				var target = _.target(handler, event.target);
				if (target) {
					_.execute(target, event, handler);
					handler.fn = _.noop;// tell _.handler not to keep this
					break;
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