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

  module('Eventier', {
    // This will run before each test in this module.
    setup: function() {
      //TODO 
    }
  });

  test('presence', function() {
    expect(1);
    ok(typeof Eventier !== "undefined", 'Eventier should be present');
  });

  test('internal', function() {
    ok(typeof Eventier._ !== "undefined", "Eventier._ should be present");
  });

}());
