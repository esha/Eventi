function Eventi(){ return _.create.apply(this, arguments); }
var _ = {
    global: new Function('return this')(),
    noop: function(){},
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    copy: function(a, b, p) {
        if (a){ for (p in a){ if (a.hasOwnProperty(p)){ b[p] = a[p]; }}}
    },
    resolveRE: /^([\w\$]+)?((\.[\w\$]+)|\[(\d+|'(\\'|[^'])+'|"(\\"|[^"])+")\])*$/,
    resolve: function(reference, context) {
        if (_.resolveRE.test(reference)) {
            context = context || global;
            return eval('context'+(reference.charAt(0) !== '[' ? '.'+reference : reference));
        }
    },

    create: function(type, copyThese) {
        var props = { text: type+'' };
        type = _.parse(props.text, props);
        _.copy(copyThese, props);
        if (!('bubbles' in props)) {
            props.bubbles = true;// must bubble by default
        }

        var event = new CustomEvent(type, props);
        delete props.bubbles;
        delete props.cancelable;
        delete props.detail;
        for (var prop in props) {
            event[_.prop(prop)] = props[prop];
        }
        event.stopImmediatePropagation = _.sIP;//TODO: consider prototype extension
        return event;
    },
    prop: function(prop){ return prop; },// only an extension hook
    sIP: function() {
        this.immediatePropagationStopped = true;
        (Event.prototype.stopImmediatePropagation || _.noop).call(this);
    },
    parse: function(type, props) {
        _.properties.forEach(function(property) {
            type = type.replace(property[0], function() {
                return property[1].apply(props, arguments) || '';
            });
        });
        return props.type = type;
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

    splitRE: / (?![^\(\)]*\))+/g,
    wrap: function(name, expect, index) {
        index = index || 1;
        var wrapper = function wrapper(target) {
            var args = _.slice(arguments);
            // ensure target param precedes event text
            if (!target || typeof target === "string") {
                target = !this || this === Eventi ? _.global : this;
                args.unshift(target);
            }
            // convert to array of event text inputs
            args[index] = (args[index]+'').split(_.splitRE);
            // gather ...data the old way
            if (args.length > expect) {
                args[expect] = args.slice(expect);
                args = args.slice(0, expect+1);
            }
            // call fn for each target
            var fn = _[name], ret;
            if ('length' in target && target !== _.global) {
                for (var i=0,m=target.length; i<m; i++) {
                    ret = fn.apply(args[0] = target[i], args);
                }
            } else {
                ret = fn.apply(target, args);
            }
            // be fluent
            return ret === undefined ? this : ret;
        };
        wrapper.index = index;
        return wrapper;
    }   
};
Eventi._ = _;
(Eventi.fy = function fy(o) {
    for (var p in Eventi) {
        var fn = Eventi[p];
        if (typeof fn === "function" && !fn.utility) {
            Object.defineProperty(o, p, {value:fn, writable:true, configurable:true});
        }
    }
    return o;
}).utility = true;
