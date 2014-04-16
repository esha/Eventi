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
  module('Eventi alias');

  test('external api presence', function() {
    ok(typeof Eventi.alias === "function", 'Eventi.alias');
  });

  test('no Eventi.fy({}).alias', function() {
    ok(!Eventi.fy({}).alias, 'should not get alias()');
  });

  test('Eventi.alias("type") API additions', function() {
    Eventi.alias('type');
    for (var p in _.fns) {
      equal(typeof Eventi[p].type, "function", "Eventi."+p+".type is a function");
    }
  });

  test('Eventi.alias(Eventi.fy({}), "local", "signal") API additions', function() {
    expect(7);
    var o = Eventi.fy({});
    equal(o.fire.signal, undefined, 'should not have signal yet');
    Eventi.alias(o, 'local', '/test:signal=>alias');
    for (var p in _.fns) {
      equal(typeof o[p].alias, "function", "should have alias alias");
      ok(o[p].local, "should have local alias");
    }
  });

  test('internal api presence', function() {
    ok(_.alias, "_.alias");
  });

  test('_.alias', function() {
    expect(6);
    var type = 'type',
      signal = _.alias(type, type);
    equal(typeof signal, "function", "should return function");

    var fn = function(type, one, two) {
      equal(type, 'type', "should get type argument");
      equal(one, 1, "should get argument one");
      equal(two, 2, "should get argument two");
    };
    fn[type] = _.alias(type, type);
    fn.type(1, 2);

    fn = function(target, type) {
      equal(typeof target, "object", "target should be an object");
      equal(type, 'type', 'should get type argument');
    };
    fn.index = 1;
    fn[type] = signal;
    fn.type({dispatchEvent:true});
  });

}());
