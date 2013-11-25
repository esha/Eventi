// Core API
var Eventier = function(a) {
    return a && typeof a === "string" ? _.create.apply(this, arguments) : _.copyTo(a) || a;
},

// CustomEvent or polyfill
CustomEvent = global.CustomEvent || function(type, args) {
    args = args || {};
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, !!args.bubbles, !!args.cancelable, args.detail);
    return e;
},

// Internal API
_ = {
    version: "<%= pkg.version %>",
    global: document || global,
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    resolveRE: /^([\w\$]+)?((\.[\w\$]+)|\[(\d+|'(\\'|[^'])+'|"(\\"|[^"])+")\])*$/,
    splitRE: / (?![^\(\)]*\))+/g,
    noop: function(){},

    create: function(type, props) {
        var copy = { text: type };
        type = _.parse(type, copy);
        if (props) {
            for (var prop in props) {
                if (props.hasOwnProperty(prop)) {
                    copy[prop] = props[prop];
                }
            }
        }
        if (!('bubbles' in copy)) {
            copy.bubbles = true;// must bubble by default
        }

        var event = new CustomEvent(type, copy);
        for (var prop in copy) {
            event[_.prop(prop)] = copy[prop];
        }
        _.propagation(event);
        return event;
    },
    propagation: function(event) {
        var iFn = event.stopImmediatePropagation || _.noop;
        event.stopImmediatePropagation = function() {
            iFn.call(this);
            event.immediatePropagationStopped = true;
        };
    },

    parsers: [
        [/^_/, function(){ this.bubbles = false; }],
        [/\((.*)\)/, function(m, val) {
            try {
                this.detail = _.resolve(val) || JSON.parse(val);
            } catch (e) {
                this.detail = val;
            }
        }],
        [/#(\w+)/g, function(m, tag) {
            (this.tags||(this.tags=[])).push(tag);
            this[tag] = true;
        }],
        [/^(\w+):/, function(m, category){ this.category = category; }]//
    ],
    parse: function(type, props) {
        for (var i=0,m=_.parsers.length; i<m; i++) {
            var parser = _.parsers[i];
            type = type.replace(parser[0], function() {
                return parser[1].apply(props, arguments) || '';
            });
        }
        return type;
    },

    prop: function(prop){ return prop; },// only an extension hook

    copyTo: function(o, p, v) {
        if (typeof o === "object") {
            for (p in Eventier) {
                if (Eventier.hasOwnProperty(p) && typeof (v=Eventier[p]) === "function") {
                    o[p] = v;
                }
            }
            return o;
        }
    },

    // common utilities
    resolve: function(reference, context) {
        if (_.resolveRE.test(reference)) {
            context = context || global;
            return eval('context'+(reference.charAt(0) !== '[' ? '.'+reference : reference));
        }
    },
    fixArgs = function(expect, fn) {
        return function(target, sequence) {
            var args = _.slice(arguments);
            if (typeof target === "string") {
                sequence = target;
                target = !this || this === Eventier ? _.global : this
                args.unshift(target);
            }
            if (args.length > expect) {
                args[expect] = args.slice(expect);
                args = args.slice(0, expect);
            }
            if (typeof sequence === "string") {
                args[1] = sequence.split(_.splitRE);
            }
            if ('length' in target) {
                for (var i=0,m=target.length; i<m; i++) {
                    ret = fn.apply(target, args);
                }
            } else {
                ret = fn.apply(target, args);
            }
            return ret === undefined ? this : ret;
        };
    }
};
Eventier._ = _;
