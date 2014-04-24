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

test('external api presence', function(is) {
  is.ok(typeof Eventi.alias === "function", 'Eventi.alias');
});

test('no new Eventi().alias', function(is) {
  is.ok(!new Eventi().alias, 'should not get alias()');
});

test('Eventi.alias("type") API additions', function(is) {
  Eventi.alias('type');
  for (var p in _.fns) {
    is.equal(typeof Eventi[p].type, "function", "Eventi."+p+".type is a function");
  }
});

test('Eventi.alias(new Eventi(), "local signal") API additions', function(is) {
  is.expect(7);
  var o = new Eventi();
  is.equal(o.fire.signal, undefined, 'should not have signal yet');
  Eventi.alias(o, 'local /test:signal=>alias');
  for (var p in _.fns) {
    is.equal(typeof o[p].alias, "function", "should have alias alias");
    is.ok(o[p].local, "should have local alias");
  }
});

test('internal api presence', function(is) {
  is.ok(_.alias, "_.alias");
});

test('_.alias', function(is) {
  is.expect(6);
  var type = 'type',
    signal = _.alias(type, type);
  is.equal(typeof signal, "function", "should return function");

  var fn = function(type, one, two) {
    is.equal(type, 'type', "should get type argument");
    is.equal(one, 1, "should get argument one");
    is.equal(two, 2, "should get argument two");
  };
  fn[type] = _.alias(type, type);
  fn.type(1, 2);

  fn = function(target, type) {
    is.equal(typeof target, "object", "target should be an object");
    is.equal(type, 'type', 'should get type argument');
  };
  fn.index = 1;
  fn[type] = signal;
  fn.type({dispatchEvent:true});
});
