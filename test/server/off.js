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
  is.ok(typeof Eventi.off === "function", 'Eventi.off');
});

test('Eventi.fy({}).off', function(is) {
  is.equal(Eventi.fy({}).off, Eventi.off, 'should get off()');
});

test('Eventi.off(type)', function(is) {
  is.expect(1);
  Eventi.on("test", function() {
    is.ok(true, 'should only be called once');
  })
  .fire('test');
  Eventi.off("test")
        .fire('test');
});

test('Eventi.off("category:")', function(is) {
  is.expect(2);
  Eventi.on("test:foo", function() {
    is.ok(true, 'should call foo once');
  })
  .on('test:bar', function() {
    is.ok(true, 'should call bar once');
  })
  .fire('test:foo test:bar');
  Eventi.off("test:")
        .fire('test:foo test:bar');
});

test('Eventi.off("#tag")', function(is) {
  is.expect(2);
  Eventi.on("foo#test", function() {
    is.ok(true, 'should call foo once');
  })
  .on('bar#test', function() {
    is.ok(true, 'should call bar once');
  })
  .fire('foo#test bar#test');
  Eventi.off("#test")
        .fire('foo#test bar#test');
});

test('Eventi.off(type,fn)', function(is) {
  is.expect(1);
  var fn = function() {
    is.ok(false, 'should not be called');
  },
  type = 'offfn';
  Eventi.on(type, fn)
        .on(type, function() {
          is.ok(true, 'should be called once');
        })
        .off(type, fn)
        .fire(type);
});

test('Eventi.off(target,type,fn)', function(is) {
  is.expect(2);
  var target = this;
  var fn = function() {
    is.strictEqual(this, target, 'should only fire on target');
  },
  type = 'offtargetfn',
  other = {},
  targets = [target, other];
  Eventi.on(targets, type, fn)
        .on(other, type, function() {
          is.ok(true, 'should be called once');
        })
        .off(other, type, fn)
        .fire(targets, type);
  Eventi.off(target, type, fn)
        .off(other, type)
        .fire(targets, type);
});

test('Eventi.off(target, type', function(is) {
  is.expect(1);
  var other = {},
    target = this,
    type = 'offtarget',
    targets = [target, other];
  Eventi.on(targets, type, function() {
    is.strictEqual(this, target, 'should only fire on target');
  })
  .off(other, type)
  .fire(targets, type);
  Eventi.off(target, type)
        .fire(targets, type);
});

test('Eventi.off("!important#tag")', function(is) {
  is.expect(2);
  Eventi.on("!important#tag", function(e) {
    is.equal(e.type, 'important');
    is.equal(e.important, undefined);
  })
  .off("important")
  .off('important#tag')
  .fire("important#tag");
  Eventi.off("!important#tag")
  .fire("important#tag");
});

test('Eventi.off within on nastiness', function(is) {
  is.expect(1);
  var type = 'bewarePrematureOptimization';
  Eventi.on(type, function() {
    is.ok(true, 'should be called');
    Eventi.off(type);
  })
  .on(type, function() {
    is.ok(false, 'should not be called');
  })
  .fire(type);
});

test('internal api presence', function(is) {
  is.ok(_.off, "_.off");
  is.ok(_.unhandle, "_.unhandle");
  is.ok(_.empty, "_.empty");
  is.ok(_.clean, "_.clean");
  is.ok(_.cleans, "_.cleans");
});

test('off:filter event', function(is) {
  is.expect(2);
  var target = {},
    type = 'filterme',
    fn = function(e, f) {
      if (f.event.type === type) {
        is.equal(e.type, 'filter');
        is.equal(e.category, 'off');
      }
    };
  Eventi.on(target, type, function(){})
        .on(_, 'off:filter', fn)
        .off(target, type)
        .off(_, 'off:filter', fn);
});

test('off:cleaned event', function(is) {
  is.expect(4);
  var target = {},
    type = 'offevent',
    fn = function(e, h) {
      if (h.event.type === type) {
        is.equal(e.type, 'cleaned');
        is.equal(e.category, 'off');
        is.ok(h === handler, 'should pass off\'ed handler');
      }
    };
  Eventi.on(target, type, function(){});
  var handler = target[_._key].s[type][0];
  is.ok(handler, 'should be able to snag ref to handler');
  Eventi.on(_, 'off:cleaned', fn)
        .off(target, type)
        .off(_, 'off:cleaned', fn);
});

test('_.unhandle not just noop', function(is) {
  is.equal(_.unhandle.name, 'off', 'should override on.js\' noop version');
});

test('_.empty', function(is) {
  is.ok(_.empty({}), 'should be empty');
  is.ok(!_.empty({foo:1}), 'should not be empty');
  function A(){}
  A.prototype = { foo: 1 };
  var a = new A();
  is.ok(!_.empty(a), 'those with inherited props should not be empty');
  var o = {};
  Object.defineProperty(o, 'foo', {value:1});
  is.ok(_.empty(o), 'non-enumerable defined props should keep things empty');
});
