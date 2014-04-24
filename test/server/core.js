var server = require('../../dist/eventi.server.js');
var Eventi = server.Eventi;
var Event = server.Event;
var _ = Eventi._;

function test(name, fn) {
    exports[name] = function(is) {
        if (fn.call({}, is) !== false) {
            is.done();
        }
    };
}

test('external api presence', function(is) {
    is.ok(typeof Eventi === "function", 'Eventi');
    is.ok(typeof Eventi.fy === "function", 'Eventi.fy');
});

test('new Eventi("test")', function(is) {
    var e = new Eventi('test');
    is.equal(typeof e, "object", "should return object");
    is.equal(e.type, "test", "type should be 'test'");
    is.equal(e.bubbles, true, "should bubble by default");
    is.ok(e.timeStamp, "should have a timestamp");
    is.ok(e instanceof Event, "should be an Event");
});

test('new Eventi("test", props)', function(is) {
    var e = new Eventi('test', {bubbles:false, foo: 'foo'});
    is.equal(e.bubbles, false, 'should not be set to bubble');
    is.equal(e.foo, 'foo', 'should have arbitrary foo property');
});

test('new Eventi("_!category:type#tag#label(\'detail\')")', function(is) {
    var e = new Eventi("_category:type#tag#label(\"detail\")");
    is.equal(e.bubbles, false, 'should not be set to bubble');
    is.equal(e.category, 'category', 'should be in category');
    is.equal(e.type, 'type', 'should be of type');
    is.deepEqual(e.tags, ['tag','label'], 'should have two tags');
    is.ok(e.tag, 'tag property should be true');
    is.ok(e.label, 'label property should be true');
    is.equal(e.detail, 'detail', 'should have detail');
});

test('new Eventi("jsonDetail(...)")', function(is) {
    var evil = '#:_^ +>()',
        detail = new Eventi("jsonDetail([1,true,{\"foo\":\""+evil+"\"}])").detail;
    is.ok(Array.isArray(detail), "detail should be array");
    is.deepEqual(detail, [1, true, {foo:evil}], 'should be correctly parsed');
});

test('new Eventi("referenceDetail(reference.property)")', function(is) {
    global.reference = { property: 'value' };
    var detail = new Eventi('referenceDetail(reference.property)').detail;
        is.equal(detail, 'value', 'should be resolved reference');
    delete global.reference;
});

test('Eventi.fy(obj) api', function(is) {
    var o = {};
    is.equal(Eventi.fy(o), o, 'should return object');
    is.ok(!o.fy, 'should not have fy function');
    is.ok(!o.name, 'should not inherit any properties');
});

test('Eventi.toString()', function(is) {
    is.equal(Eventi+'', "Eventi, v"+_.version);
});

test('internal api presence', function(is) {
    is.ok(typeof _ === "object", "Eventi._ should be present");
    is.ok(_.global, "_.global");
    is.ok(_.noop, "_.noop");
    is.ok(_.slice, "_.slice");
    is.ok(_.copy, "_.copy");
    is.ok(_.async, "_.async");
    is.ok(_.resolveRE, "_.resolveRE");
    is.ok(_.resolve, "_.resolve");
    is.ok(_.create, "_.create");
    is.ok(_.prop, "_.prop");
    is.ok(_.parse, "_.parse");
    is.ok(_.parsers, "_.parsers");
    is.ok(_.fn, "_.fn");
    is.equal(typeof _.version, "string", "_.version");
    is.notEqual(_.version, "<%= pkg.version %>");
    is.equal(typeof _.fns, "object", "_.fns");
    is.equal(typeof _.split, "object", "_.split");
    is.equal(typeof _.split.guard, "object", "_.split.guard");
    is.equal(typeof _.split.ter, "function", "_.split.ter");
});

test('_.noop', function(is) {
    is.ok(!_.noop(), '_.noop should return nothing');
});

test('_.slice', function(is) {
    var array = [1,2,3];
    is.deepEqual(_.slice(array,1), [2,3], '_.slice should take index arg');
});

test('_.copy', function(is) {
    var From = function(){ this.foo = 1; },
        to = {};
    From.prototype = {bar:2};
    is.ok(!_.copy(new From(), to), '_.copy returns nothing');
    is.equal(to.foo, 1, 'to should have foo');
    is.notEqual(to.bar, 2, 'to should not have bar');
});

test('_.async', function(is) {
    var id = _.async(function() {
        is.ok(true, 'should be called');
        is.done();
    });
    is.ok(id, 'should have id');
    return false;
});

test('_.resolve', function(is) {
    is.equal(_.resolve('module()') || _.resolve('test;foo') || _.resolve('a b'), undefined, 'should not resolve non-reference strings');
    is.equal(_.resolve('process'), process, 'should resolve process object');
    var ctx = { foo: { bar: 1 } };
    is.equal(_.resolve('foo', ctx), ctx.foo, 'should resolve references against context');
    is.equal(_.resolve('foo.bar', ctx), ctx.foo.bar, 'should resolve dot-notated references');
    is.equal(_.resolve('array[0]', { array: [1] }), 1, 'should resolve bracket-notated references');
});

// _.create and _.parse are tested via 'new Eventi' above

test('_.prop', function(is) {
    var _prop = _.prop,
    props = 0;
    _.prop = function(p) {
        if (p === 'prop' || p === 'tag') {
            props++;
        }
        return _prop.apply(this, arguments);
    };
    new Eventi('type#tag', {prop:true});
    is.equal(props, 2, 'should have recognized two props');
    _.prop = _prop;
});

test('_.fn', function(is) {
    is.expect(16);
    _.test1 = function(target, strings, data) {
        is.ok(Array.isArray(strings), 'strings should be array (of strings)');
        is.equal(typeof strings[0], 'string', 'strings should always have at least one string');
        if (strings[0] === 'global') {
            is.equal(target, _.global, 'target should be global');
        } else {
            is.notEqual(target, _.global, 'target should not be global');
        }
        is.ok(!data || Array.isArray(data), 'data should be array or absent');
        if (data) {
            is.equal(data[0], 'data', 'got extra data');
        }
    };
    _.fn('test1', 2);
        is.equal(typeof Eventi.test1, "function", "Eventi.test1 defined");
        is.equal(Eventi.test1, _.fns.test1, 'should have reference in _.fns');
        is.notEqual(Eventi.test1, _.test1, 'should not return same fn');
    Eventi.test1('global', 'data');
    Eventi.test1([_.fn, Eventi.test1], 'multiple');
    delete _.test1;
    delete Eventi.test1;
    delete _.fns.test1;
});

// ensure ordered iteration over targets
test('_.fn multiple target order', function(is) {
    is.expect(2);
    var targets = ['a','b'];
    _.test2 = function(target) {
        is.equal(target, targets.shift(), 'should receive targets in correct order');
    };
    _.fn('test2', 2);
    Eventi.test2(targets.slice(0), 'orderTest');
    delete _.test2;
    delete Eventi.test2;
    delete _.fns.test2;
});

test('_.fn falsey event text', function(is) {
    is.expect(2);
    _.test3 = function(target, strings) {
        is.equal(target, _.global, 'target should be _.global');
        is.equal(strings[0], '', 'text should be ""');
    };
    _.fn('test3', 2);
    Eventi.test3(null);
    delete _.test3;
    delete _.fns.test3;
    delete Eventi.test3;
});

test('_.split.ter', function(is) {
    is.deepEqual(_.split.ter('a b'), ['a','b']);
    is.deepEqual(_.split.ter('a( ) b()'), ['a( )','b()']);
    is.deepEqual(_.split.ter('a(\\)) b'), ['a())','b']);
});
