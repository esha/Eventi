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

  test('3rd party/polyfill api presence', function() {
    expect(0);
    //TODO: include HTML.js and test HTML.fire presence
  });

  test('external api presence', function() {
    ok(typeof Eventi.fire === "function", 'Eventi.fire');
  });

  test('Eventi.fy({}).fire', function() {
    equal(Eventi.fy({}).fire, Eventi.fire, 'should get fire()');
  });

  test('internal api presence', function() {
    ok(_.fire, "_.fire");
    ok(_.trigger, "_.trigger");
    ok(_.dispatch, "_.dispatch");
  });

}());
