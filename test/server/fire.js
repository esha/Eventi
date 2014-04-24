var server = require('../../dist/eventi.server.js');
var Eventi = server.Eventi;
var Event = server.Event;
var _ = Eventi._;

function test(name, fn) {
  exports[name] = function(is) {
    if (fn.call({}, is) !== false) {
      is.done();
    }
  };
}

test('external api presence', function(is) {
  is.ok(typeof Eventi.fire === "function", 'Eventi.fire');
  is.notEqual(Eventi.fire, _.fire, 'public fire != internal fire');
});

test('Eventi.fy({}).fire', function(is) {
  is.equal(Eventi.fy({}).fire, Eventi.fire, 'should get fire()');
});

test('Eventi.fire({}, "foo") is noop', function(is) {
  is.expect(1);
  var _noop = _.noop;
  _.noop = function() {
    is.ok(true, 'noop called');
  };
  Eventi.fire({}, 'foo');
  _.noop = _noop;
});

test('Eventi.fire(hasSecret, "foo") is not noop', function(is) {
  is.expect(1);
  var _noop = _.noop,
    target = {};
  target[_._key] = function(){ is.ok(true, '_._key called'); };
  _.noop = function(){ is.ok(false, 'noop called'); };
  Eventi.fire(target, "foo");
  _.noop = _noop;
});

test('Eventi.fire(hasDispatchEventAndSecret, "foo") uses dispatchEvent', function(is) {
  is.expect(1);
  var _noop = _.noop,
    target = {};
  target[_._key] = function(){ is.ok(false, '_._key called'); };
  target.dispatchEvent = function(){ is.ok(true, 'dispatchEvent called'); };
  _.noop = function(){ is.ok(false, 'noop called'); };
  Eventi.fire(target, "foo");
  _.noop = _noop;
});

test('Eventi.fire() misc', function(is) {
  var target = {
    dispatchEvent: function(e) {
      is.ok(e instanceof Event, 'should receive instanceof Event');
      is.equal(e.type, 'test', 'should be of type test');
      is.equal(e.category, 'test', 'should be in category test');
      is.equal(e.data[0], 'data', 'should get data arg');
      is.equal(e.data[1], 2, 'should get second data arg');
    }
  };
  Eventi.fire(target, 'test:test', 'data', 2);
});

test('Eventi.fire(type)', function(is) {
  is.expect(2);
  is.equal(_.global, global, 'nodeunit global should be global');
  var listener = function(e) {
    is.equal(e.category, 'test', 'should get event in test category');
  };
  Eventi.on('global', listener);
  Eventi.fire('test:global');
  Eventi.off('global', listener);
});

test('Eventi.fire(new CustomEvent("test")', function(is) {
  is.expect(2);
  var target = {},
    event = new Event('test');
  Eventi.on(target, 'test', function(e) {
    is.strictEqual(e, event);
  });
  is.equal(Eventi.fire(target, event), event);
});

test('internal api presence', function(is) {
  is.ok(_.fire, "_.fire");
  is.ok(_.dispatch, "_.dispatch");
});
