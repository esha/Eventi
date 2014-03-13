# Eventi

Powerful application events and event handling, made easy.

## Getting Started
Download the [minified version][min] or the [development version][max].

[min]: https://raw.github.com/nbubna/Eventi/master/dist/Eventi.min.js
[max]: https://raw.github.com/nbubna/Eventi/master/dist/Eventi.js

## TODO
* finish key tests
* finish until tests
* finish combo tests
* documentation
* demo app/site
* integrations (jQuery, Visual Event 2, Capo, etc)

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
* Handling for complex event types (combos, async sequences, singletons, etc).
* Robust, error tolerant listener execution
* Support for best-practices like "signals" (aka pre-defined types) and declarative event mapping
* Lots of solid, maintainable test code
* Impressive visual and/or interactive demo (ideas, anyone?)
* Three versions (tall, grande, venti): tall is frame/core/fire/on, grande adds declare/singleton/key/location, venti adds off/until/combo/types
* Venti is the default version to encourage much event-based awesomeness for everyone.
* Grande includes basic webapp tools.
* Tall could be enough for lite server work.

## Code Plans

#### Eventi.frame (useless on its own)
* external IIFE
* universal module definition
* CustomEvent constructor polyfill
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
* TODO: consider non-DOM propagation when typeof object.parent === "object"


#### declare.js (requires on.js and fire.js)
* declare `data-eventi="submit /beforeunload=quit"` on a root or container element
* declare specific responses on descendent(s): `submit="validate>save" quit="Utils.persist"`
* try to resolve attr values at call-time to either element or global function (declared event handler)
* otherwise, fire as application event (declared event mapping)
* impl should scan document for data-eventi attributes on DOMContentLoaded, register those listeners
* `click="..."` is globally supported by default using trigger.js' intelligent click/enter logic

#### singleton.js (requires fire.js and on.js)
* singleton events (immediately call late listeners, ignore multiple firings)
* "listen" for them: `Eventi.on([target, ]'^type', fn)`
* fire them so they're remembered: `Eventi.fire([target, ]'^type', fn)`
* alias DOMContentLoaded to '^ready'

#### key.js (requires on.js)
* filter key events: `Eventi.on([target, ]'keyup[shift-a]', fn)`

#### location.js (requires on.js and fire.js)
* event-based routing: `Eventi.on('location', '?view={view}'||regex, function(e, url, params){ console.log(params.view); })`
* event-based history.pushState: `Eventi.fire('location', '?view={0}', ['foo'])`
* consistent event for all popstate/hashchange/pushstate changes: `Eventi.on('location', function(e){ console.log(e.uri, e.oldURI, e.srcEvent); })`


#### off.js (requires on.js)
* simple listener removal: `Eventi.off([target, ]['type', ][fn])`
* multiple removal: `Eventi.off([target, ]['first second third', ][fn])`
* remove by category and/or tag: `Eventi.off([target, ]['category:type#tag', ][fn])`

#### until.js (requires on.js)
* this will remove handlers once the specified condition is satisfied
* only tests condition upon matching event
* countdown to zero: `Eventi.until([target, ]number, 'type', fn)`
* test ref for truthiness: `Eventi.until([target, ]'reference', 'type', fn)`
* call function for truthiness: `Eventi.until([target, ]testFn, 'type', fn)`

#### combo.js (requires fire.js and on.js)
* combo events (call after all specified events, then reset): `Eventi.on([target, ]'foo+bar', fn)`
* event sequences (ordered combos): `Eventi.on([target, ]'one>two>three', fn...)`
* fire combos (always in sequence): `Eventi.fire([target, ]'first>second'[, data...])`
* event sequence firing controls (w/async support via promises): `e.pauseSequence([promise])`,`e.resumeSequence()`, `e.isSequencePaused()`
* configurable time allowed between events (for listening, not firing): `Eventi._.comboTimeout = 1000`

#### types.js (requires core)
* provide both global and local type specification with minimal API
* global: `Eventi.types('type');` -> `Eventi.on.type([target, ]handler)`
* local (after Eventi.fy(o)): `Eventi.types(o, 'type', 'type2')` -> `target.until.type2(1, handler)`
* obviously, types cannot have the same name as Function properties like 'call' or 'length'


#### jquery.eventi.js
* add custom properties to $.event.props
* add namespace support to rich syntax (ick)
* listen for events in jQuery's manual bubbling system (ick again)
* wrap $.fn.trigger, $.fn.on, $.fn.off, and maybe $.fn.one to intercept calls with Eventi params/syntax

#### visual.js
* Integration for http://www.sprymedia.co.uk/article/Visual+Event+2


## Release History
* 2014-02-11 [v0.5.0][] (first public release)
* 2014-03-07 [v0.6.3][] (location events, crucial fixes)
* 2014-03-13 [v0.7.0][] (s/signal/types, crucial fixes)

[v0.5.0]: https://github.com/nbubna/Eventi/tree/0.5.0
[v0.6.3]: https://github.com/nbubna/Eventi/tree/0.6.3
[v0.7.0]: https://github.com/nbubna/Eventi/tree/0.7.0
