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
  module('Eventi singleton');

  test('^ready - even when registered late', function() {
    expect(3);
    Eventi.on('^ready', function(e, oe) {
      equal(e.type, 'ready');
      ok(e.singleton);
      equal(oe.type, 'DOMContentLoaded');
    });
  });

  test('^once on once', function() {
    expect(5);
    var target = new Eventi();
    target.on('^once', function(e) {// early listener
      equal(e.type, 'once');
      ok(!e.singleton);
      equal(e[_._skey], true);
    });

    var first = target.fire('once#first');
    target.fire('once#second');
    target.on('^once', function(e) {// late listener
      strictEqual(e, first, 'should get first once in late listener');
      first = null;
    });
    ok(!first, 'late listener should have fired synchronously');
    target.fire('once#third');
  });

  test('^sbubbles - parentNode and parentObject', function() {
    expect(2);
    var target = Eventi.fy({parentObject:{}});
    target.fire('^sbubbles');
    Eventi.on(target.parentObject, '^sbubbles', function(e) {
      equal(e.type, 'sbubbles');
    });

    target = document.getElementById('on');
    Eventi.fire(target, '^sbubbles');
    Eventi.on(document.body, '^sbubbles', function(e) {
      equal(e.type, 'sbubbles');
    });
  });

  test('snobubble', function() {
    expect(2);
    var target = document.getElementById('on');
    ok(target, 'should have target element');
    Eventi.on(target, '^snobubble', function(e) {
      equal(e.type, 'snobubble');
    });
    Eventi.fire(target, '^_snobubble');
    Eventi.on('^snobubble', function() {
      ok(false, 'should not see snobubble here');
    });
  });

  test('internal api presence', function() {
    ok(_.singleton, '_.singleton');
    ok(_._skey, '_._key');
    ok(_.remember, '_.remember');
  });

  test('_.singleton bubbles', function() {
    var e = {type:'singletonbubbles',bubbles:true};
    _.singleton(document.body, e);
    equal(document.body[_._skey].pop(), e, 'body should remember e');
    equal(document[_._skey].pop(), e, 'document should remember e');
    equal(_.global[_._skey].pop(), e, 'global should remember e');
  });

  test('_.singleton bubbles=false', function() {
    var e = {type:'singleton'};
    _.singleton(document.body, e);
    equal(document.body[_._skey].pop(), e, 'body should remember e');
    notEqual((document[_._skey]||[]).slice(-1), e, 'document should not remember e');
    notEqual((_.global[_._skey]||[]).slice(-1), e, 'global should not remember e');
  });

  test('_.remember', function() {
    var target = {},
      event = {};
    equal(Object.keys(target).length, 0, 'target should have no keys');
    _.remember(target, event);
    equal(Object.keys(target).length, 0, 'target should still have no keys');
    var saved = target[_._skey];
    ok(saved, 'target should have saved events array');
    equal(saved[0], event, 'should have event saved');
    _.remember(target, event);
    equal(saved.length, 2, 'should have two saved');
  });

}());
