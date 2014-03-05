_.off = function(target, events, fn) {
    //TODO: support filtering by selector/location
    var listener = target[_key];
    if (listener) {
        for (var i=0, m=events.length; i<m; i++) {
            var filter = { fn:fn, match:{} },
            type = _.parse(events[i], filter.match);
            delete filter.match.tags;// superfluous for matching
            if (type) {
                _.clean(type, filter, listener, target);
            } else {
                for (type in listener.s) {
                    _.clean(type, filter, listener, target);
                }
            }
        }
        if (_.empty(listener.s)) {
            delete target[_key];
        }
    }
};
_.unhandle = function off(handler) {
    _.off(handler.target, [handler.text], handler._fn||handler.fn);
};
_.empty = function(o){ for (var k in o){ return !k; } return true; };
_.clean = function(type, filter, listener, target) {
    var handlers = listener.s[type];
    if (handlers) {
        for (var i=0, m=handlers.length; i<m; i++) {
            if (_.cleans(handlers[i], filter)) {
                var cleaned = handlers.splice(i--, 1)[0];
                if (target !== _) {// ignore internal events
                    Eventi.fire(_, 'handler#off', cleaned);
                }
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
    return _.matches(handler.match, filter.match, true) &&
           (!filter.fn || filter.fn === (handler._fn||handler.fn));
};
Eventi.off = _.wrap('off', 3);