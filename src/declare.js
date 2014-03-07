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
    _.declare = function(mapping, mapper) {// register listener
        var types = mapping.split(_.splitRE);
        for (var i=0,m=types.length; i<m; i++) {
            var type = types[i],
                eq = type.lastIndexOf('='),
                alias = eq > 0 ? type.substring(eq+1) : undefined,
                global = type.charAt(0) === '/',
                context = global ? _.global : mapper;
            mapper = mapper || document;
            if (alias){ type = type.substring(0, eq); }
            if (global){ type = type.substring(1); }
            Eventi.on(context, type, _.mapped, mapper, alias);
        }
    };
    _.mapped = function(e, mapper, alias) {// lookup handlers
        var type = alias || e.type,
            nodes = _.declarers(mapper, type, this !== _.global && e.target);
        for (var i=0,m=nodes.length; i<m; i++) {
            _.declared(nodes[i], type, e);
        }
    };
    _.declarers = function(mapper, type, target) {
        var query = '['+type+']';
        if (target) {
            // gather matching parents up to the mapper
            var nodes = [];
            while (target && target.matches && target !== mapper.parentNode) {
                if (target.matches(query)) {
                    nodes.push(target);
                }
                target = target.parentNode;
            }
            return nodes;
        }
        // gather all declarations within the mapper
        return mapper.querySelectorAll(query);
    };
    _.declared = function(node, type, e) {// execute handler
        var response = node.getAttribute(type);
        if (response) {
            response = _.resolve(response, node) || _.resolve(response) || response;
            if (typeof response === "function") {
                response.call(node, e);
            } else {
                Eventi.fire(node, response, e);
            }
        }
    };
    _.check = function(e) {
        var click = (e.type === 'click' && _.click(e.target)) ||
                    (e.keyCode === 13 && _.click(e.target, true));
        if (click) {
            _.mapped(e, document.documentElement, 'click');
            if (click === 'noDefault' && !_.allowDefault(e.target)) {
                e.preventDefault();
            }
        }
    };
    _.allowDefault = function(el) {
        return el.type === 'radio' || el.type === 'checkbox';
    };
    _.click = function(el, enter) {
        // click attributes with non-false value override everything
        var click = el.getAttribute('click');
        if (click && click !== "false") {
            return 'noDefault';
        }
        // editables, select, textarea, non-button inputs all use click to alter focus w/o action
        // textarea and editables use enter to add a new line w/o action
        // a[href], buttons, button inputs all automatically dispatch 'click' on enter
        // in all three situations, dev must declare on element, not on parent to avoid insanity
        if (!el.isContentEditable) {
            var name = el.nodeName.toLowerCase();
            return name !== 'textarea' &&
                   (name !== 'select' || enter) &&
                   (enter ? (name !== 'a' || !el.getAttribute('href')) &&
                            name !== 'button' &&
                            (name !== 'input' || !_.buttonRE.test(el.type))
                          : name !== 'input' || _.buttonRE.test(el.type));
        }
    };
    _.buttonRE = /^(submit|button|reset)$/;

    Eventi.on('DOMContentLoaded', _.init);
}
