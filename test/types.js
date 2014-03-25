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
  module('Eventi types');

  test('external api presence', function() {
    ok(typeof Eventi.types === "function", 'Eventi.types');
  });

  test('no Eventi.fy({}).types', function() {
    ok(!Eventi.fy({}).types, 'should not get types()');
  });

  test('Eventi.types("type") API additions', function() {
    Eventi.types('type');
    for (var p in Eventi) {
      if (typeof Eventi[p] === "function") {
        if (Eventi[p].utility) {
          equal(Eventi[p].type, undefined, "utilities should not get types");
        } else {
          equal(Eventi[p].type, _.types('type'), "Eventi."+p+".type is the right function");
        }
      }
    }
  });

  test('Eventi.types(Eventi.fy({}), "local", "signal") API additions', function() {
    expect(10);
    var o = Eventi.fy({}),
      signal = _.types('signal');
    equal(o.fire.signal, undefined, 'should not have signal yet');
    Eventi.types(o, 'local', 'signal');
    for (var p in Eventi) {
      if (typeof Eventi[p] === "function" && !Eventi[p].utility) {
        notEqual(o[p], Eventi[p], "should have bound Eventi function, not primary");
        equal(o[p].signal, signal, "should have signal type");
        ok(o[p].local, "should have local signal");
      }
    }
  });

  test('internal api presence', function() {
    ok(_.types, "_.signal");
    ok(_.bind, "_.bind");
  });

  test('_.types', function() {
    expect(7);
    var type = 'type',
      signal = _.types(type);
    equal(typeof signal, "function", "should return function");
    equal(_.types(type), signal, "_.types should be memoized");

    var fn = function(one, type, two) {
      equal(one, 1, "should get argument one");
      equal(type, 'type', "should get type argument");
      equal(two, 2, "should get argument two");
    };
    fn.index = 2;
    fn[type] = _.types(type);
    fn.type(1, 2);

    fn = function(target, type) {
      equal(typeof target, "object", "target should be an object");
      equal(type, 'type', 'should get type argument');
    };
    fn.index = 1;
    fn[type] = signal;
    fn.type({dispatchEvent:true});
  });

  test('_.bind', function() {
    expect(4);
    var bindme = function bindme(a) {
      equal(a, 'a', 'bindme should get args');
      equal(this, 'context', 'bindme should have right context');
    };
    bindme.index = 2;
    var bound = _.bind('context', bindme);
    equal(typeof bound, "function", "bound should be a function");
    bound('a');
    equal(bound.index, bindme.index, 'bound should have same index as bindme');
  });

}());
