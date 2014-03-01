_.on = function(target, events, selector, fn, data) {
    // adjust for absence of selector
    if (typeof selector !== "string") {
        if (fn !== undefined) {
            data = data ? data.unshift(fn) && data : [fn];
        }
        fn = selector; selector = null;
    }
    for (var i=0,m=events.length; i<m; i++) {
        _.handler(target, events[i], selector, fn, data);
    }
};
_.handler = function(target, text, selector, fn, data) {
    //TODO: consider moving selector into match, so we can specifically off delegates
    var handler = { target:target, selector:selector, fn:fn, data:data, text:text, match:{} };
    _.parse(text, handler.match);
    delete handler.match.tags;// superfluous for matching
    if (target !== _) {// ignore internal events
        Eventi.fire(_, 'handler#new', handler);
    }
    // allow handler#new listeners to change these things
    if (handler.fn !== _.noop) {
        _.handlers(handler.target, handler.match.type).push(handler);
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
    for (var i=0, m=handlers.length, handler, target; i<m; i++) {
        if (_.matches(event, (handler = handlers[i]).match)) {
            if (target = _.target(handler, event.target)) {
                _.execute(target, event, handler);
                if (event.immediatePropagationStopped){ i = m; }
            }
        }
    }
};
_.execute = function(target, event, handler) {
    var args = [event];
    if (event.data){ args.push.apply(args, event.data); }
    if (handler.data){ args.push.apply(args, handler.data); }
    try {
        handler.fn.apply(target, args);
    } catch (e) {
        _.async(function(){ throw e; });
    }
};
_.unhandle = function noop(handler){ handler.fn = _.noop; };

_.matches = function(event, match) {
    for (var key in match) {
        if (match[key] !== event[key] && key !== 'singleton') {// more singleton bleed, ick
            return false;
        }
    }
    return true;
};

_.target = function(handler, target) {
    return handler.selector ? _.closest(target, handler.selector) : handler.target;
};
_.closest = function(el, selector) {
    while (el && el.matches) {
        if (el.matches(selector)) {
            return el;
        }
        el = el.parentNode;
    }
};
if (global.Element) {
    var Ep = Element.prototype,
        aS = 'atchesSelector';
    Object.defineProperty(Ep, 'matches', {value:Ep['webkitM'+aS]||Ep['mozM'+aS]||Ep['msM'+aS]});
}   

Eventi.on = _.wrap('on', 4);
