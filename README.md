# Eventier

Enjoy easy, rich, native and custom event handling.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/nbubna/Eventier/master/dist/Eventier.min.js
[max]: https://raw.github.com/nbubna/Eventier/master/dist/Eventier.js

## Motive

* The JavaScript community lives on event-based development.
* Environment events are often very informative.
* Custom events (aka application events) often are not.
* Further, support for event handling hasn't had any recent innovations.
* It's time to change that.

## Goal
* An extensible event platform that has rich features baked in.
* A declarative syntax for creating and handling informative events.
* DOM and object support
* Support for events that are sequenced, compound, numbered, and singular.
* Robust, error tolerant listener execution

## Plan

#### core.js
* rich event syntax parsing: `Eventier("group:kind#label='val'")` -> `{ category:'group', type:'kind', tags:['label'], label:true, detail:'val' }`
* parser should be extensible (for supporting jQuery namespaces or keyCodes or whatever)
* detail can be resolvable reference, string, or limited/adapted json (single quotes converted to double, no =, #, or + chars, no spaces outside strings)
* interface sharing (pass `this` as `target` param to copied functions): `Eventier(foo)` -> `foo.fire('type')`
* does `if (HTML) Eventier(HTML._.fn);`

#### fire.js (requires core.js)
* object or DOM custom event dispatch: `Eventier.fire(Element|object, 'type')`
* object handlers called in next tick to avoid failure on error
* implicit global target: `Eventier.fire('type')` === `Eventier.fire(document || this, 'type')
* multiple target specification: `Eventier.fire(Array|NodeList, 'type')`
* event sequence support: `Eventier.fire([target, ]'first second third')`, `e.stopSequence([promise])`

#### on.js (requires core.js)
* simple event registration: `Eventier.on([target, ]'type', fn)`
* space delimited multiple registration: `Eventier.on([target, ]'first second third', fn)`
* filter by selector (aka delegation): `Eventier.on([target, ]'selector', 'type', fn)`
* filter by category and/or tag: `Eventier.on([target, ]"category:type#tag", fn)`
* bind data w/listener: `Eventier.on([target, ]'type', fn, data)`
* applying rich event data as listener arg(s): `Eventier.on([target, ]'type', function(e, arg, arg){})`

#### off.js (requires on.js)
* simple listener removal: `Eventier.off([target, ]['type', ][fn])`
* multiple removal: `Eventier.off([target, ]['first second third', ][fn])`
* remove by category and/or tag: `Eventier.off([target, ]['category:type#tag', ][fn])`

#### special.js (requires on.js & off.js)
* listen X times: `Eventier.on([target, ]2, 'type', fn)`
* ready-style events (immediately call late listeners, ignore multiple firings): `Eventier.on([target, ]true, 'type', fn)`
* basic compound events (call after all specified events, then reset): `Eventier.on([target, ]'first+second+third', fn)`

#### declare.js (requires on.js)
* DOM declared event mapping (i.e. trigger.js' declarative stuff)
* DOM declared event handlers (i.e. something like old on.js, with no JS in DOM)

#### jquery.eventier.js
* add custom properties to $.event.props
* add namespace support to rich syntax (ick)
* listen for events in jQuery's manual bubbling system (ick again)
* wrap $.fn.trigger, $.fn.on, $.fn.off, and maybe $.fn.one to intercept calls with Eventier params/syntax

#### keys.js (requires on.js)
* `Eventier.on([target, ]'keyup(shift-a)', fn)`

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
