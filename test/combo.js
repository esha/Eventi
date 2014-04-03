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

  function onCombo(text, fn, fire) {
    Eventi.on(text, function(e) {
      equal(e.category, 'combo');
      equal(e.text, text);
      if (fn) {
        fn.apply(this, arguments);
      }
      Eventi.off(text);
    });
    if (!fire) {
      fire = text;
    }
    Eventi.fire(fire);
    Eventi.fire(fire);//twice to test off
  }

  test('ordered', function() {
    expect(6);
    onCombo('one,two', function(e) {
      ok(Array.isArray(e.events));
      equal(e.events.length, 2);
      equal(e.events[0].type, 'one');
      equal(e.events[1].type, 'two');
    });
  });

  test('unordered', function() {
    expect(2);
    onCombo('this+that', null, 'that this');
  });

  test('unordered with ordered sub', function() {
    expect(2);
    onCombo('this+that,then', null, 'this that then');
  });

  test('unordered with overlapping ordered subs', function() {
    expect(2);
    onCombo('first,this+that,then', null, 'first that this then');
  });

  test('sub-events with properties', function() {
    expect(3);
    onCombo('cat:this+that#tag', function(e) {
      equal(e.tags, undefined);
    });
  });

  asyncTest('timeout success', function() {
    expect(1);
    Eventi.on('one,two', function(e) {
      ok(e);
    }, 500);
    Eventi.fire('one');
    setTimeout(function() {
      start();
      Eventi.fire('two');
      Eventi.off('one,two');
    }, 100);
  });

  asyncTest('timeout fail', function() {
    expect(0);
    Eventi.on('this+that', function(e) {
      ok(!e,'should not have e');
    }, 100);
    Eventi.fire('this');
    setTimeout(function() {
      start();
      Eventi.fire('that');
      Eventi.off('this+that');
    }, 500);
  });

  test('internal api presence', function() {
    equal(typeof _.combo, "object", "_.combo");
    equal(typeof _.combo.count, "number", "_.combo.count");
    equal(typeof _.combo.split, "function", "_.combo.split");
    equal(typeof _.combo.reset, "function", "_.combo.reset");
    equal(typeof _.combo.event, "function", "_.combo.event");
    equal(typeof _.combo.eventFn, "function", "_.combo.eventFn");
  });

  test('_.combo.split', function() {
    var single = _.combo.split('single');
    deepEqual(single, ['single']);
    var ordered = _.combo.split('one,two');
    deepEqual(ordered, ['one','two'], 'should have both events');
    strictEqual(ordered.ordered, true, 'should be ordered');
    var unordered = _.combo.split('this+that');
    deepEqual(unordered, ['this','that'], 'should have both events');
    strictEqual(unordered.ordered, false, 'should be unordered');
    var both = _.combo.split('one,two+other');
    deepEqual(both, ['one,two', 'other'], 'should be split on unordered');
    strictEqual(unordered.ordered, false, 'should be unordered');
  });

}());
