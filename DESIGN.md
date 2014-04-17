## TODO
* documentation
* demo app/site
* jQuery integration
* Capo integration
* consider limited grouping syntax for types with partial overlap: `group:{type#tag other$1}#tag2` but probably don't bother due to incompatibility w/aliasing and current parsing
* consider wildcard * syntax, to require a match field presence instead of equality, or possibly partial equality.

## Motive

* Application events (aka custom events) are usually under-used or poorly-used in applications.
* Events are the best way to decouple modules and components without isolating them entirely.
* DOM event bubbling, in particular, has much potential for meaningful event based interfaces.
* Environment events get simple types and rich data, not the mushed-up 'nounVerbAdjective' types with poor data that most heavy custom event users end up using.
* Custom events can be awesome, especially when you have rich features and patterns that are simple to use.
* Declarative events are completely unsupported out there. This is a travesty.

## Objectives
* A rich event platform that's easy to use and to extend.
* A declarative syntax for working with rich, informative events.
* DOM and object support
* Complex event models (combos, async sequences, singletons, etc).
* Robust, error tolerant listener execution
* Support for best-practices like delegation, "signals" (aka aliases for complex types), and declarative event mapping
* Lots of solid, maintainable test code
* Browser version (default) and stripped down server version (no delegate, declare, location, or key support)
* Impressive, interactive demo (ideas, anyone?)

## Code Specifics

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
* filter by category and/or tag: `Eventi.on([target, ]"category:type#tag", fn)`
* bind data w/listener: `Eventi.on([target, ]'type', fn, data)`
* applying rich event data as listener arg(s): `Eventi.on([target, ]'type', function(e, arg, arg){})`
* implementation: one listener per target that gets registered for every handled type. the listener handles each event by looking amongst its handlers for those that match the event and executing them

#### fire.js (requires core.js, uses on.js)
* object or DOM custom event dispatch: `Eventi.fire(Node|object, 'type')`
* handler errors caught and thrown in next tick to avoid interrupting sibling handlers or hiding errors
* implicit global target: `Eventi.fire('type')` === `Eventi.fire(document || this, 'type')
* multiple target specification: `Eventi.fire(Array|NodeList, 'type')`
* fire with handler arguments `Eventi.fire([target, ]'type', data)`
* TODO: consider non-DOM propagation when typeof object.parent === "object"

#### alias.js (requires core.js)
* provide both global and local type specification with minimal API
* global: `Eventi.alias('type');` -> `Eventi.on.type([target, ]handler)`
* local (after Eventi.fy(o)): `Eventi.alias(o, 'type type2')` -> `target.until.type2(1, handler)`
* obviously, aliases should not have the same name as Function properties like 'call' or 'length'


#### delegate.js (requires on.js)
* alias Element.prototype.matches from the prefixed matchesSelector versions
* filter by selector (aka delegation): `Eventi.on([target, ]'type<.selector>', fn)`

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
* event-based routing: `Eventi.on('location@?view={view}', function(e, url, params){ console.log(params.view); })`
* event-based history.pushState: `Eventi.fire('location@?view={0}', ['foo'])`
* consistent event for all popstate/hashchange/pushstate changes: `Eventi.on('location', function(e){ console.log(e.location, e.oldLocation, e.srcEvent); })`


#### off.js (requires on.js)
* simple listener removal: `Eventi.off([target, ]['type', ][fn])`
* multiple removal: `Eventi.off([target, ]['first second third', ][fn])`
* remove by category and/or tag: `Eventi.off([target, ]['category:type#tag', ][fn])`

#### end.js (requires on.js)
* this will remove handlers once the specified condition is satisfied
* number of executions: `Eventi.on([target, ]'type$3', fn)`
* test ref for truthiness: `Eventi.on([target, ]'type$reference', fn)`
* call function for truthiness: `Eventi.on([target, ]'type$test.fn', fn)`

#### sequence.js (requires fire.js)
* fire controllable sequence of events: `Eventi.fire([target, ]'first,second'[, data...])`
* event sequence firing controls (w/async support via promises): `e.pauseSequence([promise])`,`e.resumeSequence()`, `e.isSequencePaused()`

#### combo.js (requires on.js and off.js)
* combo events (call after all specified events, then reset): `Eventi.on([target, ]'foo+bar', fn)`
* event sequences (ordered combos): `Eventi.on([target, ]'one,two,three', fn...)`
* configurable timeout for combo events: `Eventi.on([target, ]'one,two', fn, 1000)`

#### debug.js (requires core.js and on.js)
* provide easy access and printing of registered handlers
* expose as a bookmarklet



#### Plan for jquery.eventi.js
* add custom properties to $.event.props
* add namespace support to rich syntax (ick)
* listen for events in jQuery's manual bubbling system (ick again)
* wrap $.fn.trigger, $.fn.on, $.fn.off, and maybe $.fn.one to intercept calls with Eventi syntax

