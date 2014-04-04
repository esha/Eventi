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
  module('Eventi key');

  test('Eventi.on("fake[ctrl-meta-shift-a]",fn)', function() {
    Eventi.on('key[ctrl-meta-shift-a]', function(e) {
      equal(e.type, 'key');
      equal(e.ctrlKey, true);
      equal(e.metaKey, true);
      equal(e.shiftKey, true);
      equal(e.keyCode, 65);
    });
    Eventi.fire('key[meta-shift-ctrl-a]');
  });

  test('Eventi.on("nocode[ctrl-]", fn)', function() {
    Eventi.on("nocode[ctrl-]", function(e) {
      equal(e.ctrlKey, true);
      ok(!e.keyCode);
    });
    Eventi.fire('nocode[ctrl-]');
  });

  test('Eventi.on("dash[shift--] dash[-]",fn)', function() {
    expect(2);
    Eventi.on("dash[shift--] dash[-]", function(e) {
      equal(e.keyCode, 189);
    });
    Eventi.fire('dash[shift--]');
  });

  test('Eventi.on("guard[\\]] escape", fn)', function() {
    Eventi.on("guard[\\]] escape", function(e) {
      equal(e.type, 'guard');
    });
    Eventi.fire("guard[]]");
  });

  test('internal api presence', function() {
    equal(typeof _.codes, "object", "_.codes");
    equal(_.split.guard['['], ']');
  });

}());
