(function() {

  module('Eventi frame');

  test('CustomEvent API/polyfill', function() {
    ok(CustomEvent, "CustomEvent");
    var ce = new CustomEvent('foo', {bubbles:true});
    equal(ce.type, 'foo', "CustomEvent type");
    equal(typeof ce.timeStamp, "number", "CustomEvent timeStamp");
    ok('detail' in ce, "CustomEvent detail");
    equal(ce.bubbles, true, "CustomEvent bubbles");
    equal(typeof ce.stopPropagation, "function", "CustomEvent stopPropagation");
    equal(typeof ce.stopImmediatePropagation, "function", "CustomEvent stopImmediatePropagation");
  });

}());
