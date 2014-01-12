var Eventi = function(a){ return _.create.apply(this, arguments); },
_ = {
    global: document || global,
    noop: function(){},
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    copy: function(a, b, p) {
        for (p in a){ if (a.hasOwnProperty(p)){ b[p] = a[p]; } }
    },
    resolveRE: /^([\w\$]+)?((\.[\w\$]+)|\[(\d+|'(\\'|[^'])+'|"(\\"|[^"])+")\])*$/,
    resolve: function(reference, context) {
        if (_.resolveRE.test(reference)) {
            context = context || global;
            return eval('context'+(reference.charAt(0) !== '[' ? '.'+reference : reference));
        }
    },

    create: function(type, copyThese) {
        var props = {};
        type = _.parse(type, props);
        _.copy(copyThese, props);
        if (!('bubbles' in props)) {
            props.bubbles = true;// must bubble by default
        }

        var event = new CustomEvent(type, props);
        for (var prop in props) {
            event[_.prop(prop)] = props[prop];
        }
        _.iPS(event);
        return event;
    },
    prop: function(prop){ return prop; },// only an extension hook
    iPS: function(event) {
        var sIP = event.stopImmediatePropagation || _.noop;
        event.stopImmediatePropagation = function() {
            sIP.call(this);
            event.immediatePropagationStopped = true;
        };
    },
    parse: function(type, props) {
        props.text = type;// save original
        _.properties.forEach(function(property) {
            type = type.replace(property[0], function() {
                return property[1].apply(props, arguments) || '';
            });
        });
        return type;
    },
    properties: [
/*nobubble*/[/^_/,          function(){ this.bubbles = false; }],
/*detail*/  [/\((.*)\)/,    function(m, val) {
                                try {
                                    this.detail = _.resolve(val) || JSON.parse(val);
                                } catch (e) {
                                    this.detail = val;
                                }
                            }],
/*tags*/    [/#(\w+)/g,     function(m, tag) {
                                (this.tags||(this.tags=[])).push(tag);
                                this[tag] = true;
                            }],
/*category*/[/^(\w+):/,     function(m, category){ this.category = category; }]//
    ],

    splitRE: /( |\+|>)(?![^\(\)]*\))+/g,
    wrap: function(fn, expect, index) {
        return function(target) {
            var args = _.slice(arguments),
                ret;
            // ensure a target param
            if (typeof target === "string") {
                target = !this || this === Eventi ? _.global : this;
                args.unshift(target);
            }
            // convert event string to array
            index = index || 1;
            args[index] = args[index].split(_.splitRE);
            // may have extraneous data args
            if (args.length > expect) {
                args[expect] = args.slice(expect);
                args = args.slice(0, expect);
            }
            // iterate over multiple targets
            if ('length' in target) {
                for (var i=0,m=target.length; i<m; i++) {
                    ret = fn.apply(target, args);
                }
            } else {
                ret = fn.apply(target, args);
            }
            // be fluent
            return ret === undefined ? this : ret;
        };
    }   
};
Eventi._ = _;
Eventi.fy = function(o, p, v) {
    for (p in Eventi) {
        if (p != 'fy' && !(p in o) && typeof (v=Eventi[p]) === "function") {
            o[p] = v;
        }
    }
    return o;
};
