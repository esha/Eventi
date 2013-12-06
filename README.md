# Eventier

Powerful application events and event handling, made easy.

## Getting Started
Download the [minified version][min] or the [development version][max].

[min]: https://raw.github.com/nbubna/Eventier/master/dist/Eventier.min.js
[max]: https://raw.github.com/nbubna/Eventier/master/dist/Eventier.js

## Motive

* The JavaScript community lives on event-based development.
* Application events (aka custom events) are recommended but rarely/poorly used in webapps.
* Environment events get simple types and rich data, not the mushed-up 'nounVerbAdjective' types most heavy app-event users resort to.
* App events deserve to be on an "even tier" with environment events.
* Support for event handling in general is ripe for innovation.

## Goal
* An rich event platform that's easy to extend and use.
* A declarative syntax for creating and handling informative events.
* DOM and object support
* Fire rich events (and sequences thereof)
* Handle compound, limited/numbered, and singleton events (e.g. DOMContentLoaded).
* Robust, error tolerant listener execution
* Lots of solid, maintainable test code
* Eye-catching visual demo

## Code Plans

#### Eventier.frame (useless on its own)
* external IIFE
* universal module definition
* HTML.js detection/integration
* body is resolved to build tool specified (sub)set of the following content

#### core.js (not much use on its own)
* rich event syntax parsing: `Eventier("group:kind#label('val')")` -> `{ category:'group', type:'kind', tags:['label'], label:true, detail:'val' }`
* parser should be extensible (for supporting jQuery namespaces or keyCodes or whatever)
* detail can be resolvable reference, string, or limited json (no braces)
* interface sharing (pass `this` as `target` param to copied functions): `Eventier(foo)` -> `foo.fire('type')`

#### fire.js (requires core.js)
* object or DOM custom event dispatch: `Eventier.fire(Element|object, 'type')`
* object handlers called in next tick to avoid failure on error
* implicit global target: `Eventier.fire('type')` === `Eventier.fire(document || this, 'type')
* multiple target specification: `Eventier.fire(Array|NodeList, 'type')`
* event sequence support: `Eventier.fire([target, ]'first second third')`, `e.stopSequence([promise])`
* pass handler arguments with call `Eventier.fire([target, ]'type', data)`

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
* singleton events (immediately call late listeners, ignore multiple firings): `Eventier.on([target, ]true, 'type', fn)`
* compound events (call after all specified events, then reset): `Eventier.on([target, ]'first+second+third', fn)`
* ? ordered, compound events: `Eventier.on([target, ]'first>second>third', fn)`

#### declare.js (requires on.js)
* DOM declared event mapping (i.e. trigger.js' declarative stuff)
* DOM declared event handlers (i.e. something like old on.js, with no JS in DOM)

#### jquery.eventier.js
* add custom properties to $.event.props
* add namespace support to rich syntax (ick)
* listen for events in jQuery's manual bubbling system (ick again)
* wrap $.fn.trigger, $.fn.on, $.fn.off, and maybe $.fn.one to intercept calls with Eventier params/syntax

#### visual.js
* Integration for http://www.sprymedia.co.uk/article/Visual+Event+2

#### key.js (requires on.js)
* `Eventier.on([target, ]'keyup[shift-a]', fn)`


## Release History
_(Nothing yet)_
