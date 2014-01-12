# Eventi

Powerful application events and event handling, made easy.

## Getting Started
Download the [minified version][min] or the [development version][max].

[min]: https://raw.github.com/nbubna/Eventi/master/dist/Eventi.min.js
[max]: https://raw.github.com/nbubna/Eventi/master/dist/Eventi.js

## Motive

* The JavaScript community lives on event-based development.
* Application events (aka custom events) are recommended but rarely/poorly used in webapps.
* Environment events get simple types and rich data, not the mushed-up 'nounVerbAdjective' types most heavy app-event users resort to.
* App events could use that rich data, as well as a larger set of features than environment events require.
* Support for event handling in general is ripe for innovation.

## Goal
* A featureful event platform that's easy to use and to extend.
* A declarative syntax for creating and handling rich, informative events.
* DOM and object support
* Handling for complex event types (combos, sequences, singletons, etc).
* Robust, error tolerant listener execution
* Lots of solid, maintainable test code
* Eye-catching visual demo

## Code Plans

#### Eventi.frame (useless on its own)
* external IIFE
* universal module definition
* CustomEvent constructor polyfill
* HTML.js detection/integration
* body is resolved to build tool specified (sub)set of the following content

#### core.js (not much use on its own)
* rich event syntax parsing: `Eventi("group:kind#label('val')")` -> `{ category:'group', type:'kind', tags:['label'], label:true, detail:'val' }`
* parser should be extensible (for supporting jQuery namespaces or keyCodes or whatever)
* detail can be resolvable reference, string, or limited json (no parentheses)
* interface sharing (pass `this` as `target` param to copied functions): `Eventi.fy(foo)` -> `foo.fire('type')`
* add stopImmediatePropagation and immediatePropagationStopped to event interface

#### fire.js (requires core.js)
* object or DOM custom event dispatch: `Eventi.fire(Node|object, 'type')`
* handler errors caught and thrown in next tick to avoid interrupting sibling handlers or hiding errors
* implicit global target: `Eventi.fire('type')` === `Eventi.fire(document || this, 'type')
* multiple target specification: `Eventi.fire(Array|NodeList, 'type')`
* fire with handler arguments `Eventi.fire([target, ]'type', data)`

#### on.js (requires core.js)
* simple event registration: `Eventi.on([target, ]'type', fn)`
* space delimited multiple registration: `Eventi.on([target, ]'first second third', fn)`
* filter by selector (aka delegation): `Eventi.on([target, ]'selector', 'type', fn)`
* filter by category and/or tag: `Eventi.on([target, ]"category:type#tag", fn)`
* bind data w/listener: `Eventi.on([target, ]'type', fn, data)`
* applying rich event data as listener arg(s): `Eventi.on([target, ]'type', function(e, arg, arg){})`
* alias Element.prototype.matches from the prefixed matchesSelector versions
* implementation: one listener per target that gets registered for every handled type. the listener handles each event by looking amongst its handlers for those that match the event and executing them

#### off.js (requires on.js)
* simple listener removal: `Eventi.off([target, ]['type', ][fn])`
* multiple removal: `Eventi.off([target, ]['first second third', ][fn])`
* remove by category and/or tag: `Eventi.off([target, ]['category:type#tag', ][fn])`

#### singleton.js (requires on.js & off.js)
* singleton events (immediately call late listeners, ignore multiple firings)
* "listen" for them: `Eventi.on([target, ]'^type', fn)`
* fire them so they're remembered: `Eventi.fire([target, ]'^type', fn)`
* alias DOMContentLoaded to '^ready'?

#### until.js (requires on.js & off.js)
* countdown to zero: `Eventi.until([target, ]number, 'type', fn)`
* test ref for boolean: `Eventi.until([target, ]'reference', 'type', fn)`
* test function: `Eventi.until([target, ]testFn, 'type', fn)`

#### combo.js (requires on.js)
* combo events (call after all specified events, then reset): `Eventi.on([target, ]'foo+bar', fn)`
* event sequences (ordered combos): `Eventi.on([target, ]'one>two>three', fn...)`
* event sequence firing controls (w/async support): `e.pauseSequence([promise])`,`e.resumeSequence()`, `e.isSequencePaused()`
* timeout support for both ordered and unordered combos

#### declare.js (requires on.js)
* DOM declared event mapping (i.e. trigger.js' declarative stuff)
* DOM declared event handlers (i.e. something like old on.js, with no JS in DOM)

#### jquery.eventi.js
* add custom properties to $.event.props
* add namespace support to rich syntax (ick)
* listen for events in jQuery's manual bubbling system (ick again)
* wrap $.fn.trigger, $.fn.on, $.fn.off, and maybe $.fn.one to intercept calls with Eventi params/syntax

#### visual.js
* Integration for http://www.sprymedia.co.uk/article/Visual+Event+2

#### key.js (requires on.js)
* `Eventi.on([target, ]'keyup[shift-a]', fn)`


## Release History
_(Nothing yet)_
