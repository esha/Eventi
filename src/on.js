_.parsers.unshift([/^(\W*)\!/, function(e, handler, other) {//
    handler.important = true;
    return other;
}]);
_.on = function(target, events, fn, data) {
    for (var i=0,m=events.length; i<m; i++) {
        _.handler(target, events[i], fn, data);
    }
};
_.handler = function(target, text, fn, data) {
    var handler = { target:target, fn:fn, data:data, text:text, event:{} };
    _.parse(text, handler.event, handler);
    delete handler.event.tags;// superfluous for handlers
    if (target !== _) {// ignore internal events
        Eventi.fire(_, 'on:handler', handler);
    }
    // allow on:handler listeners to change these things
    if (handler.fn !== _.noop) {
        target = handler.global === true ? _.global : handler.target;
        _.handlers(target, handler.event.type).push(handler);
    }
    return handler;
};
_.handlers = function(target, type) {
    var listener = _.listener(target),
        handlers = listener.s[type];
    if (!handlers) {
        handlers = listener.s[type] = [];
        if (target.addEventListener) {
            target.addEventListener(type, listener);
        }
    }
    return handlers;
};

var _key = _._key = '_eventi'+Date.now();
_.listener = function(target) {
    var listener = target[_key];
    if (!listener) {
        listener = function(event) {
            var handlers = listener.s[event.type];
            if (handlers){ _.handle(event, handlers); }
        };
        listener.s = {};
        Object.defineProperty(target, _key, {
            value:listener, writeable:false, configurable:true
        });
    }
    return listener;
};
_.handle = function(event, handlers) {
    for (var i=0, handler; i<handlers.length; i++) {
        if (_.matches(event, (handler = handlers[i]).event)) {
            _.execute(event, handler);
            if (event.immediatePropagationStopped){ break; }
        }
    }
};
_.execute = function(event, handler) {
    var args = [event],
        fn = handler.fn,
        call = { target: handler.target, args:args };
    if (event.data){ args.push.apply(args, event.data); }
    if (handler.data){ args.push.apply(args, handler.data); }
    if (handler.filters) {
        for (var i=0,m=handler.filters.length; i<m && call.target; i++) {
            handler.filters[i].call(call, event, handler);
        }
    }
    if (call.target) {
        try {
            fn.apply(call.target, call.args);
        } catch (e) {
            _.async(function(){ throw e; });
        }
        if (handler.end && handler.end.apply(call.target, call.args)) {
            _.unhandle(handler);
        }
    }
};
_.filter = function(handler, fn) {
    handler.filters = handler.filters || [];
    handler.filters.push(fn);
};
_.unhandle = function noop(handler){ handler.fn = _.noop; };
_.matches = function(event, match) {
    for (var key in match) {
        if (match[key] !== event[key]) {
            return false;
        }
    }
    return true;
};

Eventi.on = _.wrap('on', 3);
