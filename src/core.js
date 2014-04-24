function Eventi(text){
    if (typeof text === "string") {
        return _.create.apply(_, arguments);
    }
    return Eventi.fy(this);
}
Eventi.toString = Eventi.prototype.toString = function(){ return 'Eventi, v'+_.version; };
Eventi.fy = function fy(o) {
    for (var p in _.fns) {
        Object.defineProperty(o, p, {value:Eventi[p], writable:true, configurable:true});
    }
    return o;
};

var _ = Eventi._ = {
    version: "<%= pkg.version %>",
    global: new Function('return this')(),
    noop: function(){},
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    copy: function(a, b, p) {
        if (typeof a === "object"){ for (p in a){ if (a.hasOwnProperty(p)){ b[p] = a[p]; }}}
    },
    async: (global.setImmediate && setImmediate.bind(global)) ||
           function async(fn){ return setTimeout(fn, 0); },
    resolveRE: /^([\w\$]+)?((\.[\w\$]+)|\[(\d+|'(\\'|[^'])+'|"(\\"|[^"])+")\])*$/,
    resolve: function(reference, context, tested) {
        if (tested || _.resolveRE.test(reference)) {
            context = context || global;
            try {
                return eval('context'+(reference.charAt(0) !== '[' ? '.'+reference : reference));
            } catch (e) {}
        }
    },

    create: function(type, copyThese) {
        var props = { text: type+'' };
        type = _.parse(props.text, props, props);
        _.copy(copyThese, props);
        if (!('bubbles' in props)) {
            props.bubbles = true;// we bubble by default around here
        }

        var event = new CustomEvent(type, props);
        for (var prop in props) {
            if (_.skip.indexOf(prop) < 0) {
                event[_.prop(prop)] = props[prop];
            }
        }
        return event;
    },
    skip: 'bubbles cancelable detail type'.split(' '),
    prop: function(prop){ return prop; },// only an extension hook
    parse: function(type, event, handler) {
        _.parsers.forEach(function(parser) {
            type = type.replace(parser[0], function() {
                var args = _.slice(arguments, 1);
                args.unshift(event, handler);
                return parser[1].apply(event, args) || '';
            });
        });
        return type ? event.type = type : type;
    },
    parsers: [
        [/^(\W*)_/, function(event, handler, other) {
            event.bubbles = false;
            return other;
        }],
        [/\((.*)\)/, function(event, handler, val) {
            try {
                event.detail = _.resolve(val) || JSON.parse(val);
            } catch (e) {
                event.detail = val;
            }
        }],
        [/#(\w+)/g, function(event, handler, tag) {
            (event.tags||(event.tags=[])).push(tag);
            event[tag] = true;
        }],
        [/^(\w+):/, function(event, handler, cat) {//
            event.category = cat;
        }]
    ],

    fn: function(name, dataIndex) {
        Eventi[name] = _.fns[name] = function wrapper(target) {
            var args = _.slice(arguments);
            if (!target || typeof target === "string" || target instanceof Event) {// ensure target
                args.unshift(target = !this || this === Eventi ? _.global : this);
            }
            if (args.length > dataIndex) {// gather ...data the old way
                args[dataIndex] = args.slice(dataIndex);
                args = args.slice(0, dataIndex+1);
            }
            if (!args[1] || typeof args[1] === "string") {
                args[1] = _.split.ter(args[1]);
            }
            var fn = _[name], ret;
            if ('length' in target && target !== _.global) {// apply to each target
                for (var i=0,m=target.length; i<m; i++) {
                    ret = fn.apply(args[0] = target[i], args);
                }
            } else {
                ret = fn.apply(target, args);
            }
            return ret === undefined ? this : ret;// be fluent
        };
    },
    fns: {},
    split: {
        guard: { '(':')' },
        ter: function(texts, delims) {
            var parts = [],
                text = '',
                guard;
            if (texts) {
                delims = _.slice(arguments, 1);
                delims.unshift(' ');
                for (var i=0,m=texts.length; i<m; i++) {
                    var c = texts.charAt(i);
                    if (!guard && delims.indexOf(c) >= 0) {
                        if (text) {
                            parts.push(text);
                        }
                        text = '';
                    } else {
                        text += c;
                        if (guard) {
                            if (guard === c) {
                                if (text.charAt(text.length-2) === '\\') {
                                    text = text.replace("\\"+c, c);
                                } else {
                                    guard = null;
                                }
                            }
                        } else {
                            guard = _.split.guard[c];
                        }
                    }
                }
                if (text) {
                    parts.push(text);
                }
            } else {
                parts.push('');
            }
            return parts;
        }
    }
};
