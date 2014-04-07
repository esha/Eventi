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

  test('external api presence', function() {
    ok(typeof Eventi.on === "function", 'Eventi.on');
  });

  test('Eventi.fy({}).on', function() {
    equal(Eventi.fy({}).on, Eventi.on, 'should get on()');
  });

  test('Eventi.on(type,fn)', function() {
    expect(4);
    Eventi.on('type', function(e) {
      equal(e.type, 'type', 'should get event of type');
      equal(arguments.length, 1, 'should have only one arg here');
    });
    Eventi.fire('type');
    Eventi.on('data', function(e, data) {
      equal(e.type, 'data', 'should be a data event');
      equal(data, 'data', 'should have right data');
    }).fire('data', 'data');
    Eventi.off('type data');
  });

  test('Eventi.on(o,type,fn,data)', function() {
    expect(4);
    var o = {},
      fn = function(e, edata, hdata) {
        equal(e.type, 'type');
        equal(edata, 'edata');
        equal(hdata, 'hdata');
        equal(this, o);
      };
    Eventi.on(o, 'type', fn, 'hdata').fire(o, 'type', 'edata');
  });

  test('Eventi.on(target, {type:fn,other:fn2})', function() {
    expect(3);
    var target = {},
      handlers = {
      type: function(e) {
        equal(e.type, 'type');
      },
      "other#tagged": function(e) {
        equal(e.type, 'other');
        equal(e.tagged, true);
      }
    };
    Eventi.on(target, handlers);
    Eventi.fire(target, Object.keys(handlers));
  });

  test('_.listener', function() {
    var o = {},
      listener = _.listener(o);
    equal(typeof listener, "function", 'should get listener function back');
    equal(typeof listener.s, "object", "should have 's' object");
    equal(_.listener(o), listener, 'should always get same listener back');
    for (var key in o) {
      ok(false, 'object should not enumerate key: '+key);
    }
  });

  test('_.execute', function() {
    expect(4);
    var e = new Eventi('type'),
      target = {},
      fn = function(e, eventData, handlerData) {
        equal(e.type, 'type', 'should get event of proper type');
        equal(eventData, 'eventData', 'should get event data');
        equal(handlerData, 'handlerData', 'should get handler data');
        equal(this, target, 'should have target as context');
      },
      handler = { target:target, data: ['handlerData'], fn: fn, filters:[] };
      e.data = ['eventData'];
      _.execute(e, handler);
  });

  //TODO: test handler.filters
  //TODO: test handler.end

  test('_.matches', function() {
    var e = new Eventi('cat:type#tag(detail)');
    ok(_.matches(e, {}), 'should always match empty object');
    ok(!_.matches(e, {foo:'bar'}), 'should not match random object');
    ok(_.matches(e, {type:'type'}), 'should match type alone');
    ok(_.matches(e, {category:'cat',type:'type',tag:true,detail:'detail'}), 'should match everything');
  });

  test('on:handler event', function() {
    expect(4);
    var target = {},
      type = 'onevent',
      passed,
      fn = function(e, h) {
        if (h.text === type) {// don't let problems with _.off bug us
          equal(e.type, 'handler');
          equal(e.category, 'on');
          passed = h;
        }
      };
    Eventi.on(_, 'on:handler', fn)
          .on(target, type, function(){})
          .off(_, 'on:handler', fn);
    var handler = target[_._key].s[type][0];
    ok(handler, 'should get new handler directly');
    ok(passed === handler, 'should pass new handler');
  });

  test('internal api presence', function() {
    ok(_.on, "_.on");
    ok(_.handler, "_.handler");
    ok(_.listener, "_.listener");
    ok(_.handle, "_.handle");
    ok(_.execute, "_.execute");
    ok(_.unhandle, "_.unhandle");
    ok(_.matches, "_.matches");
  });

}());
