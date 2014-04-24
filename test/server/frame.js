var server = require('../../dist/eventi.server.js');
var Event = server.Event;

function test(name, fn) {
    exports[name] = function(is) {
        if (fn.call({}, is) !== false) {
            is.done();
        }
    };
}

test('Event API/polyfill', function(is) {
  is.ok(Event, "Event");
  var ce = new Event('foo', {bubbles:true});
  is.equal(ce.type, 'foo', "Event type");
  is.equal(typeof ce.timeStamp, "number", "Event timeStamp");
  is.ok('detail' in ce, "Event detail");
  is.equal(ce.bubbles, true, "Event bubbles");
  is.equal(typeof ce.stopPropagation, "function", "Event stopPropagation");
  is.equal(typeof ce.stopImmediatePropagation, "function", "Event stopImmediatePropagation");
});
