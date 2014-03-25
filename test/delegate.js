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
  module('Eventi delegate');

  test('3rd party/polyfill api presence', function() {
    ok(typeof Element.prototype.matches === "function", "Element.prototype.matches");
  });

  test('type<selector>', function() {
    var parent = document.querySelector('#on'),
      kid = parent.querySelector('.closest');
    Eventi.on('click<#on>', function(e, edata) {
      equal(e.type, 'click');
      equal(edata, 'edata');
      equal(this, parent);
      equal(e.target, kid);
    });
    Eventi.fire(kid, 'click', 'edata');
    Eventi.off('click');
  });

  test('_.closest', function() {
    equal(_.closest(document, 'foo'), undefined, 'undefined for non Elements');
    var root = document.querySelector('#on'),
        div = root.querySelector('.closest');
    equal(_.closest(div, 'div'), div, 'el should prefer itself to parent');
    equal(_.closest(div, '#on'), root, 'should find parent when element does not match');
  });

  test('internal api presence', function() {
    ok(_.delegate, "_.delegate");
    ok(_.closest, "_.closest");
  });

}());
