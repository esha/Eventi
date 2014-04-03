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
  module('Eventi sequence');

  test('firing sequence API', function() {
    Eventi.on('two', function(e) {
      equal(e.index, 1);
      deepEqual(e.sequence, ['one','two']);
      equal(e.previousEvent.type, 'one');
      equal(typeof e.resumeSequence, "function");
      equal(typeof e.pauseSequence, "function");
      equal(typeof e.isSequencePaused, "function");
      equal(e.isSequencePaused(), false);
    });
    Eventi.fire('one,two');
    Eventi.off('two');
  });

  test('pauseSequence', function() {
    expect(1);
    Eventi.on('one', function(e) {
      e.pauseSequence();
    });
    Eventi.on('one', function(e) {
      equal(e.isSequencePaused(), true);
    });
    Eventi.on('two', function(e) {
      ok(!e, 'should have paused before this');
    });
    Eventi.fire('one+two');
    Eventi.off('one two');
  });

  asyncTest('pause and resume async', function() {
    expect(2);
    Eventi.on('one', function(e) {
      e.pauseSequence();
    });
    Eventi.on('one', function(e) {
      equal(e.isSequencePaused(), true);
      setTimeout(function() {
        start();
        e.resumeSequence();
      }, 10);
    });
    Eventi.on('two', function(e) {
      equal(e.isSequencePaused(), false);
      Eventi.off('one two');
    });
    Eventi.fire('one+two');
  });

  asyncTest('promise-based resume', function() {
    expect(3);
    Eventi.on('a', function(e) {
      e.pauseSequence({
        then: function(resume) {
          equal(typeof resume, "function");
          setTimeout(function() {
            start();
            resume();
          }, 20);
        }
      });
      equal(e.isSequencePaused(), true);
    });
    Eventi.on('b', function(e) {
      ok(e);
      Eventi.off('b');
    });
    Eventi.fire('a,b');
    Eventi.off('a');
  });

  test('resume at index', function() {
    var start;
    Eventi.on('start', function(e) {
      start = e;
      e.pauseSequence();
      equal(e.index, 0);
      e.resumeSequence(2);
    });
    Eventi.on('skip', function() {
      ok(false, 'should be skipped');
    });
    Eventi.on('restart', function(e) {
      equal(e.index, 2);
      strictEqual(e.previousEvent, start);
      Eventi.off('start skip restart');
    });
    Eventi.fire('start+skip+restart');
  });

  test('internal api presence', function() {
    equal(typeof _.sequence, "function", "_.sequence");
  });

  test('_.sequence', function() {
    var e = {};
    _.sequence(e, {index:0,sequence:['foo','bar']}, window);
    equal(typeof e.resumeSequence, "function");
    equal(typeof e.pauseSequence, "function");
    equal(typeof e.isSequencePaused, "function");
    equal(e.isSequencePaused(), false);
    e.pauseSequence();
    equal(e.isSequencePaused(), true);
  });

}());
