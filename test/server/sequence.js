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

test('firing sequence API', function(is) {
  Eventi.on('two', function(e) {
    is.equal(e.index, 1);
    is.deepEqual(e.sequence, ['one','two']);
    is.equal(e.previousEvent.type, 'one');
    is.equal(typeof e.resumeSequence, "function");
    is.equal(typeof e.pauseSequence, "function");
    is.equal(typeof e.isSequencePaused, "function");
    is.equal(e.isSequencePaused(), false);
  });
  Eventi.fire('one,two');
  Eventi.off('two');
});

test('pauseSequence', function(is) {
  is.expect(1);
  Eventi.on('one', function(e) {
    e.pauseSequence();
  });
  Eventi.on('one', function(e) {
    is.equal(e.isSequencePaused(), true);
  });
  Eventi.on('two', function(e) {
    is.ok(!e, 'should have paused before this');
  });
  Eventi.fire('one+two');
  Eventi.off('one two');
});

test('pause and resume async', function(is) {
  is.expect(2);
  Eventi.on('one', function(e) {
    e.pauseSequence();
  });
  Eventi.on('one', function(e) {
    is.equal(e.isSequencePaused(), true);
    setTimeout(function() {
      e.resumeSequence();
      is.done();
    }, 10);
  });
  Eventi.on('two', function(e) {
    is.equal(e.isSequencePaused(), false);
    Eventi.off('one two');
  });
  Eventi.fire('one+two');
  return false;
});

test('promise-based resume', function(is) {
  is.expect(3);
  Eventi.on('a', function(e) {
    e.pauseSequence({
      then: function(resume) {
        is.equal(typeof resume, "function");
        setTimeout(function() {
          resume();
          is.done();
        }, 20);
      }
    });
    is.equal(e.isSequencePaused(), true);
  });
  Eventi.on('b', function(e) {
    is.ok(e);
    Eventi.off('b');
  });
  Eventi.fire('a,b');
  Eventi.off('a');
  return false;
});

test('resume at index', function(is) {
  var start;
  Eventi.on('start', function(e) {
    start = e;
    e.pauseSequence();
    is.equal(e.index, 0);
    e.resumeSequence(2);
  });
  Eventi.on('skip', function(is) {
    is.ok(false, 'should be skipped');
  });
  Eventi.on('restart', function(e) {
    is.equal(e.index, 2);
    is.strictEqual(e.previousEvent, start);
    Eventi.off('start skip restart');
  });
  Eventi.fire('start+skip+restart');
});

test('internal api presence', function(is) {
  is.equal(typeof _.sequence, "function", "_.sequence");
});

test('_.sequence', function(is) {
  var e = {};
  _.sequence(e, {index:0,sequence:['foo','bar']}, global);
  is.equal(typeof e.resumeSequence, "function");
  is.equal(typeof e.pauseSequence, "function");
  is.equal(typeof e.isSequencePaused, "function");
  is.equal(e.isSequencePaused(), false);
  e.pauseSequence();
  is.equal(e.isSequencePaused(), true);
});
