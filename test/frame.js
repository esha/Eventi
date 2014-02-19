(function() {

  var _ = Eventi._;
  module('Eventi frame');

  test('3rd party/polyfill api presence', function() {
    ok(typeof CustomEvent === "function", "CustomEvent");
  });

  test('internal api presence', function() {
    ok(_.version, "_.version");
    equal(typeof _.next, "function", "_.next");
  });

}());
