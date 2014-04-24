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

function onCombo(is, text, fn, fire) {
  Eventi.on(text, function(e) {
    is.equal(e.category, 'combo');
    is.equal(e.text, text);
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

test('ordered', function(is) {
  is.expect(6);
  onCombo(is, 'one,two', function(e) {
    is.ok(Array.isArray(e.events));
    is.equal(e.events.length, 2);
    is.equal(e.events[0].type, 'one');
    is.equal(e.events[1].type, 'two');
  });
});

test('nodupes', function(is) {
  is.expect(6);
  onCombo(is, 'one,one,one', function(e) {
    is.equal(e.events.length, 3);
    while (e.events.length) {
      var sub = e.events.pop();
      is.equal(e.events.indexOf(sub), -1, "should not be used twice");
    }
  });
});

test('unordered', function(is) {
  is.expect(2);
  onCombo(is, 'this+that', null, 'that this');
});

test('unordered with ordered sub', function(is) {
  is.expect(2);
  onCombo(is, 'this+that,then', null, 'this that then');
});

test('unordered with overlapping ordered subs', function(is) {
  is.expect(2);
  onCombo(is, 'first,this+that,then', null, 'first that this then');
});

test('sub-events with properties', function(is) {
  is.expect(3);
  onCombo(is, 'cat:this+that#tag', function(e) {
    is.equal(e.tags, undefined);
  });
});

test('timeout success', function(is) {
  is.expect(1);
  Eventi.on('one,two', function(e) {
    is.ok(e);
  }, 500);
  Eventi.fire('one');
  setTimeout(function() {
    Eventi.fire('two');
    Eventi.off('one,two');
    is.done();
  }, 100);
  return false;
});

test('timeout fail', function(is) {
  is.expect(0);
  Eventi.on('this+that', function(e) {
    is.ok(!e,'should not have e');
  }, 100);
  Eventi.fire('this');
  setTimeout(function() {
    Eventi.fire('that');
    Eventi.off('this+that');
    is.done();
  }, 500);
  return false;
});

test('internal api presence', function(is) {
  is.equal(typeof _.combo, "object", "_.combo");
  is.equal(typeof _.combo.count, "number", "_.combo.count");
  is.equal(typeof _.combo.split, "function", "_.combo.split");
  is.equal(typeof _.combo.reset, "function", "_.combo.reset");
  is.equal(typeof _.combo.event, "function", "_.combo.event");
  is.equal(typeof _.combo.eventFn, "function", "_.combo.eventFn");
});

test('_.combo.split', function(is) {
  var single = _.combo.split('single'),
    arr;
  is.deepEqual(single, ['single']);
  var ordered = _.combo.split('one,two');
  arr = ['one','two'];
  arr.ordered = true;
  is.deepEqual(ordered, arr, 'should have both events');
  var unordered = _.combo.split('this+that');
  arr = ['this','that'];
  arr.ordered = false;
  is.deepEqual(unordered, arr, 'should have both events');
  var both = _.combo.split('one,two+other');
  arr = ['one,two', 'other'];
  arr.ordered = false;
  is.deepEqual(both, arr, 'should be split on unordered');
});
