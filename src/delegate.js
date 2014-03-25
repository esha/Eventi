if (global.Element) {
    _.properties.unshift([/<(.+)>/, function delegate(event, handler, selector) {
        handler.selector = selector;
        _.filter(handler, _.delegate);
    }]);
    _.delegate = function delegate(event, handler) {
        this.context = _.closest(event.target, handler.selector) || handler.target;
    };
    _.closest = function(el, selector) {
        while (el && el.matches) {
            if (el.matches(selector)) {
                return el;
            }
            el = el.parentNode;
        }
    };

    var Ep = Element.prototype,
        aS = 'atchesSelector';
    if (!Ep['matches']) {
        Object.defineProperty(Ep, 'matches', {value:Ep['webkitM'+aS]||Ep['mozM'+aS]||Ep['msM'+aS]});
    }
}   
