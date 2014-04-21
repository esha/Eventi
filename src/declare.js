if (document) {
    _.init = function init() {
        var nodes = document.querySelectorAll('[eventi],[data-eventi]');
        for (var i=0,m=nodes.length; i<m; i++) {
            var target = nodes[i],
                mapping = target.getAttribute('data-eventi') ||
                          target.getAttribute('eventi');
            if (mapping !== target.eventi) {
                if (_.off && target.eventi) {
                    Eventi.off(target, target.eventi, _.declared);
                }
                target.eventi = mapping;
                _.declare(target, mapping);
            }
        }
        if (nodes.length || document.querySelectorAll('[click],[data-click]').length) {
            Eventi.on('click keyup', _.check);
        }
    };
    _.declare = function(target, mapping) {// register listener
        var texts = _.split.ter(mapping);
        for (var i=0,m=texts.length; i<m; i++) {
            Eventi.on(target, texts[i], _.declared);
        }
    };
    _.declared = function(e, alias) {// lookup handlers
        alias = typeof alias === "string" ? alias : e.type;
        var nodes = _.declarers(this, alias, e.target);
        for (var i=0,m=nodes.length; i<m; i++) {
            _.respond(nodes[i], alias, e);
        }
    };
    _.declarers = function(node, alias, target) {
        var query = '['+alias+'],[data-'+alias+']',
            // gather matching targets up to and including the listening node
            nodes = [],
            descendant = false;
        while (target && target.matches) {
            if (target.matches(query)) {
                nodes.push(target);
            }
            if (target === node) {
                descendant = true;
                break;
            }
            target = target.parentNode;
        }
        // if target isn't a descendant of node, handler must be global
        return descendant ? nodes : node.querySelectorAll(query);
    };
    _.respond = function(node, alias, e) {// execute handler
        var response = node.getAttribute('data-'+alias)||node.getAttribute(alias)||alias;
        if (response) {
            var fn = _.resolve(response, node) || _.resolve(response);
            if (typeof fn === "function") {
                fn.call(node, e);
            } else {
                Eventi.fire(node, response, e);
            }
        }
    };
    _.check = function(e) {
        var click = e.target.getAttribute &&
                    ((e.type === 'click' && _.click(e.target)) ||
                     (e.keyCode === 13 && _.click(e.target, true)));
        if (click) {
            _.declared.call(document.documentElement, e, 'click');
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
