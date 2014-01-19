# Eventi

Powerful application events and event handling, made easy.

## Getting Started
Download the [minified version][min] or the [development version][max].

[min]: https://raw.github.com/nbubna/Eventi/master/dist/Eventi.min.js
[max]: https://raw.github.com/nbubna/Eventi/master/dist/Eventi.js

## TODO
* Lots and lots and lots of test code :)
* declare.js
* key.js
* web site/documentation
* integrations (jQuery, Visual Event 2, etc)

## Motive

* JavaScript development is ultimately event-based development.
* Application events (aka custom events) are usually under-used or poorly-used in webapps.
* Environment events get simple types and rich data, not the mushed-up 'nounVerbAdjective' types most heavy custom event users tolerate.
* Custom events could use rich data, especially if there's simple ways to create and utilize it.
* Event handling features in general need a boost to encourage use in advanced apps (particularly single page ones).

## Goal
* A featureful event platform that's easy to use and to extend.
* A declarative syntax for creating and handling rich, informative events.
* DOM and object support
* Handling for complex event types (combos, sequences, singletons, etc).
* Robust, error tolerant listener execution
* Lots of solid, maintainable test code
* Eye-catching visual demo
* Three versions (tall, grande, venti): tall is frame/core/fire/on, grande adds declare/singleton/off, venti adds until/combo/key
* Venti will be the default version to encourage feature use and dev.

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

#### on.js (requires core.js)
* simple event registration: `Eventi.on([target, ]'type', fn)`
* space delimited multiple registration: `Eventi.on([target, ]'first second third', fn)`
* filter by selector (aka delegation): `Eventi.on([target, ]'selector', 'type', fn)`
* filter by category and/or tag: `Eventi.on([target, ]"category:type#tag", fn)`
* bind data w/listener: `Eventi.on([target, ]'type', fn, data)`
* applying rich event data as listener arg(s): `Eventi.on([target, ]'type', function(e, arg, arg){})`
* alias Element.prototype.matches from the prefixed matchesSelector versions
* implementation: one listener per target that gets registered for every handled type. the listener handles each event by looking amongst its handlers for those that match the event and executing them

#### fire.js (requires core.js, uses on.js)
* object or DOM custom event dispatch: `Eventi.fire(Node|object, 'type')`
* handler errors caught and thrown in next tick to avoid interrupting sibling handlers or hiding errors
* implicit global target: `Eventi.fire('type')` === `Eventi.fire(document || this, 'type')
* multiple target specification: `Eventi.fire(Array|NodeList, 'type')`
* fire with handler arguments `Eventi.fire([target, ]'type', data)`

#### declare.js (requires on.js)
* DOM declared event mapping (i.e. trigger.js' declarative stuff)
* DOM declared event handlers (i.e. something like old on.js, with no JS in DOM)

#### singleton.js (requires fire.js and on.js)
* singleton events (immediately call late listeners, ignore multiple firings)
* "listen" for them: `Eventi.on([target, ]'^type', fn)`
* fire them so they're remembered: `Eventi.fire([target, ]'^type', fn)`
* alias DOMContentLoaded to '^ready'?

#### off.js (requires on.js)
* simple listener removal: `Eventi.off([target, ]['type', ][fn])`
* multiple removal: `Eventi.off([target, ]['first second third', ][fn])`
* remove by category and/or tag: `Eventi.off([target, ]['category:type#tag', ][fn])`


#### until.js (requires on.js)
* countdown to zero: `Eventi.until([target, ]number, 'type', fn)`
* test ref for boolean: `Eventi.until([target, ]'reference', 'type', fn)`
* test function: `Eventi.until([target, ]testFn, 'type', fn)`

#### combo.js (requires fire.js and on.js)
* combo events (call after all specified events, then reset): `Eventi.on([target, ]'foo+bar', fn)`
* event sequences (ordered combos): `Eventi.on([target, ]'one>two>three', fn...)`
* event sequence firing controls (w/async support): `e.pauseSequence([promise])`,`e.resumeSequence()`, `e.isSequencePaused()`
* timeout support for both ordered and unordered combos

#### key.js (requires on.js)
* `Eventi.on([target, ]'keyup[shift-a]', fn)`


#### jquery.eventi.js
* add custom properties to $.event.props
* add namespace support to rich syntax (ick)
* listen for events in jQuery's manual bubbling system (ick again)
* wrap $.fn.trigger, $.fn.on, $.fn.off, and maybe $.fn.one to intercept calls with Eventi params/syntax

#### visual.js
* Integration for http://www.sprymedia.co.uk/article/Visual+Event+2


## Release History
_(Nothing yet)_
