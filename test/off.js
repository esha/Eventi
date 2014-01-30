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
  module('Eventi off');

  test('external api presence', function() {
    ok(typeof Eventi.off === "function", 'Eventi.off');
  });

  test('Eventi.fy({}).off', function() {
    equal(Eventi.fy({}).off, Eventi.off, 'should get off()');
  });

  test('internal api presence', function() {
    ok(_.off, "_.off");
    ok(_.empty, "_.empty");
    ok(_.clean, "_.clean");
    ok(_.cleans, "_.cleans");
    ok(_.cleaned, "_.cleaned");
  });

}());
