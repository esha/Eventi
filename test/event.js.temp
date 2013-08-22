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
(function(HTML) {

	function click(el) {
        if ('click' in el) {
            el.click();
        } else {
            var e = document.createEvent('MouseEvent');
            e.initMouseEvent('click', true, true,
                             window, null,
                             0, 0, 0, 0,
                             false, false, false, false,
                             0, null);
            el.dispatchEvent(e);
        }
	}

	module("event");

	test('HTML.event', function() {
		ok(HTML.event, 'HTML.event should be present');
	});

	test('custom event', 2, function() {
		var heard,
            fn = function(e) {
                heard = e;
                strictEqual(e.type, 'foo', 'got event of type foo');
            };
		HTML.addEventListener('foo', fn);
		var e = HTML.event('foo');
		strictEqual(e, heard, 'should be same event object');
        HTML.removeEventListener('foo', fn);
	});

	test('listen for click', 1, function() {
		HTML.body.event('click', function(e) {
			strictEqual(e.type, 'click', 'heard click event');
		});
		click(HTML.body);
        HTML.body.event(0, 'click');
	});

    test('listen for custom once', 3, function() {
        var heard;
        HTML.event(1, 'bar', function(e) {
            heard = e;
            strictEqual(e.type, 'bar', 'got bar event');
        });
        var first = HTML.body.event('bar');
        strictEqual(first, heard, 'should be same event object');
        var second = HTML.body.event('bar');
        notEqual(second, heard, 'should not be the same event object');
    });

    test('multiple types together', 8, function() {
        var heard,
        self = HTML.event('e1 e2 e3', function(e) {
            heard = e;
            ok(e.type.charAt(0), 'e', 'valid event type');
        });
        strictEqual(self, HTML, 'should return self');
        
        var e1 = HTML.event('e3 e2 e1')[2];
        strictEqual(heard, e1, 'should be same event');
        strictEqual(e1.type, 'e1', 'last event should be returned');
        
        self = HTML.event(0, 'e2 e1 e3');
        strictEqual(self, HTML, 'should return self');

        var e2 = HTML.event('e1 e3 e2')[2];
        notEqual(heard, e2, 'should not be heard');
    });

    test('multiple off, different types', 4, function() {
        var el = HTML.body.section,
            heard,
            fn = function(e) {
                heard = e;
                ok(e.type.charAt(0), 't', 'valid event type');
            };
        el.event('two', fn);
        el.event('too', fn);
        var e = el.event('two too')[1];
        strictEqual(heard, e, 'should be same event');
        el.event(0);
        e = el.event('too two');
        notEqual(e, heard, 'should not be same event');
    });

    test('multiple off, same type', 4, function() {
        var el = HTML.body.section,
            heard,
            fn = function(e) {
                heard = e;
                ok(e.type.charAt(0), 't', 'valid event type');
            };

        var e = el.event('to', fn).event('to', fn).event('to');
        strictEqual(e, heard, 'should be same event');
        el.event(0, 'to');
        e = el.event('to');
        notEqual(e, heard, 'should not be same event');
    });

    module("event: target practice");

    test('HTMLify target', 3, function() {
        HTML.body.insertAdjacentHTML('beforeend', '<section id="target"><a></a></section>');
        var el = document.getElementById('target');
        HTML.event('click', function(e) {
            strictEqual(e.target, el, 'has right target');
            ok(e.target.each, 'target has each()');
            ok(e.target.a, 'target has child');
        });
        click(el);
        HTML.event(0, 'click');
        el.remove();
    });

    test('closest()', 3, function() {
        HTML.body.insertAdjacentHTML('beforeend', '<section id="closest"><a></a></section>');
        var el = document.getElementById('closest');
        HTML.event('click', function(e) {
            ok(e.closest, 'has closest()');
            strictEqual(e.closest('body'), HTML.body, 'found parent');
            strictEqual(e.closest('#closest'), el, 'found target');
        });
        click(el);
        HTML.event(0, 'click');
        el.remove();
    });

	module("event: delegation");

	test('basic', 2, function() {
		HTML.event('click', 'section', function(e) {
            ok(this.matches('section'), 'this should be section, not html');
            strictEqual(this, e.closest('section'), 'should be the closest section to target');
        });
        click(HTML.query('section *').only(0));
        HTML.event(0);
	});

	module("event: each shorthand");

    test('noargs, delegation', 3, function() {
        HTML.body.insertAdjacentHTML('beforeend', '<a id="remove"></a>');
        HTML.event('click', 'a', 'remove');
        var el = HTML.query('#remove');
        ok(el && el.parentNode, 'have removable element');
        click(el);
        ok(!el.parentNode, 'element lost its parent');
        strictEqual(HTML.query('#remove').length, 0, 'no more #remove');
        HTML.event(0);
    });

	test('args', 3, function() {
        HTML.body.event('click', 'classList.toggle', ['active']);
        ok(!HTML.body.matches('.active'), 'starts inactive');
        click(HTML.body.section);
        ok(HTML.body.matches('.active'), 'should be active');
        click(HTML.query('section *').only(0));
        ok(!HTML.body.matches('.active'), 'should not be active');
		HTML.body.event(0);
	});

	module("event: binding data");

	test('bind with listener', 7, function() {
        var data = [true, 'stuff'];
        HTML.event('lbind', function(a, b, e) {
            strictEqual(a, data[0], 'should be true');
            strictEqual(b, data[1], 'should be stuff');
            strictEqual(e.type, 'lbind', 'event should always be third');
            data.push('another one');// listener data never changes
        }, data);
        HTML.event('lbind');
        strictEqual(data.length, 3, 'should be greater than two');
        HTML.event('lbind');
		HTML.event(0);
	});

    test('bind with event', 4, function() {
        HTML.event('ebind', function(e, a, b) {
            strictEqual(a, data[0], 'should be test');
            strictEqual(b, data[1], 'should be this');
            e.data.push(3);// event data can be changed
        });
        var data = ['test', 'this'];
        var e = HTML.event('ebind', data);
        strictEqual(e.data, data, 'same array all the way through');
        strictEqual(e.data[2], 3, 'got new data');
        HTML.event(0);
    });

    test('surround binding', 3, function() {
        HTML.event('sbind', function(pre, e, post) {
            strictEqual(pre, 'pre', 'should be pre');
            strictEqual(post, 'post', 'should be post');
            strictEqual(e.type, 'sbind', 'should be sbind event');
        }, ['pre']);
        HTML.event('sbind', ['post']);
        HTML.event(0);
    });

}(HTML));

