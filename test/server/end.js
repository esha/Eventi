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

test('Eventi.on("count$2", fn)', function(is) {
    is.expect(2);
    Eventi.on('count$2', function(e) {
        is.equal(e.type, 'count');
    });
    Eventi.fire('count count count');
});

test('Eventi.on("type$end",fn)', function(is) {
    is.expect(2);
    global.end = function(e) {
        is.equal(e.type, 'type');
        delete global.end;
        return true;
    };
    Eventi.on("type$end", function(e) {
        is.ok(e, 'once only');
    });
    Eventi.fire('type type');
});

test('Eventi.on("not$!nested.fn",fn)', function(is) {
    is.expect(3);
    global.nested = {
        fn: function(e) {
            is.equal(e.type, 'not');
            is.strictEqual(this, global);
            delete global.nested;
            return false;
        }
    };
    Eventi.on("not$!nested", function(e) {
        is.ok(e, 'once only');
    });
    Eventi.fire('not not not');
});

test('Eventi.on(obj, local$ender, fn)', function(is) {
    is.expect(4);
    var target = {
        ender: function(e) {
            is.equal(this, target);
            return e.last;
        }
    };
    Eventi.on(target, 'local$ender', function(e) {
        is.equal(e.type, 'local');
    });
    Eventi.fire(target, 'local local#last local');
});

test('internal api presence', function(is) {
    is.ok(_.endTest, "_.endTest");
});

test('_.endTest count', function(is) {
    var test = _.endTest("2");
    is.equal(typeof test, "function");
    is.equal(test(), false, "count should be 1 left");
    is.equal(test(), true, "count should be 0 left");
});

test('_.endTest value reference', function(is) {
    var test = _.endTest("value"),
        target = {value: false};
    is.equal(typeof test, "function");
    is.equal(test.call(target), false, "target value should be false");
    target.value = true;
    is.equal(test.call(target), true, "target value should be true");
});

test('_.endTest not reference', function(is) {
    var test = _.endTest("!value"),
        target = {value: true};
    is.equal(typeof test, "function");
    is.equal(test.call(target), false, "target value should be !true");
    target.value = false;
    is.equal(test.call(target), true, "target value should be !false");
});

test('_.endTest fn reference', function(is) {
    var test = _.endTest("end.test"),
        killit = false;
    global.end = { test: function() {
        return killit;
    }};
    is.equal(typeof test, "function");
    is.equal(test(), false);
    killit = true;
    is.equal(test(), true);
    delete global.end;
});

test('_.endTest empty', function(is) {
    var test = _.endTest("");
    is.equal(typeof test, "undefined", "should be undefined");
});
