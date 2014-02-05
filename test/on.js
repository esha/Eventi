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
  module('Eventi on');

  test('3rd party/polyfill api presence', function() {
    ok(typeof Element.prototype.matches === "function", "Element.prototype.matches");
  });

  test('external api presence', function() {
    ok(typeof Eventi.on === "function", 'Eventi.on');
  });

  test('Eventi.fy({}).on', function() {
    equal(Eventi.fy({}).on, Eventi.on, 'should get on()');
  });

  test('_.listener', function() {
    var o = {},
      listener = _.listener(o);
    equal(typeof listener, "function", 'should get listener function back');
    equal(typeof listener.s, "object", "should have 's' object");
    equal(_.listener(o), listener, 'should always get same listener back');
    for (var key in o) {
      ok(false, 'object should not have key: '+key);
    }

  });

  test('_.closest', function() {
    equal(_.closest(document, 'foo'), undefined, 'undefined for non Elements');
    var root = document.querySelector('#test_on'),
        div = root.querySelector('.closest');
    equal(_.closest(div, 'div'), div, 'el should prefer itself to parent');
    equal(_.closest(div, '#test_on'), root, 'should find parent when element does not match');
  });

  test('_.matches', function() {
    var e = new Eventi('cat:type#tag(detail)');
    ok(_.matches(e, {}), 'should always match empty object');
    ok(!_.matches(e, {foo:'bar'}), 'should not match random object');
    ok(_.matches(e, {type:'type'}), 'should match type alone');
    ok(_.matches(e, {category:'cat',type:'type',tag:true,detail:'detail'}), 'should match everything');
  });

  test('internal api presence', function() {
    ok(_.on, "_.on");
    ok(_.handler, "_.handler");
    ok(_.listener, "_.listener");
    ok(_.handle, "_.handle");
    ok(_.execute, "_.execute");
    ok(_.matches, "_.matches");
    ok(_.target, "_.target");
    ok(_.closest, "_.closest");
  });

}());
