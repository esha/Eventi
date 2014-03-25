function Eventi(){ return _.create.apply(this, arguments); }
var _ = {
    global: new Function('return this')(),
    noop: function(){},
    slice: function(a, i){ return Array.prototype.slice.call(a, i); },
    copy: function(a, b, p) {
        if (a){ for (p in a){ if (a.hasOwnProperty(p)){ b[p] = a[p]; }}}
    },
    async: global.setImmediate || function async(fn){ return setTimeout(fn, 0); },
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
        _.properties.forEach(function(property) {
            type = type.replace(property[0], function() {
                var args = _.slice(arguments, 1);
                args.unshift(event, handler);
                return property[1].apply(event, args) || '';
            });
        });
        return type ? event.type = type : type;
    },
    properties: [
        [/^\!/, function important(e, handler) {//
            handler.important = true;
        }],
        [/^_/, function nobubble(event) {
            event.bubbles = false;
        }],
        [/\((.*)\)/, function detail(event, handler, val) {
            try {
                event.detail = _.resolve(val) || JSON.parse(val);
            } catch (e) {
                event.detail = val;
            }
        }],
        [/#(\w+)/g, function tags(event, handler, tag) {
            (event.tags||(event.tags=[])).push(tag);
            event[tag] = true;
        }],
        [/^(\w+):/, function category(event, handler, cat) {//
            event.category = cat;
        }]
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
            // ensure array of event text inputs
            args[index] = args[index] ? (args[index]+'').split(_.splitRE) : [''];
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
