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
  module('Eventi declare', {
    setup: function() {
      //TODO? move declare test markup out of #qunit-fixture to avoid this?
      Eventi._.init();
    }
  });

  test('data-eventi...', function() {
    var el = document.querySelector('#declare'),
      attr = el.getAttribute('data-eventi'),
      listener = el[_._key];
    equal(attr, 'simple type#rich=alias /global', 'should have right attribute');
    ok(listener, 'should have a listener');
    ok(listener.s.simple, 'should listen for simple');
    ok(listener.s.type, 'should listen for type');
    ok(!listener.s.global, 'should not listen for global');
  });

  test('simple="mapped"', function() {
    expect(4);
    var parent = document.querySelector('#declare'),
      el = parent.querySelector('span');
    Eventi.on(parent, 'mapped', function(mapped, simple) {
      equal(mapped.type, 'mapped');
      equal(mapped.target, el);
      equal(this, parent);
      equal(simple.type, 'simple');
    });
    el.dispatchEvent(new CustomEvent('simple', {bubbles:true}));
    Eventi.off(parent, 'mapped');
  });

  test('type#rich=alias="handler"', function() {
    expect(3);
    var parent = document.getElementById('declare'),
      el = parent.children[0];
    window.handler = function(e) {
      equal(e.type, 'type');
      ok(e.rich);
      equal(this, el);// global handler fn still gets declared context
    };
    el.dispatchEvent(new Eventi('type#rich'));
    delete window.handler;
  });

  test('/global="elementHandle"', function() {
    expect(2);
    var parent = document.getElementById('declare'),
      el = parent.children[0];
    el.elementHandle = function(e) {
      equal(e.type, 'global');
      equal(this, el);// global event gets declared context
    };
    Eventi.fire(document.body, 'global');
    delete el.elementHandle;
  });

  test('click="remove"', function() {
    var parent = document.getElementById('declare'),
      el = parent.querySelector('[click]'),
      button = el.querySelector('button');
    if (!el.remove) {
      el.remove = function() {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      };
    }
    ok(el.parentNode, 'has parent node before event');
    Eventi.fire(button, 'click');
    ok(!el.parentNode, 'should not have parentNode anymore');
  });

  test('internal api presence', function() {
    ok(_.init, "_.init");
    ok(_.declare, "_.declare");
    ok(_.mapped, "_.mapped");
    ok(_.declarers, "_.declarers");
    ok(_.declared, "_.declared");
    ok(_.check, "_.check");
    ok(_.click, "_.click");
    ok(_.allowDefault, "_.allowDefault");
    ok(_.buttonRE, "_.buttonRE");
  });

  test('_.declarers w/target', function() {
    var mapper = document.getElementById('declare'),
      nodes = _.declarers(mapper, 'simple', mapper.querySelector('span'));
    equal(nodes.length, 2);
    equal(nodes[0], document.querySelector('#declare [simple]'));
    equal(nodes[1], mapper);
  });

  test('_.declarers global', function() {
    var mapper = document.getElementById('declare'),
      nodes = _.declarers(mapper, 'global', false);
    equal(nodes.length, 1);
    equal(nodes[0], document.querySelector('#declare [global]'));
  });

  function declared(type, value, fn) {
    var node = document.createElement('span');
    node.setAttribute(type, value);
    if (fn) {
      node[value] = fn;
    }
    document.getElementById('qunit-fixture').appendChild(node);
    _.declared(node, type, new CustomEvent(type));
  }

  test('_.declared mapped event', function() {
    expect(1);
    Eventi.on('type', function(e, oe) {
      equal(oe.type, 'mapped');
    });
    declared('mapped', 'type');
    Eventi.off('type');
  });

  test('_.declared local fn', function() {
    expect(1);
    declared('local', 'elementFn', function(e) {
      equal(e.type, 'local');
    });
  });

  test('_.declared global fn', function() {
    expect(1);
    window.globalFn = function(e) {
      equal(e.type, 'global');
    };
    declared('global', 'globalFn');
    delete window.globalFn;
  });

  test('_.declared nested fn', function() {
    expect(1);
    window.ns = {fn: function(e) {
      equal(e.type, 'nested');
    }}
;    declared('nested', 'ns.fn');
    delete window.ns;
  });

  function click(name, attrs, enter) {
    if (attrs === true){ enter=attrs;attrs=null; }
    var node = document.createElement(name);
    if (attrs) {
      for (var key in attrs) {
        node.setAttribute(key, attrs[key]);
      }
    }
    document.getElementById('qunit-fixture').appendChild(node);
    return _.click(node, enter);
  }
  test('_.click', function() {
    ok(click('a'), 'a should be clickable');
    ok(click('a', {click:false}), '[click=false] should never be clickable');
    ok(!click('textarea'), 'textarea should not be clickable');
    ok(click('textarea', {click:true}), '[click=notfalse] should override other factors');
    ok(!click('div', {contenteditable:true}), '[contenteditable] should not be clickable');
    ok(click('button'), 'button should be clickable');
    ok(!click('select'), 'select should not be clickable');
    ok(!click('input'), 'input should not be clickable');
    ok(click('input', {type:'submit'}), 'input[submit] should be clickable');
    ok(click('input', {type:'button'}), 'input[button] should be clickable');
    ok(click('input', {type:'reset'}), 'input[reset] should be clickable');
  });

  function enter(name, attrs){ return click(name, attrs, true); }
  test('_.click from enter', function() {
    ok(enter('a'), 'a should translate enter to click');
    ok(enter('a', {click:false}), '[click=false] should never translate enter to click');
    ok(!enter('textarea'), 'textarea should not translate enter to click');
    ok(enter('textarea', {click:true}), '[click=notfalse] should override other factors');
    ok(!enter('div', {contenteditable:true}), '[contenteditable] should not be clickable');
    ok(enter('select'), 'select should translate enter to click');
    ok(!enter('button'), 'button should not translate enter to click');
    ok(enter('a'), 'a should translate enter to click when there\'s no href');
    ok(!enter('a', {href:'url'}), 'a[href] should not translate enter to click');
    ok(enter('input'), 'input should translate enter to click');
    ok(!enter('input', {type:'submit'}), 'input[type=submit] should not translate enter to click');
    ok(!enter('input', {type:'button'}), 'input[type=button] should not translate enter to click');
    ok(!enter('input', {type:'reset'}), 'input[type=reset] should not translate enter to click');
  });

}());
