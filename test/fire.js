(function() {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  var _ = Eventi._;
  module('Eventi fire');

  test('external api presence', function() {
    ok(typeof Eventi.fire === "function", 'Eventi.fire');
    notEqual(Eventi.fire, _.fire, 'public fire != internal fire');
  });

  test('Eventi.fy({}).fire', function() {
    equal(Eventi.fy({}).fire, Eventi.fire, 'should get fire()');
  });

  test('Eventi.fire({}, "foo") is noop', function() {
    expect(1);
    var _noop = _.noop;
    _.noop = function() {
      ok(true, 'noop called');
    };
    Eventi.fire({}, 'foo');
    _.noop = _noop;
  });

  test('Eventi.fire(hasSecret, "foo") is not noop', function() {
    expect(1);
    var _noop = _.noop,
      target = {};
    target[_._key] = function(){ ok(true, '_._key called'); };
    _.noop = function(){ ok(false, 'noop called'); };
    Eventi.fire(target, "foo");
    _.noop = _noop;
  });

  test('Eventi.fire(hasDispatchEventAndSecret, "foo") uses dispatchEvent', function() {
    expect(1);
    var _noop = _.noop,
      target = {};
    target[_._key] = function(){ ok(false, '_._key called'); };
    target.dispatchEvent = function(){ ok(true, 'dispatchEvent called'); };
    _.noop = function(){ ok(false, 'noop called'); };
    Eventi.fire(target, "foo");
    _.noop = _noop;
  });

  test('Eventi.fire() misc', function() {
    var target = {
      dispatchEvent: function(e) {
        ok(e instanceof Event, 'should receive instanceof Event');
        equal(e.type, 'test', 'should be of type test');
        equal(e.category, 'test', 'should be in category test');
        equal(e.data[0], 'data', 'should get data arg');
        equal(e.data[1], 2, 'should get second data arg');
      }
    };
    Eventi.fire(target, 'test:test', 'data', 2);
  });

  test('Eventi.fire(type)', function() {
    expect(2);
    equal(_.global, window, 'qunit global should be window');
    var listener = function(e) {
      equal(e.category, 'test', 'should get event in test category');
    };
    window.addEventListener('global', listener);
    Eventi.fire('test:global');
    window.removeEventListener('global', listener);
  });
/*
  test('Eventi.fire(event, props)', function() {
    expect(1);
    window.addEventListener('props', function(e) {
      equal(e.detail, 'detail', 'should have detail of "detail"');
    });
    Eventi.fire('props', { detail:'detail' });
    Eventi.fire(document.documentElement, 'props', { bubbles:false });
  });
*/
  test('internal api presence', function() {
    ok(_.fire, "_.fire");
    ok(_.dispatch, "_.dispatch");
  });

}());
