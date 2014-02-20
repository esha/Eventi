// add singleton to _.parse's supported event properties
_.properties.unshift([/^\^/, function singleton(){ this.singleton = true; }]);

// _.fire's _.dispatch will call this when appropriate
_.singleton = function(target, event) {
	_.remember(target, event);
	if (event.bubbles && target !== _.global) {
		_.singleton(target.parentNode || target.parentObject || _.global, event);
	}
};
var _skey = _._skey = '^'+_key;
_.remember = function remember(target, event) {
	global.console.log(event.type, 'remember', target, event.timeStamp);
	if (!target[_skey]) {
		var saved = target[_skey];
		event[_skey] = true;
		if (saved) {
			saved.push(event);
		} else {
			Object.defineProperty(target, _skey, {value:[event],configurable:true});
		}
	}
};

Eventi.on(_, 'handler#new', function singletonHandler(e, handler) {
	if (handler.match.singleton) {
		delete handler.match.singleton;// singleton never needs matching
		var fn = handler.fn,
			target = handler.target;
		handler.fn = function single(e) {
			if (_.off){ _.off(target, [handler.text], fn); }
			handler.fn = _.noop;
			_.remember(target, e);
			fn.apply(this, arguments);
		};
global.console.log(handler.match.type, 'handler', target, target[_skey]);
		// search target's saved singletons, execute handler upon match
		var saved = target[_skey];
		if (saved) {
global.console.log('saved', target, saved.length);
			for (var i=0,m=saved.length,stop; i<m && !stop; i++) {
				stop = _.remembered(target, saved[i], handler);
if (stop){ global.console.log(handler.match.type, 'remembered', target); }
			}
		}
	}
});
_.remembered = function(target, event, handler) {
	if (_.matches(event, handler.match)) {
		if (target = _.target(handler, event.target)) {
			return _.async(function() {
				_.execute(target, event, handler);
			});
		}
	}
};

if (document) {
	Eventi.on('DOMContentLoaded', function ready(e) {
		_.fire(document.documentElement, ['^ready'], undefined, [e]);
	});
}