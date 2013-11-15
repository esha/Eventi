/**
 * Copyright (c) 2013, ESHA Research
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * 
 *
 * @version 0.1
 * @name ready
 * @requires jQuery 1.9+
 * @author Nathan Bubna
 */
;(function($, window, $doc, undefined) {

    var ready = window.ready = function(key, fn) {
        if ($.isFunction(key)) {
            fn = key;
            key = '';
        } else if (!key) {
            key = ''
        }
        var $el = this === window ? $doc : this;
        if (fn === undefined) {
            ready.trigger.call($el, key);
        } else {
            ready.on.call($el, key, fn);
        }
        return this;
    };
    $.extend(ready, {
        debug: true,
        _: {},
        was: $.fn.ready,
        each: function(key, context, fn) {
            var keys = key.split(' ');
            for (var i=0,m=keys.length; i<m; i++) {
                fn.call(context, keys[i]);
            }
        },
        trigger: function(key) {
            ready.each(key, this, function(key) {
                this.trigger('ready', [key]);
            });
        },
        on: function(key, fn) {
            ready.each(key, this, function(key) {
                ready.deferred(key).promise().done($.proxy(fn, this));
            });
        },
        deferred: function(key) {
            var deferred = ready._[key];
            if (!deferred) {
                deferred = $.Deferred();
                ready._[key] = deferred;
            }
            if (key.indexOf('+') >= 0) {
                var keys = key.split('&'),
                    count = keys.length,
                    events = {};
                for (var i=0,m=keys.length; i<m; i++) {
                    ready.deferred(keys[i]).promise().done(function(e, key) {
                        events[key] = e;
                        deferred.notify(e, key);
                        count--;
                        if (count === 0) {
                            deferred.resolve(events, key);
                        }
                    });
                }
            }
            return deferred;
        },
        resolve: function(e, key) {
            e.ready = key;
            // for resolution, all delimiters are converted to spaces
            key = key ? key.replace(/[\+\|]/g, ' ') : '';
            ready.each(key, null, function(key) {
                ready.deferred(key).resolve(e, key);
            });
        }
    });
    $.fn.ready = ready;
    //TODO: if the deprecated ready event is removed and/or they stop unbinding ready listeners:
    //$(function(){ $doc.on('ready', ready.resolve).trigger('ready'); });
    $doc.one('ready', function(e) {
        ready.resolve(e);
        setTimeout(function(){ $doc.on('ready', ready.resolve); },0);
    });

})(jQuery, window, $(document));
