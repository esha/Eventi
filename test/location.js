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
  Eventi._.replaceState.call(history, null,null,home);

  module('Eventi location', {
    teardown: function() {
      Eventi.off('location');
      history.replaceState(null,'teardown',home);
    }
  });

  test('location Eventi.html', function() {
    expect(3);
    var uri = 'Eventi.html';
    Eventi.on('location@'+uri, function(e, match) {
      equal(e.type, 'location');
      ok(e.location, 'event should have uri');
      equal(match, uri);
      Eventi.off('location');
      history.pushState(null,null,home);
    });
  });

  test('location regex', function() {
    expect(2);
    Eventi.on('location@`(\\w+)\\.html`', function(e, match, file) {
      equal(match, 'Eventi.html');
      equal(file, 'Eventi');
      Eventi.off('location');
      history.replaceState(null,null,home);
    });
  });

  test('location template', function() {
    expect(4);
    Eventi.on('location@{file}.html', function(e, vals, file) {
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
    Eventi.on('location@test', function(e, match, hdata) {
      equal(match, 'test');
      equal(hdata, 'hdata');
      Eventi.off('location');
      history.replaceState(null,null,home);
    }, 'hdata');
  });

  /*test('location hashchange', function() {
    expect(1);
    Eventi.on('location', '#hashed', function(e) {
      equal(e.location, location.pathname+location.search+'#hashed');
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
        history.replaceState(null,null,home);
      }
    });
    history.pushState(null,null,'?search');
    history.replaceState(null,null,'?whatever');
    history.back();
  });*/

  test('all location listener', function() {
    expect(1);
    Eventi.on('location#all', function(e) {
      equal(e.location, _.getLocation(), 'should have current uri');
      Eventi.off('location#all');
    });
  });

  test('location pushstate', function() {
    expect(3);
    Eventi.on('location@?search', function(e) {
      Eventi.off('location');
      ok(e.srcEvent, 'should have srcEvent');
      equal(e.srcEvent.type, 'pushstate','should be pushstate source');
      equal(e.location, location.pathname+'?search', 'should have correct e.location');
      history.replaceState(null,null,home);
    });
    history.replaceState(null,null,'?search');
  });

  test('location set via event', function() {
    expect(8);
    var oldLocation = _.getLocation(),
        newLocation = oldLocation + '?view=foo',
      locationEvent = false,
      pushstateEvent = false;
    Eventi.on('location@?view={view}', function(e, match) {
      equal(e.oldLocation, oldLocation);
      equal(e.location, newLocation);
      equal(e.srcEvent && e.srcEvent.type, 'pushstate');
      equal(match.view, 'foo');
      ok(!locationEvent, 'should only be handled once');
      locationEvent = true;
      Eventi.off('location');
    }).on('pushstate', function(e) {
      ok(!e.location, 'no location with pushstate notifications');
      equal(_.getLocation(), newLocation);
      ok(!pushstateEvent, 'should only be handled once');
      pushstateEvent = true;
      Eventi.off('pushstate');
      history.pushState(null,null,home);
    });
    Eventi.fire('location', '?view={view}', {view:'foo'});
  });

  test('location multiple handlers', function() {
    expect(2);
    Eventi.on('location@?search', function(e) {
      ok(e.location.indexOf('?search') > 0);
    })
    .on('location@#hashes', function(e) {
      ok(e.location.indexOf('#hashes') > 0);
      Eventi.off('location');
      history.pushState(null,null,home);
    });
    history.pushState(null, null, '?search#hashes');
  });

  test('alternate target', function() {
    var target = {};
    Eventi.on(target, 'location@#target', function() {
      equal(this, target, 'should have target context');
      Eventi.off('location');
      history.replaceState(null,null,home);
    });
    history.replaceState(null,'target', '#target');
  });

  test('default type', function() {
    Eventi.on('@#default', function(e) {
      equal(e.type, 'location');
      Eventi.off('location');
      history.pushState(null, null, home);
    });
    history.pushState(null,'default','#default');
  });

  module('Eventi location internals');

  test('internal api presence', function() {
    equal(typeof _.pushState, "function", "_.pushState");
    equal(typeof _.replaceState, "function", "_.replaceState");
    equal(typeof _.location, "function", "_.location");
    equal(typeof _.keys, "function", "_.keys");
    equal(typeof _.setLocation, "function", "_.setLocation");
    equal(typeof _.locationHandler, "function", "_.locationHandler");
    equal(typeof _.locationFilter, "function", "_.locationFilter");
  });

  test('_.location', function() {
    equal(_.getLocation(), decodeURI(location.pathname+location.search+location.hash));
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
