if (document) {
    _.init = function init() {
        var nodes = document.querySelectorAll('[data-eventi]');
        for (var i=0,m=nodes.length; i<m; i++) {
            var node = nodes[i],
                mapping = node.getAttribute('data-eventi');
            if (mapping) {
                _.declare(mapping, node);
            }
        }
        if (nodes.length || document.querySelectorAll('[click]').length) {
            Eventi.on('click keyup', _.check);
        }
    };
    _.declare = function declare(mapping, node) {
        var types = mapping.split(_.splitRE);
        for (var i=0,m=types.length; i<m; i++) {
            var type = types[i],
                eq = type.lastIndexOf('='),
                alias = eq > 0 ? type.substring(eq+1) : undefined,
                global = type.charAt(0) === '/';
            if (alias) {
                type = type.substring(0, eq);
            }
            if (global) {
                type = type.substring(1);
                node = _.global;
            }
            Eventi.on(node || _.global, type, _.declared, alias);
        }
    };
    _.declared = function(e, alias) {
        var type = alias || e.type,
            target = _.closest(e.target, '['+type+']'),
            value = target && target.getAttribute(type);
        if (value) {
            _.trigger(target, value, e);
        }
    };
    _.trigger = function(node, response, e) {
        var fn = _.resolve(response, node) || _.resolve(response);
        if (typeof fn === "function") {
            fn.call(node, e);
        } else {
            Eventi.fire(node, response, e);
        }
    };
    _.check = function(e) {
        if ((e.type === 'click' && _.click(e.target)) ||
            ((e.which || e.keyCode) === 13 && _.enter(e.target))) {
            _.declared(e, 'click');
            // someone remind me why i've always done this?
            if (!_.allowDefault(e)) {
                e.preventDefault();
            }
        }
    };
    _.click = function(el) {
        return el.getAttribute('click') || _.parentalClick(el);
    };
    _.enter = function(el) {
        return el.getAttribute('click') !== "false" && _.parentalClick(el, true);
    };
    _.allowDefault = function(e) {
        var inputType = e.target.type;
        return inputType && (inputType === 'radio' || inputType === 'checkbox');
    };
    _.parentalClick = function(el, enter) {
        // editables, select, textarea, non-button inputs all use click to alter focus w/o action
        // textarea and editables use enter to add a new line w/o action
        // a[href], buttons, button inputs all automatically dispatch 'click' on enter
        // in all three situations, dev must declare on element, not on parent to avoid insanity
        if (!el.isContentEditable) {
            var name = el.nodeName.toLowerCase();
            if (name !== 'textarea' && name !== (enter ? 'button' : 'select')) {
                var button = _.buttonRE.test(el.type);
                return enter ? !(button || (name === 'a' && el.getAttribute('href'))) :
                            button || name !== 'input';
            }
        }
    };
    _.buttonRE = /^(submit|button|reset)$/;

    Eventi.on('DOMContentLoaded', _.init);
}
