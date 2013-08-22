/**
 * Copyright (c) 2013, ESHA Research
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
;(function($, trigger, _) {
    _.fn = $.fn.trigger;
    _.triggerRE = / |\#|\[|\:/;
    $.fn.trigger = function(type) {
        return typeof type === "string" && _.triggerRE.test(type) ?
            this.each(function(){ trigger(this, type); }) :
            _.fn.apply(this, arguments);
    };
    var parse = _.parse;
    _.parse = function(type) {
        var e = parse(type);
        type = e.type;
        var dot = type.indexOf('.');
        if (dot > 0) {
            e.namespace = type.substring(dot+1);
            e.namespace_re = new RegExp('(^|\\.)'+e.namespace+'(\\.|$)');
            e.type = type.substring(0, dot);
        }
        return e;
    };
})(jQuery, trigger, trigger._);
