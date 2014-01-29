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
  module('Eventi signal');

  test('external api presence', function() {
    ok(typeof Eventi.signal === "function", 'Eventi.signal');
  });

  test('no Eventi.fy({}).signal', function() {
    ok(!Eventi.fy({}).signal, 'should not get signal()');
  });

  test('Eventi.signal("type") API additions', function() {
    Eventi.signal('type');
    for (var p in Eventi) {
      if (typeof Eventi[p] === "function") {
        if (Eventi[p].utility) {
          equal(Eventi[p].type, undefined, "utilities should not get signals");
        } else {
          equal(Eventi[p].type, _.signal('type'), "Eventi."+p+".type is the right function");
        }
      }
    }
  });

  test('Eventi.signal(Eventi.fy({}), "local", "signals") API additions', function() {
    expect(13);
    var o = Eventi.fy({}),
      signals = _.signal('signals');
    equal(o.fire.signals, undefined, 'should not have signals yet');
    Eventi.signal(o, 'local', 'signals');
    for (var p in Eventi) {
      if (typeof Eventi[p] === "function" && !Eventi[p].utility) {
        notEqual(o[p], Eventi[p], "should have bound Eventi function, not primary");
        equal(o[p].signals, signals, "should have signals signal");
        ok(o[p].local, "should have local signal");
      }
    }
  });

  test('internal api presence', function() {
    ok(_.signal, "_.signal");
    ok(_.bind, "_.bind");
  });

  test('_.signal', function() {
    expect(7);
    var type = 'type',
      signal = _.signal(type);
    equal(typeof signal, "function", "should return function");
    equal(_.signal(type), signal, "_.signal should be memoized");

    var fn = function(one, type, two) {
      equal(one, 1, "should get argument one");
      equal(type, 'type', "should get type argument");
      equal(two, 2, "should get argument two");
    };
    fn.index = 2;
    fn[type] = _.signal(type);
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
