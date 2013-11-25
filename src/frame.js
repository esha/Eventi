/*
 * https://github.com/nbubna/Eventier
 *
 * Copyright (c) 2013 ESHA Research
 * Licensed under the MIT license.
 */
(function(global, document) {
    "use strict";

"<%= body %>"

    // export Eventier
    if (typeof define === 'function' && define.amd) {
        define(function(){ return Eventier; });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Eventier;
    } else {
        global.Eventier = Eventier;
    }
	// extend HTML(.js), if present and not prohibited
    var HTML_ = _.resolve('document.documentElement._');
	if (HTML_ && document.documentElement.getAttribute('data-eventier-html') !== "false") {
        _.copyTo(HTML_.fn);
        if (_.target) {
            var target = _.target;
            _.target = function() {
                return HTML_.node(target.apply(this, arguments)); };
            };
        }
    }

})(this, document);
