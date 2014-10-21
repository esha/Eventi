_.split.guard['@'] = '@';
_.parsers.unshift([/@([^@]+)(@|$)/, function(event, handler, uri) {
    handler.location = uri;
    if (_.location && event !== handler) {
        _.locationHandler(uri, handler);
    }
}]);
if (global.history && global.location) {
    var intercept = function(name) {
        _[name] = history[name];
        history[name] = function() {
            var ret = _[name].apply(this, arguments);
            _.dispatch(_.global, new CustomEvent('pushstate'));
            return ret;
        };
    };
    intercept('pushState');
    intercept('replaceState');

    var current;
    _.location = function(e) {
        var uri = _.getLocation();
        if (uri !== current) {
            _.dispatch(_.global, new Eventi('location', {
                oldLocation: current,
                location: current = uri,
                srcEvent: e
            }));
        }
    };
    _.getLocation = function() {
        return decodeURI(location.pathname + location.search + location.hash);
    };
    _.setLocation = function(e, uri, fill) {
        // user-fired set events should not have oldLocation prop
        if (!e.oldLocation) {
            if (typeof uri !== "string") {
                fill = uri;
                uri = e.location;
            }
            if (uri) {
                var keys = _.keys(uri);
                if (keys) {
                    uri = keys.reduce(function(s, key) {
                        return s.replace(new RegExp('\\{'+key+'\\}',"g"),
                                         fill[key] || location[key] || '');
                    }, uri);
                }
                // don't share this event with other handlers
                e.stopPropagation();
                e.stopImmediatePropagation();
                history.pushState(null, null, encodeURI(uri));
            }
        }
    };
    _.keys = function(tmpl) {
        var keys = tmpl.match(/\{\w+\}/g);
        return keys && keys.map(function(key) {
            return key.substring(1, key.length-1);
        });
    };
    _.locationHandler = function(uri, handler) {
        var re = uri;
        if (uri.charAt(0) === '`') {
            re = re.substring(1, re.length-1);
        } else {
            re = re.replace(/([.*+?^=!:$(|\[\/\\])/g, "\\$1");// escape uri/regexp conflicts
            if (handler.keys = _.keys(re)) {
                re = re.replace(/\{[\w@\-\.]+\}/g, "([^\/?#]+)");
            } else {
                re.replace(/\{/g, '\\{');
            }
        }
        handler.uriRE = new RegExp(re);
        _.filter(handler, _.locationFilter);
    };
    _.locationFilter = function(event, handler) {
        var matches = (event.location || current).match(handler.uriRE);
        if (matches) {
            this.args.splice.apply(this.args, [1,0].concat(matches));
            if (handler.keys) {
                // put key/match object in place of full match
                this.args[1] = handler.keys.reduce(function(o, key) {
                    o[key] = matches.shift();
                    return o;
                }, { match: matches.shift() });
            }
        } else {
            this.target = undefined;
        }
    };
    var historyTypes = ['popstate','hashchange','pushstate'];
    Eventi.on('!'+(historyTypes.join(' !')), _.location)
    .on('!location', _.setLocation)
    .on(_, 'on:handler', function location(e, handler) {
        var type = handler.event.type;
        if (handler.location && !type) {
            type = handler.event.type = 'location';
        }
        if (type === 'location') {
            handler.global = true;
            // try immediately for current uri match
            if (!current) {
                current = _.getLocation();
            }
            _.execute(new Eventi('location',{location:current, srcEvent:e}), handler);
        } else if (historyTypes.indexOf(type) >= 0) {
            handler.global = true;
        }
    });
}