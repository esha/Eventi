(function() {

    var _ = Eventi._;
    module('Eventi end');

    test('Eventi.on("count$2", fn)', function() {
        expect(2);
        Eventi.on('count$2', function(e) {
            equal(e.type, 'count');
        });
        Eventi.fire('count count count');
    });

    test('Eventi.on("type$end",fn)', function() {
        expect(2);
        window.end = function(e) {
            equal(e.type, 'type');
            delete window.end;
            return true;
        };
        Eventi.on("type$end", function(e) {
            ok(e, 'once only');
        });
        Eventi.fire('type type');
    });

    test('Eventi.on("not$!nested.fn",fn)', function() {
        expect(3);
        window.nested = {
            fn: function(e) {
                equal(e.type, 'not');
                strictEqual(this, window);
                delete window.nested;
                return false;
            }
        };
        Eventi.on("not$!nested", function(e) {
            ok(e, 'once only');
        });
        Eventi.fire('not not not');
    });

    test('Eventi.on(obj, local$ender, fn)', function() {
        expect(4);
        var target = {
            ender: function(e) {
                equal(this, target);
                return e.last;
            }
        };
        Eventi.on(target, 'local$ender', function(e) {
            equal(e.type, 'local');
        });
        Eventi.fire(target, 'local local#last local');
    });

    test('internal api presence', function() {
        ok(_.endTest, "_.endTest");
    });

    test('_.endTest count', function() {
        var test = _.endTest("2");
        equal(typeof test, "function");
        equal(test(), false, "count should be 1 left");
        equal(test(), true, "count should be 0 left");
    });

    test('_.endTest value reference', function() {
        var test = _.endTest("value"),
            target = {value: false};
        equal(typeof test, "function");
        equal(test.call(target), false, "target value should be false");
        target.value = true;
        equal(test.call(target), true, "target value should be true");
    });

    test('_.endTest not reference', function() {
        var test = _.endTest("!value"),
            target = {value: true};
        equal(typeof test, "function");
        equal(test.call(target), false, "target value should be !true");
        target.value = false;
        equal(test.call(target), true, "target value should be !false");
    });

    test('_.endTest fn reference', function() {
        var test = _.endTest("end.test"),
            killit = false;
        window.end = { test: function() {
            return killit;
        }};
        equal(typeof test, "function");
        equal(test(), false);
        killit = true;
        equal(test(), true);
        delete window.end;
    });

    test('_.endTest empty', function() {
        var test = _.endTest("");
        equal(typeof test, "undefined", "should be undefined");
    });

}());
