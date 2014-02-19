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
  module('Eventi core');

  test('external api presence', function() {
    ok(typeof Eventi === "function", 'Eventi');
    ok(typeof Eventi.fy === "function", 'Eventi.fy');
  });

  test('new Eventi("test")', function() {
    var e = new Eventi('test');
    equal(typeof e, "object", "should return object");
    equal(e.type, "test", "type should be 'test'");
    equal(e.bubbles, true, "should bubble by default");
    ok(e.timeStamp, "should have a timestamp");
  });

  test('new Eventi("test", props)', function() {
    var e = new Eventi('test', {bubbles:false, foo: 'foo'});
    equal(e.bubbles, false, 'should not be set to bubble');
    equal(e.foo, 'foo', 'should have arbitrary foo property');
  });

  test('new Eventi("_category:type#tag#label(\'detail\')")', function() {
    var e = new Eventi("_category:type#tag#label(\"detail\")");
    equal(e.bubbles, false, 'should not be set to bubble');
    equal(e.category, 'category', 'should be in category');
    equal(e.type, 'type', 'should be of type');
    deepEqual(e.tags, ['tag','label'], 'should have two tags');
    ok(e.tag, 'tag property should be true');
    ok(e.label, 'label property should be true');
    equal(e.detail, 'detail', 'should have detail');
  });

  test('new Eventi("jsonDetail(...)")', function() {
    var evil = '#:_^ +>()',
        detail = new Eventi("jsonDetail([1,true,{\"foo\":\""+evil+"\"}])").detail;
    ok(Array.isArray(detail), "detail should be array");
    deepEqual(detail, [1, true, {foo:evil}], 'should be correctly parsed');
  });

  test('new Eventi("referenceDetail(Eventi.name)")', function() {
    var detail = new Eventi('referenceDetail(Eventi.name)').detail;
    equal(detail, 'Eventi', 'should be resolved reference');
  });

  test('Eventi.fy(obj) api', function() {
    var o = {};
    equal(Eventi.fy(o), o, 'should return object');
    ok(!o.fy, 'should not have fy function');
    ok(!o.name, 'should not inherit any properties');
  });

  test('internal api presence', function() {
    ok(typeof _ === "object", "Eventi._ should be present");
    ok(_.global, "_.global");
    ok(_.noop, "_.noop");
    ok(_.slice, "_.slice");
    ok(_.copy, "_.copy");
    ok(_.async, "_.async");
    ok(_.resolveRE, "_.resolveRE");
    ok(_.resolve, "_.resolve");
    ok(_.create, "_.create");
    ok(_.prop, "_.prop");
    ok(_.sIP, "_.sIP");
    ok(_.parse, "_.parse");
    ok(_.properties, "_.properties");
    ok(_.splitRE, "_.splitRE");
    ok(_.wrap, "_.wrap");
  });

  test('_.noop', function() {
    ok(!_.noop(), '_.noop should return nothing');
  });

  test('_.slice', function() {
    var array = [1,2,3];
    deepEqual(_.slice(array,1), [2,3], '_.slice should take index arg');
  });

  test('_.copy', function() {
    var From = function(){ this.foo = 1; },
        to = {};
    From.prototype = {bar:2};
    ok(!_.copy(new From(), to), '_.copy returns nothing');
    equal(to.foo, 1, 'to should have foo');
    notEqual(to.bar, 2, 'to should not have bar');
  });

  asyncTest('_.async', function() {
    var id = _.async(function() {
      ok(true, 'should be called');
      start();
    });
    ok(id, 'should have id');
  });

  test('_.resolve', function() {
    equal(_.resolve('module()') || _.resolve('test;foo') || _.resolve('a b'), undefined, 'should not resolve non-reference strings');
    equal(_.resolve('test'), test, 'should resolve test fn');
    equal(_.resolve('documentElement', document), document.documentElement, 'should resolve references against context');
    equal(_.resolve('Eventi.name'), 'Eventi', 'should resolve dot-notated references');
    equal(_.resolve('array[0]', { array: [1] }), 1, 'should resolve bracket-notated references');
  });

  // _.create and _.parse are tested via 'new Eventi' above

  test('_.prop', function() {
    var _prop = _.prop,
      props = 0;
    _.prop = function(p) {
      if (p === 'prop' || p === 'tag') {
        props++;
      }
      return _prop.apply(this, arguments);
    };
    new Eventi('type#tag', {prop:true});
    equal(props, 2, 'should have recognized two props');
    _.prop = _prop;
  });

  test('_.wrap', function() {
    expect(14);
    _.fn = function(target, strings, data) {
      ok(Array.isArray(strings), 'strings should be array (of strings)');
      equal(typeof strings[0], 'string', 'strings should always have at least one string');
      if (strings[0] === 'global') {
        equal(target, _.global, 'target should be global');
      } else {
        notEqual(target, _.global, 'target should not be global');
      }
      ok(!data || Array.isArray(data), 'data should be array or absent');
      if (data) {
        equal(data[0], 'data', 'got extra data');
      }
    };
    var api = _.wrap('fn', 2);
    notEqual(api, _.fn, 'should not return same fn');
    api('global', 'data');
    api([_.fn, api], 'multiple');
    delete _.fn;
  });

  // ensure ordered iteration over targets
  test('_.wrap multiple target order', function() {
    expect(2);
    var targets = ['a','b'];
    _.fn = function(target) {
      equal(target, targets.shift(), 'should receive targets in correct order');
    };
    _.wrap('fn', 2)(targets.slice(0), 'orderTest');
    delete _.fn;
  });

  test('_.wrap falsey event text', function() {
    expect(2);
    _.fn = function(target, strings) {
      equal(target, _.global, 'target should be _.global');
      equal(strings[0], '', 'text should be ""');
    };
    _.wrap('fn', 2)(null);
    delete _.fn;
  });

}());
