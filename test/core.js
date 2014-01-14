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
  module('Eventi core');

  test('external api presence', function() {
    ok(typeof Eventi === "function", 'Eventi');
    ok(typeof Eventi.fy === "function", 'Eventi.fy');
  });

  test('internal api presence', function() {
    ok(typeof _ === "object", "Eventi._ should be present");
    ok(_.global, "_.global");
    ok(_.noop, "_.noop");
    ok(_.slice, "_.slice");
    ok(_.copy, "_.copy");
    ok(_.resolveRE, "_.resolveRE");
    ok(_.resolve, "_.resolve");
    ok(_.create, "_.create");
    ok(_.prop, "_.prop");
    ok(_.iPS, "_.iPS");
    ok(_.parse, "_.parse");
    ok(_.properties, "_.properties");
    ok(_.splitRE, "_.splitRE");
    ok(_.wrap, "_.wrap");
  });

}());
