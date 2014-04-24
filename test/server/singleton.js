var server = require('../../dist/eventi.server.js');
var Eventi = server.Eventi;
var _ = Eventi._;

function test(name, fn) {
  exports[name] = function(is) {
    if (fn.call({}, is) !== false) {
      is.done();
    }
  };
}

test('^once on once', function(is) {
  is.expect(5);
  var target = new Eventi();
  target.on('^once', function(e) {// early listener
    is.equal(e.type, 'once');
    is.ok(!e.singleton);
    is.equal(e[_._skey], true);
  });

  var first = target.fire('once#first');
  target.fire('once#second');
  target.on('^once', function(e) {// late listener
    is.strictEqual(e, first, 'should get first once in late listener');
    first = null;
  });
  is.ok(!first, 'late listener should have fired synchronously');
  target.fire('once#third');
});

test('^sbubbles - parentNode and parentObject', function(is) {
  is.expect(1);
  var target = Eventi.fy({parentObject:{}});
  target.fire('^sbubbles');
  Eventi.on(target.parentObject, '^sbubbles', function(e) {
    is.equal(e.type, 'sbubbles');
  });
});

test('snobubble', function(is) {
  is.expect(1);
  var target = { parentObject: {} };
  Eventi.on(target, '^snobubble', function(e) {
    is.equal(e.type, 'snobubble');
  });
  Eventi.fire(target, '^_snobubble');
  Eventi.on(target.parentObject, '^snobubble', function() {
    is.ok(false, 'should not see snobubble here');
  });
  Eventi.on('^snobubble', function() {
    is.ok(false, 'should not see snobubble here');
  });
});

test('internal api presence', function(is) {
  is.ok(_.singleton, '_.singleton');
  is.ok(_._skey, '_._key');
  is.ok(_.remember, '_.remember');
});

test('_.singleton bubbles', function(is) {
  var e = {type:'singletonbubbles',bubbles:true},
    bar = { parentObject: global.foo = {} };
  _.singleton(bar, e);
  is.equal(bar[_._skey].pop(), e, 'bar should remember e');
  is.equal(global.foo[_._skey].pop(), e, 'global.foo should remember e');
  is.equal(_.global[_._skey].pop(), e, 'global should remember e');
  delete global.foo;
});

test('_.singleton bubbles=false', function(is) {
  var e = {type:'singleton'},
    bar = { parentObject: global.foo = {} };
  _.singleton(bar, e);
  is.equal(bar[_._skey].pop(), e, 'body should remember e');
  is.notEqual((global.foo[_._skey]||[]).slice(-1), e, 'document should not remember e');
  is.notEqual((_.global[_._skey]||[]).slice(-1), e, 'global should not remember e');
  delete global.foo;
});

test('_.remember', function(is) {
  var target = {},
    event = {};
  is.equal(Object.keys(target).length, 0, 'target should have no keys');
  _.remember(target, event);
  is.equal(Object.keys(target).length, 0, 'target should still have no keys');
  var saved = target[_._skey];
  is.ok(saved, 'target should have saved events array');
  is.equal(saved[0], event, 'should have event saved');
  _.remember(target, event);
  is.equal(saved.length, 2, 'should have two saved');
});
