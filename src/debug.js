(function() {
var _ = Eventi._,
    out = console.log.bind(console);
_.debug = function(target, events, fn, data) {
    var listener = target[_._key],
        ret = [];
    if (listener) {
        for (var i=0, m=events.length; i<m; i++) {
            var info = {};
            if (events[i]) {
                _.parse(info.text = events[i],
                        info.event = {},
                        info.handler = {});
                if (typeof fn !== "function") {
                    data = fn; fn = undefined;
                }
                info.data = data;
                info.handlers = _.debug.handlers(info.event.type, info, listener);
            } else {
                info = [];
                var filter = {event:{},handler:{}};
                for (var type in listener.s) {
                    info.push.apply(info, _.debug.handlers(type, filter, listener));
                }
            }
            ret.push(info);
        }
    }
    if (!fn) {
        fn = out;
    }
    ret.forEach(function(info) {
        if (info.text) {
            fn(_.debug.target(target), info.text, info.event, info.handler, info.handlers);
        } else {
            info.forEach(function(handler) {
                fn(_.debug.target(handler.target), handler.text, handler);  
            });
        }
    });
    return ret.length > 1 ? ret : ret[0];
};
_.debug.target = function(target) {
    return target === window ? '' : target;
};
_.debug.handlers = function(type, filter, listener) {
    var handlers = listener.s[type],
        list = [];
    if (handlers) {
        for (var i=0, m=handlers.length; i<m; i++) {
            if (_.debug.match(handlers[i], filter)) {
                list.push(handlers[i]);
            }
        }
    }
    return list;
};
_.debug.match = function(handler, filter) {
    return _.matches(handler.event, filter.event) &&
           _.matches(handler, filter.handler) &&
           (!handler.important || (filter.handler.important &&
                                   _.matches(filter.event, handler.event))) &&
           (!filter.fn || filter.fn === handler.fn);
};
Eventi.debug = _.wrap('debug', 3);
out('Eventi, version '+_.version);
Eventi.debug();// show global handlers automatically
})();