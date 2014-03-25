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

  var _ = Eventi._,
    home = location.pathname;
  Eventi._.pushState.call(history, null,null,home);

  module('Eventi location', {
    teardown: function() {
      Eventi.off('location');
      history.pushState(null,'teardown',home);
    }
  });

  test('location Eventi.html', function() {
    expect(3);
    var uri = 'Eventi.html';
    Eventi.on('location<'+uri+'>', function(e, match) {
      equal(e.type, 'location');
      ok(e.uri, 'event should have uri');
      equal(match, uri);
      Eventi.off('location');
      history.pushState(null,null,home);
    });
  });
/*
  test('location regex', function() {
    expect(2);
    Eventi.on('location', /(\w+)\.html/, function(e, match, file) {
      equal(match, 'Eventi.html');
      equal(file, 'Eventi');
      Eventi.off('location');
      history.pushState(null,null,home);
    });
  });
*/
  test('location template', function() {
    expect(4);
    Eventi.on('location<{file}.html>', function(e, vals, file) {
      equal(typeof vals, "object", "should have match object");
      equal(vals.file, 'Eventi');
      equal(vals.match, 'Eventi.html');
      equal(file, vals.file);
      Eventi.off('location');
      history.pushState(null,null,home);
    });
  });

  test('location handler data after match data', function() {
    expect(2);
    Eventi.on('location<test>', function(e, match, hdata) {
      equal(match, 'test');
      equal(hdata, 'hdata');
      Eventi.off('location');
      history.pushState(null,null,home);
    }, 'hdata');
  });

  /*test('location hashchange', function() {
    expect(1);
    Eventi.on('location', '#hashed', function(e) {
      equal(e.uri, location.pathname+location.search+'#hashed');
      Eventi.off('location');
      history.pushState(null,null,home);
    });
    location.hash = 'hashed';
  });

  test('location pushstate', function() {
    expect(1);
    Eventi.on('location', '?search', function(e) {
      if (e.srcEvent.type === 'popstate') {
        Eventi.off('location');
        ok(true, 'should get here via popstate');
        history.pushState(null,null,home);
      }
    });
    history.pushState(null,null,'?search');
    history.pushState(null,null,'?whatever');
    history.back();
  });*/

  test('all location listener', function() {
    expect(1);
    Eventi.on('location#all', function(e) {
      equal(e.uri, _.uri, 'should have current uri');
      Eventi.off('location#all');
    });
  });

  test('location pushstate', function() {
    expect(3);
    Eventi.on('location<?search>', function(e) {
      Eventi.off('location');
      ok(e.srcEvent, 'should have srcEvent');
      equal(e.srcEvent.type, 'pushstate','should be pushstate source');
      equal(e.uri, location.pathname+'?search', 'should have correct e.uri');
      history.pushState(null,null,home);
    });
    history.pushState(null,null,'?search');
  });

  test('location set via event', function() {
    expect(5);
    var uri = _.uri,
      fired = false;
    Eventi.on('location<?view={view}>', function(e, match) {
      equal(e.oldURI, uri);
      equal(e.uri, location.pathname + '?view=foo');
      equal(e.srcEvent && e.srcEvent.type, 'pushstate');
      equal(match.view, 'foo');
      ok(!fired);
      fired = true;
      Eventi.off('location');
      history.pushState(null,null,home);
    });
    Eventi.fire('location', '?view={view}', {view:'foo'});
  });

  test('location multiple handlers', function() {
    expect(2);
    Eventi.on('location<?search>', function(e) {
      ok(e.uri.indexOf('?search') > 0);
    })
    .on('location<#hashes>', function(e) {
      ok(e.uri.indexOf('#hashes') > 0);
      Eventi.off('location');
      history.pushState(null,null,home);
    });
    history.pushState(null, null, '?search#hashes');
  });

  test('alternate target', function() {
    var target = {};
    Eventi.on(target, 'location<#target>', function() {
      equal(this, target, 'should have target context');
      Eventi.off('location');
      history.pushState(null,null,home);
    });
    history.pushState(null,'target', '#target');
  });

  module('Eventi location internals');

  test('internal api presence', function() {
    equal(typeof _.at, "function", "_.at");
    equal(typeof _.keys, "function", "_.keys");
    equal(typeof _.location, "function", "_.location");
  });

  test('_.at', function() {
    equal(_.at(), decodeURI(location.pathname+location.search+location.hash));
  });

  test('_.keys', function() {
    var keys = _.keys("{a} {b} {f.d} {0}");
    equal(null, _.keys('this is not parameterized'));
    ok(keys, 'should not be null');
    equal(keys[0], 'a');
    equal(keys[1], 'b');
    equal(keys[2], '0');
    equal(keys.length, 3);
  });

}());
