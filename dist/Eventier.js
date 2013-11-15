/*! Eventier - v0.1.0 - 2013-11-15
* https://github.com/nbubna/Eventier
* Copyright (c) 2013 ESHA Research; Licensed MIT */
(function(document) {
    "use strict";

    // internal API
    var _ = {
        version: "<%= pkg.version %>",
        global: document || this
    };

    // external API
    var Eventier = function() {
        
    };
    Eventier._ = _;

    // export Eventier
    if (typeof define === 'function' && define.amd) {
        define(function(){ return Eventier; });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Eventier;
    } else {
        this.Eventier = Eventier;
    }

}).call(this, document);
