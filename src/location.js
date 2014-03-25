var h = global.history,
    l = global.location;
_.pushState = h.pushState;
h.pushState = function() {
    var ret = _.pushState.apply(this, arguments);
    _.dispatch(_.global, new Eventi('pushstate', {uri:arguments[2]}));
    return ret;
};
Eventi.on('!popstate !hashchange !pushstate', _.at = function(e, uri) {
    uri = uri || decodeURI(l.pathname + l.search + l.hash);
    if (uri !== _.uri) {
        _.dispatch(_.global, new Eventi('location', {
            oldURI: _.uri,
            uri: _.uri = uri,
            srcEvent: e
        }));
    }
    return uri;
})
.on('!location', function setUri(e, uri, fill) {
    if (typeof uri === "string") {
        var keys = _.keys(uri);
        if (keys) {
            uri = keys.reduce(function(s, key) {
                return s.replace(new RegExp('\\{'+key+'\\}',"g"),
                                 fill[key] || global.location[key] || '');
            }, uri);
        }
        e.uri = uri;
        if (uri !== _.uri) {
            h.pushState(null,null, encodeURI(uri));
        }
    } else if (!e.uri) {
        e.uri = _.uri;
    }
})
.on(_, 'handler#new', function location(e, handler) {
    if (handler.event.type === "location") {
        // always listen on window, but save given target to use as context
        handler._target = handler.target;
        handler.target = _.global;
        if (handler.selector) {
            // overloading on.js' selector argument with uri template/regex
            var re = handler.selector;
            delete handler.selector;
            if (typeof re === "string") {
                re = re.replace(/([.*+?^=!:$(|\[\/\\])/g, "\\$1");
                if (handler.keys = _.keys(re)) {
                    re = re.replace(/\{\w+\}/g, "([^\/?#]+)");
                } else {
                    re.replace(/\{/g, '\\{');
                }
                re = new RegExp(re);
            }
            handler.regexp = re;
        } else {
            handler.regexp = /.+/;
        }
        handler._fn = handler.fn;
        handler.fn = function(e){ _.location(e.uri, handler, arguments); };
        // try for current uri match immediately
        _.execute(new Eventi('location',{uri:_.uri||_.at()}), handler);
    }
});
_.keys = function(tmpl) {
    var keys = tmpl.match(/\{\w+\}/g);
    return keys && keys.map(function(key) {
        return key.substring(1, key.length-1);
    });
};
_.location = function(uri, handler, args) {
    var matches = (uri||_.uri).match(handler.regexp);
    if (matches) {
        args = _.slice(args);
        args.splice.apply(args, [1,0].concat(matches));
        if (handler.keys) {
            // put key/match object in place of full match
            args[1] = handler.keys.reduce(function(o, key) {
                o[key] = matches.shift();
                return o;
            }, { match: matches.shift() });
        }
        handler._fn.apply(handler._target, args);
    }
};