/**
 * Copyright (c) 2012, ESHA Research
 *
 * @version 0.1
 * @name key
 * @requires jQuery
 * @author Nathan Bubna
 */
;(function($, window, document) {
 
    var key = window.key = $.fn.key = function(name) {
        return $(this).each(function() {
            if (key.debug) console.log('key', name, this);
            var e = $.Event(key.prefix+name);
            $(this).trigger(e);
            if (!e.isDefaultPrevented()) $('[key="'+name+'"]').click();
        });
    };
 
    key.init = function() {
        var page = $('html');
        key.all = page.is('.key-all');
        key.debug = page.is('.key-debug,.debug');
        key.prefix = page.attr('key-prefix') || 'key.';
    },
    key.fire = function(e) {
        return key.all || // fire on every key?
            e.ctrlKey || e.metaKey || e.altKey ||// fire when a "control" key is down
            e.keyCode < 48 || e.keyCode > 90;// fire when not 0-9 or A-Z 
    };
    key.event = function(e) {
        if (key.fire(e)) {
            var name = key.name(e.keyCode, e.ctrlKey, e.metaKey, e.altKey, e.shiftKey);
            if (key.debug) console.log('key.event', name, e);
            return $(e.target).key(name);
        }
    };
    key.name = function(code, ctrl, meta, alt, shift) {
        var name = codes[code] || '#'+code;
        if (code >= 96 && code <= 105) name = key.numpad + name;
        if (shift && code !== 16) name = key.shift + name;
        if (alt && code !== 18) name = key.alt + name;
        if (meta && code !== 224) name = key.meta + name;
        if (ctrl && code !== 17) name = key.ctrl + name;
        return name;
    };
 
    // special key prefixes are configurable!
    key.ctrl = 'ctrl-';
    key.shift = 'shift-';
    key.alt = 'alt-';
    key.meta = 'command-';
    key.numpad = '';
 
    $(document).ready(key.init).on('keydown.key', key.event);
 
    var codes = key.codes = [];
    codes[8] = 'backspace';
    codes[9] = 'tab';
    codes[13] = 'enter';
    codes[16] = 'shift';
    codes[17] = 'ctrl';
    codes[18] = 'alt';
    codes[20] = 'capsLock';
    codes[27] = 'escape';
    codes[35] = 'end';
    codes[36] = 'home';
    codes[37] = 'left';
    codes[38] = 'up';
    codes[39] = 'right';
    codes[40] = 'down';
    codes[45] = 'insert';
    codes[46] = 'delete';
    codes[96] = 0;
    codes[97] = 1;
    codes[98] = 2;
    codes[99] = 3;
    codes[100] = 4;
    codes[101] = 5;
    codes[102] = 6;
    codes[103] = 7;
    codes[104] = 8;
    codes[105] = 9;
    codes[106] = '*';
    codes[107] = '+';
    codes[109] = '-';
    codes[110] = '.';
    codes[111] = '/';
    codes[112] = 'f1';
    codes[113] = 'f2';
    codes[114] = 'f3';
    codes[115] = 'f4';
    codes[116] = 'f5';
    codes[117] = 'f6';
    codes[118] = 'f7';
    codes[119] = 'f8';
    codes[120] = 'f9';
    codes[121] = 'f10';
    codes[122] = 'f11';
    codes[123] = 'f12';
    codes[144] = 'numLock';
    codes[186] = ';';
    codes[187] = '=';
    codes[188] = ',';
    codes[189] = '-';
    codes[190] = '.';
    codes[191] = '/';
    codes[192] = '`';
    codes[219] = '[';
    codes[220] = '\\';
    codes[221] = ']';
    codes[222] = '\'';
    codes[224] = 'command';
 
    var ascii = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789';
    for (var i=0,m=ascii.length; i<m; i++) {
        codes[ascii.charCodeAt(i)] = ascii.charAt(i).toLowerCase();
    }
 
})(jQuery, window, document);