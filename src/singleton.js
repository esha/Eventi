// add singleton to _.parse's supported event properties
_.singletonRE = /^_?\^/;
_.properties.splice(1,0, [_.singletonRE, function(){ this.singleton = true; }]);

// wrap _.fire's _.dispatch to save singletons with node and all parents
_.singleton_dispatch = _.dispatch;
_.dispatch = function(target, event) {
	_.singleton_dispatch(target, event);
	if (event.singleton) {
		do {
			var saved = target[_._sKey];
			if (saved) {
				saved.push(event);
			} else {
				Object.defineProperty(target, _._sKey, {value:[event],configurable:true});
			}
		} while (target = target.parentNode);
	}
};
_._sKey = _._key+'s.e.';

// wrap _.on's _.handler to execute fired singletons immediately
//TODO: ensure that combo.js wraps this _.handler instead of vice versa
//      combo events should be able to include singletons, but not be singletons
_.singleton_handler = _.handler;
_.handler = function(target, text, selector, fn) {
	var handler = _.singleton_handler.apply(this, arguments);
	if (handler.singleton) {
		handler.after = function after() {
			if (_.off){ _.off(target, text, fn); }
			handler.fn = _.noop;
		};
		// search target's saved singletons, execute handler upon match
		var saved = target[_._sKey];
		if (saved) {
			for (var i=0,m=saved.length; i<m; i++) {
				var event = saved[i];
				if (_.handles(event, handler)) {
					if (target = _.target(handler, event.target)) {
						_.execute(target, event, handler);
						break;
					}
				}
			}
		}
	}
	return handler;
};

if (document) {
	Eventi.on('DOMContentLoaded', function ready(e) {
		_.fire(document.documentElement, ['^ready'], e, e);
	});
}