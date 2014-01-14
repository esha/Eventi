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
  module('Eventi combo');

  test('internal api presence', function() {
    ok(_.comboRE, "_.comboRE");
    ok(_.sequence, "_.sequence");
    ok(typeof _.comboTimeout === "number", "_.comboTimeout");
    ok(_.comboFn, "_.comboFn");
    notEqual(_.cleaned, _.noop, "_.cleaned should be overridden");
  });

}());
