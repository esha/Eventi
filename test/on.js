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
  module('Eventi on');

  test('3rd party/polyfill api presence', function() {
    ok(typeof Element.prototype.matches === "function", "Element.prototype.matches");
    //TODO: include HTML.js and test HTML.on presence
  });

  test('external api presence', function() {
    ok(typeof Eventi.on === "function", 'Eventi.on');
  });

  test('internal api presence', function() {
    ok(_.on, "_.on");
    ok(_.handler, "_.handler");
    ok(_.listener, "_.listener");
    ok(_.handle, "_.handle");
    ok(_.execute, "_.execute");
    ok(_.handles, "_.handles");
    ok(_.subset, "_.subset");
    ok(_.target, "_.target");
    ok(_.closest, "_.closest");
  });

}());
