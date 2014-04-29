(function($, _, CustomEvent) {
    $.fn.trigger = function(event, data) {
        var ns = event.split('.'),
            type = ns.shift();
        if (data) {
            data = Array.isArray(data) ? data : [data];
        }
        this.each(function(i, el) {
            if (jQuery.isWindow(el) || typeof el[type] !== "function") {
                var e = new CustomEvent(type);
                if (data) {
                    e.data = data;
                }
                if (ns.length) {
                    e.namespace = ns.join('.');
                }
                _.dispatch(el, e);
            }
            jQuery.event.trigger(event, data, this);
        });
    };
})(jQuery, window.Eventi._, CustomEvent);
