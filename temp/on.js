/**
 * Copyright (c) 2012, ESHA Research
 *
 * Wires elements to events, allowing simple, declarative responses
 * to either local or global events.
 *
 *   <form on="submit:hide">
 *   <div on="/ajaxStart:show /ajaxStop:hide">Loading...</div>
 *   <div on="/reset" on-reset="trigger('clear save')">
 *
 * @version 0.1
 * @name on
 * @requires jQuery
 * @author Nathan Bubna
 */
;(function($, window, $doc) {

    var on = window.on = {
        debug: true,
        refresh: function() {
            $('.on-ready').not('[on]').off('.on');
            $('[on]').not('.on-ready').each(on.init);
        },
        init: function() {
            var el = $(this).addClass('on-ready'),
                events = (el.attr('on')||'').split(' ');
            for (var i=0,m=events.length; i<m; i++) {
                on.event(el, events[i]);
            }
        },
        event: function(el, event) {
            var global = event.charAt(0) === '/';
            if (global) event = event.substring(1);

            var colon = event.indexOf(':');
            if (colon > 0) {
                var action = event.substring(colon + 1);
                event = event.substring(0, colon);
            } else {
                var dot = event.indexOf('.'),
                    action = el.attr('on-'+(dot > 0 ? event.substring(0, dot) : event));
                if (!action) action = event;// on="hide" === on="hide:hide"
            }

            var fn = on.fn(action);
            if (on.debug) console.log('on', el, event, action, fn);
            (global ? $doc : el).on(event+'.on', fn);
        },
        fn: function(el, action) {
            if (!action) return on._default;

            var parenth = action.indexOf('(');
            if (parenth > 0) {
                var args = action.substring(parenth + 1, action.length - 1);
                if (args !== 'e') args = JSON.parse('['+args.replace(/'/g,'"')+']');
                action = action.substring(0, parenth);
            }

            return function(e) {
                var _args = args === 'e' ? [e] : args,
                    fn;
                if ($.isFunction(el[action])) fn = el[action];
                else if ($.isFunction(window[action])) fn = window[action];
                if (fn) return fn.apply(el, _args);
                else el.trigger(action);
            };
        },
        _default: function() {
            var el = $(this);
            if (el.is(':hidden')) el.show();
            el.click();
        }
    };
    $doc.ready(on.refresh)
        .on('refresh.on', on.refresh);

})(jQuery, window, $(document));