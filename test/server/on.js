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
  is.ok(typeof Eventi.on === "function", 'Eventi.on');
});

test('Eventi.fy({}).on', function(is) {
  is.equal(Eventi.fy({}).on, Eventi.on, 'should get on()');
});

test('Eventi.on(type,fn)', function(is) {
  is.expect(4);
  Eventi.on('type', function(e) {
    is.equal(e.type, 'type', 'should get event of type');
    is.equal(arguments.length, 1, 'should have only one arg here');
  });
  Eventi.fire('type');
  Eventi.on('data', function(e, data) {
    is.equal(e.type, 'data', 'should be a data event');
    is.equal(data, 'data', 'should have right data');
  }).fire('data', 'data');
  Eventi.off('type data');
});

test('Eventi.on(o,type,fn,data)', function(is) {
  is.expect(4);
  var o = {},
    fn = function(e, edata, hdata) {
      is.equal(e.type, 'type');
      is.equal(edata, 'edata');
      is.equal(hdata, 'hdata');
      is.equal(this, o);
    };
  Eventi.on(o, 'type', fn, 'hdata').fire(o, 'type', 'edata');
});

test('Eventi.on({type:fn,other:fn1})', function(is) {
  is.expect(2);
  Eventi.on({
    type: function(e) {
      is.equal(e.type, 'type');
    },
    'other$1': function(e) {
      is.equal(e.type, 'other');
    }
  });
  Eventi.fire('type other other');
  Eventi.off('type');
});

test('Eventi.on(target, {type:fn,other:fn2})', function(is) {
  is.expect(3);
  var target = {},
    handlers = {
    type: function(e) {
      is.equal(e.type, 'type');
    },
    "other#tagged": function(e) {
      is.equal(e.type, 'other');
      is.equal(e.tagged, true);
    }
  };
  Eventi.on(target, handlers);
  Eventi.fire(target, Object.keys(handlers));
});

test('_.listener', function(is) {
  var o = {},
    listener = _.listener(o);
  is.equal(typeof listener, "function", 'should get listener function back');
  is.equal(typeof listener.s, "object", "should have 's' object");
  is.equal(_.listener(o), listener, 'should always get same listener back');
  for (var key in o) {
    is.ok(false, 'object should not enumerate key: '+key);
  }
});

test('_.execute', function(is) {
  is.expect(4);
  var e = new Eventi('type'),
    target = {},
    fn = function(e, eventData, handlerData) {
      is.equal(e.type, 'type', 'should get event of proper type');
      is.equal(eventData, 'eventData', 'should get event data');
      is.equal(handlerData, 'handlerData', 'should get handler data');
      is.equal(this, target, 'should have target as context');
    },
    handler = { target:target, data: ['handlerData'], fn: fn, filters:[] };
    e.data = ['eventData'];
    _.execute(e, handler);
});

//TODO: test handler.filters
//TODO: test handler.end

test('_.matches', function(is) {
  var e = new Eventi('cat:type#tag(detail)');
  is.ok(_.matches(e, {}), 'should always match empty object');
  is.ok(!_.matches(e, {foo:'bar'}), 'should not match random object');
  is.ok(_.matches(e, {type:'type'}), 'should match type alone');
  is.ok(_.matches(e, {category:'cat',type:'type',tag:true,detail:'detail'}), 'should match everything');
});

test('on:handler event', function(is) {
  is.expect(4);
  var target = {},
    type = 'onevent',
    passed,
    fn = function(e, h) {
      if (h.text === type) {// don't let problems with _.off bug us
        is.equal(e.type, 'handler');
        is.equal(e.category, 'on');
        passed = h;
      }
    };
  Eventi.on(_, 'on:handler', fn)
        .on(target, type, function(){})
        .off(_, 'on:handler', fn);
  var handler = target[_._key].s[type][0];
  is.ok(handler, 'should get new handler directly');
  is.ok(passed === handler, 'should pass new handler');
});

test('internal api presence', function(is) {
  is.ok(_.on, "_.on");
  is.ok(_.handler, "_.handler");
  is.ok(_.listener, "_.listener");
  is.ok(_.handle, "_.handle");
  is.ok(_.execute, "_.execute");
  is.ok(_.unhandle, "_.unhandle");
  is.ok(_.matches, "_.matches");
});
