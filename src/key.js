_.parsers.push([/\[([a-z-0-9,\.\/\[\`\\\]\']+)\]/, function(event, handler, name) {//'
    var dash, key;
    while ((dash = name.indexOf('-')) > 0) {
        key = name.substring(0, dash);
        name = name.substring(dash+1);
        event[(_.special[key]||key)+'Key'] = true;
    }
    if (name) {
        event.keyCode = _.codes[name] || parseInt(name, 10) || name;
    }
}]);
_.special = { command: 'meta', apple: 'meta' };
_.codes = {
    backspace:8, tab:9, enter:13, shift:16, ctrl:17, alt:18, capsLock:20, escape:27, start:91, command:224,
    pageUp:33, pageDown:34, end:35, home:36, left:37, up:38, right:39, down:40, insert:45, 'delete':46,
    multiply:106, plus:107, minus:109, point:110, divide:111, numLock:144,// numpad controls
    ',':188, '.':190, '/':191, '`':192, '[':219, '\\':220, ']':221, '\'':222, space:32// symbols
};
for (var n=0; n<10; n++){ _.codes['num'+n] = 96+n; }// numpad numbers
for (var f=1; f<13; f++){ _.codes['f'+f] = 111+f; }// function keys
'abcdefghijklmnopqrstuvwxyz 0123456789'.split('').forEach(function(c) {
    _.codes[c] = c.toUpperCase().charCodeAt(0);// ascii keyboard
});