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

  test('Eventi.off("test")', function() {
    expect(1);
    Eventi.on("test", function() {
      ok(true, 'should only be called once');
    })
    .fire('test');
    Eventi.off("test")
          .fire('test');
  });

  test('Eventi.off(type,fn)', function() {
    expect(1);
    var fn = function() {
      ok(false, 'should not be called');
    },
    type = 'offfn';
    Eventi.on(type, fn)
          .on(type, function() {
            ok(true, 'should be called once');
          })
          .off(type, fn)
          .fire(type);
  });

  test('Eventi.off(target,type,fn)', function() {
    expect(2);
    var fn = function(e) {
      strictEqual(this, document, 'should only fire on document');
    },
    type = 'offtargetfn',
    other = {},
    targets = [document, other];
    Eventi.on(targets, type, fn)
          .on(other, type, function(e) {
            ok(true, 'should be called once');
          })
          .off(other, type, fn)
          .fire(targets, type);
    Eventi.off(document, type, fn)
          .off(other, type)
          .fire(targets, type);
  });

  test('Eventi.off(target, type', function() {
    expect(1);
    var other = {},
      type = 'offtarget',
      targets = [document, other];
    Eventi.on(targets, type, function() {
      strictEqual(this, document, 'should only fire on document');
    })
    .off(other, type)
    .fire(targets, type);
    Eventi.off(document, type)
          .fire(targets, type);
  });

  test('internal api presence', function() {
    ok(_.off, "_.off");
    ok(_.unhandle, "_.unhandle");
    ok(_.empty, "_.empty");
    ok(_.clean, "_.clean");
    ok(_.cleans, "_.cleans");
  });

  test('handler#off event', function() {
    expect(4);
    var target = {},
      type = 'offevent',
      fn = function(e, h) {
        if (h.match.type === type) {
          ok(e.off);
          equal(e.type, 'handler');
          ok(h === handler, 'should pass off\'ed handler');
        }
      };
    Eventi.on(target, type, function(){});
    var handler = target[_._key].s[type][0];
    ok(handler, 'should be able to snag ref to handler');
    Eventi.on(_, 'handler#off', fn)
          .off(target, type)
          .off(_, 'handler#off', fn);
  });

  test('_.unhandle not just noop', function() {
    equal(_.unhandle.name, 'off', 'should override on.js\' noop version');
  });

  test('_.empty', function() {
    ok(_.empty({}), 'should be empty');
    ok(!_.empty({foo:1}), 'should not be empty');
    function A(){}
    A.prototype = { foo: 1 };
    var a = new A();
    ok(!_.empty(a), 'those with inherited props should not be empty');
    var o = {};
    Object.defineProperty(o, 'foo', {value:1});
    ok(_.empty(o), 'non-enumerable defined props should keep things empty');
  });

}());
