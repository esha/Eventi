# Eventi

Powerful application events and event handling, made easy.

## Getting Started
Download the [full][], [minified][min], or [server][server] versions. [![Build Status](https://travis-ci.org/esha/Eventi.png?branch=master)](https://travis-ci.org/esha/Eventi)  
[Bower][bower]: `bower install eventi`  
[NPM][npm]: `npm install eventi`   
[Component][component]: `component install esha/Eventi`  

[full]: https://raw.github.com/esha/Eventi/master/dist/eventi.js
[min]: https://raw.github.com/esha/Eventi/master/dist/eventi.min.js
[server]: https://raw.github.com/esha/Eventi/master/dist/eventi.server.js
[npm]: https://npmjs.org/package/eventi
[bower]: http://bower.io/
[component]: http://component.io/

## Eventi API

#### Eventi.fire([target, ]eventi[, data,...])

Creates and dispatches the specified event(s) on the specified target(s), attaching any specified data.

Arguments | Required | Type(s) | Default | Description
--------- | -------- | ------- | ------- | -----------
target | No | _Object_, _Array_ | global/window | A single target or array of them.
eventi | Yes | _String_, _Event_, _Array_ | | One or more space-delimited Eventi definitions, an Event instance, or an array of either (in which case you *must* specify a target argument).
data | No | | | Any number of arguments that will be put in an Array and attached to all created events as the `data` property.

*When passing events in an array, you *must* specify a target argument.

Any attached data will be fed to the event listeners as additional arguments after the event itself and any data registered along with the listener itself.

```javascript
Eventi.fire(user, 'account:close', accountId);
```

#### Eventi.on([target, ]eventi, fn[, data,...])

Registers the specified function as an event listener for the specified event(s) on the specified target(s).

Arguments | Required | Type(s) | Default | Description
--------- | -------- | ------- | ------- | -----------
target | No | _Object_, _Array_ | global/window | A single target or array of them.
eventi | Yes | _String_, _Array_ | | One or more space-delimited Eventi definitions or an array of them (in which case you *must* specify a target argument).
fn | Yes | _Function_ | | The function to be called when a matching event hits the target(s).
data | No | * | | Any number of arguments that will be passed directly to the listener function as arguments (after the event argument).

The function argument will be called with the target as its context, the received event as the first argument, and data arguments registered with the listener as the next arguments, and any data arguments attached to the event itself after those.

```javascript
Eventi.on(user, 'account:open', function(e) {
   console.log('Event: type='+e.type+' category='+e.category, this/* will be user */); 
});
```

#### Eventi.on([targets, ]{ eventi:fn,... })

Overloading of `on()` for convenient registration of multiple listeners at once. Iterates over the object argument, registering key/value pairs as eventi/fn pairs.

```javascript
Eventi.on(user, {
    'account:open', function(e) {
        console.log('Event: type='+e.type+' category='+e.category, this/* will be user */); 
    },
    'account:close', function(e, accountId) {
        console.log('User: '+this.id+' is closing account '+accountId);
    }
});
```

#### eventi="eventi ..."

Registers event listeners on the element that search between an Event's target and the listening element for an element with a handler attribute (e.g. `data-click="..."`) telling the listener how to handle the event.

Attributes | Required | Content | Description
--------- | -------- | ------- | ------- | -----------
eventi, data-eventi | For all events except `click` | Space-delimited Eventi definitions | Defines listeners for an element.
{alias}, data-{alias} | No | Element function, global function, Eventi definition | Either a reference to the function to be called, an Eventi definition to be fired on the element, or nothing, in which case the alias is used as the content.

```html
<div id="admin" data-eventi="/beforeunload=>save keyup[delete]<.account>=>delete">
    <ul class="accounts">
        <li class="account" tabindex="0" delete="account:close">Savings</li>
        ...
    </ul>
    <button click="account:open">New Account</button>
</div>
```

#### Eventi.off([targets, ][eventi, ][fn])

Unregisters event listeners that match the specified event(s) and/or function on the specified target(s), or the global/window object, if none is specified.

Arguments | Required | Type(s) | Default | Description
--------- | -------- | ------- | ------- | -----------
target | No | _Object_, _Array_ | global/window | A single target or array of them.
eventi | No | _String_, _Array_ | | One or more space-delimited Eventi definitions (or portions thereof) or an array of them (in which case you must specify a target argument)
fn | No | _Function_ | | The specific listener function to be removed.

```javascript
Eventi.off(user, 'account:');
```

#### Eventi.alias([context, ]eventi,...)

Defines aliases for the events specified. It creates sub-functions for `on()`, `off()`, and `fire()` under the alias (or simple type if no alias is defined).

Arguments | Required | Type | Default | Description
--------- | -------- | ---- | ------- | -----------
context | No | _Object_ | Eventi | An object that has been run through Eventi.fy() whose methods you want the aliases set for.
eventi | Yes | _String_ | | One or more event space-delimited Eventi definitions.

```javascript
Eventi.alias('account:request#freeze=>hold');
Eventi.on.hold(user, function(e, admin) {
  console.log(admin.id+' is requesting freeze for '+user.id+' accounts');  
});
//...
Eventi.fire.hold(user, admin);
```

#### Eventi.fy(target)

Convenience tool that simply defines `on()`, `off()`, and `fire()`, making the specified target object the context and target for those functions.

Arguments | Required | Type | Default | Description
--------- | -------- | ---- | ------- | -----------
context | Yes | _Object_ | | A target object you would like to call fire/on/off upon directly.

```javascript
Eventi.fy(user);
user.on('account:open', function(e) {
   console.log('Open new account for '+this/* will be user */); 
});
```
```javascript
Eventi.fy(Element.prototype);// lets you call Eventi functions on all DOM elements
```

## Eventi Syntax

### Core - Defining What's What

#### Type

Example definition: `open`

This is the central, "action" portion in an Eventi definition. It is *not* optional in most definitions, with the exception of calls to `off()`. It is what you have left after you strip off all the other event and handler properties described below here. It is an Event instance's `type` property. This should typically be a simple verb, in present or past tense.

```javascript
var e = new Eventi('open');
console.log(e.type);// outputs 'open'
```

#### Category:

Example definition: `account:open`

This is the "subject" option in an Eventi definition. The category always precedes the type and is delimited from it by a `:`. It is an Eventi instance's `category` property. This should typically be a simple noun, and represent the subject or owner of a set of events. It is good practice to provide a category for your events unless you specifically mean them to be broadly applied.

```javascript
var e = Eventi.fire('account:open');
console.log(e.category);// outputs 'account'
```

#### #Tags

Example definition: `move#up#left`

These are the "adverb" or "adjective" portions of Eventi definitions. They always follow the type and are delimited from it and each other by `#`. When creating an Event, they are set together in an array on the instance as the `tags` property and each individual tag is set on the instance as a property with a value of `true`. Use these to distinguish related sub-types of events or provide simple annotations for the subject or object of an event.

```javascript
Eventi.on('open#new', function(e) {
  if (e.unverified) {
    console.log(e.tags.join(' & '));// outputs 'new & unverified'
  }
}).fire('open#new#unverified');
```

#### (Detail)

Example definition: `account:label(["verified","gold"])`

This is the "object" portion of an Eventi definition. It follows the type and is delimited by `(` and `)`. The contents may be either JSON (which will get parsed), a reference to a global value (which will be resolved), or an arbitrary string. The result is an instance's `detail` property. Use this to declaratively attach contextual information for an event at the moment it is created.

```javascript
window.user = { name: "jdoe123" };
var e = Eventi.fire('like(user.name)');
console.log(e.detail);// outputs 'jdoe123'
```


### Browser - Environment Awareness

#### <.Delegate>

Example definition: `cancel<.transaction>`

This specifies a selector for event delegation and is delimited by `<` and `>`. It instructs a listener to only react to events happening within the bounds of elements matching the specified selector and to use the matching element as the context for the handling function.

```javascript
Eventi.on('change<[type=checkbox]>', function(e) {
  console.log(this.type);// always outputs 'checkbox'
});
```

#### [Key]

Example definition: `keyup[delete]`

This specifies a key or combination thereof, by either keyCode or description, and is delimited by `[` and `]`. It instructs a listener to only react when the event has the appropriate keyCode/ctrlKey/metaKey/shiftKey/altKey properties. Particular keyCodes may be specified explicitly (e.g. `keydown[33]`), but many have been given English or symbolic equivalents for the sake of readable code (e.g. `keypress[z]`). These are stored in the [`Eventi._.codes`](https://github.com/esha/Eventi/blob/master/src/key.js#L12) object and are keyup-based values, so `keydown` and `keypress` definitions should [be wary](http://unixpapa.com/js/key.html) of those outside ASCII. The other key-related event properties are set simply by giving them `-` as a suffix (e.g. `[shift-13]` -> `e.shiftKey = true`, `[meta-]` -> `e.metaKey = true`, etc). 

The [Key] syntax is also special in that it will provide `keyup` as the type for event listeners (for `on()` *only*) that have a [Key] specified, but no type. Typically, event listeners with no type are never executed.

```javascript
Eventi.on(field, '[shift-enter]', function(e) {
  console.log(e.shiftKey, e.keyCode);// outputs 'true 13'
});
```

#### @Location

Example definition: `keypress[escape]@/edit`

This specifies a url pattern that is matched against the current `window.location` to filter event listener execution.

There are three types of `@` location values:

`@/vanilla#string` - Will be directly matched against the URL string retrieved from `window.location`.  
`@?mini={template}` -  Turns the sections in braces into wildcard matches (breaking on `\`,`?`, and `#`) whose values are gathered into a key/value object, passed as the 2nd argument to the event handler.  
```@`reg[ular]+Exp?` ``` -  For more complicated matching, use a regular expression. Use ` to delimit it. Handlers will receive the full match as the 2nd argument (after the event itself) and matching groups as subsequent arguments. Any handler or event data args will follow the location matching arguments.

Like [Key], @Location enables shorthand definitions by setting 'location' as the type for event listeners (for `on()` *only*) that have a location property, but no type property.

```javascript
Eventi.on('save@#file={filename}', function(e, vals, folder) {
  console.log('Saved '+vals.filename+' in '+folder);// outputs 'Saved image.png in /pics'
});
window.location.hash = 'file=image.png';
Eventi.fire('save', '/pics');
```

##### location@Location

Eventi also provides a unified `location` event that is dispatched on the `window` whenever the current location changes, whether via `hashchange` and `popstate` events or calls to `history.pushState` (which gets its own `pushstate` event as well). When registering a listener for a `location` event, the location is promptly tested (as if a `location` event was fired), allowing immediate execution of handlers for currently matching locations. Also, when a `location` type event is dispatched (e.g. `fire('location@/path')`), the @Location will be used to update `window.location` via `history.pushState`.

```javascript
// assume URL is http://esha.github.io/ to start
var s = '';
Eventi.on('location', function(e) {
  s += ' '+e.location;
});
window.location.hash = 'hash';
history.pushState(null,'push it', '?push');
history.go(-2);// popstate
console.log(s);// outputs ' / /#hash /?push /#hash /'
```

```javascript
Eventi.on('@/login', function(e, match) {// will listen for 'location' type
  console.log(e.type, match);// outputs 'location login'
});
Eventi.fire('location@/login');
```

@Location's mini-templates can work in reverse when updating the location via event. Just pass a key/value object back as the first data argument (either at listener registration or event firing).

```javascript
Eventi.fire('location@?page={page}', {page:2});
window.location.search === '?page=2'; // true
```

Just to spell it out, the sum of these flexible and easy location features is a powerful event-based application router.

### Control - For Special Handling

#### _NoBubbles

Example definition: `_hide`

This simply tells the dispatching code not to let an event propogate beyond the immediate target. Include a `_` in the control characters at the start of an event definition to set the `bubbles` property to false.

```javascript
Eventi.on('test', function(e) {
  console.log('Element events will never get here if they do not bubble.');
});
Eventi.fire(document.getElementById('hideme'), '_test');
```

#### /Global

Example definition: `/login`

This registers the listener on the global/window object but executes handler functions in the context for which they are registered. Include a `/` in the control characters at the start of an event definition to assign the listener globally.

```javascript
var buttons = document.querySelector('button,[type=submit]');
Eventi.on(buttons, '/ajaxStart', function(e) {
  this.disabled = true;
});
```

#### ^Singleton

Example definition: `^ready`

Including `^` in an event definition's control characters identifies it as a "singleton". The simplest way to explain these is that they are the event-equivalent of jQuery's ready() function. Once a singleton event is dispatched or received, it is remembered so that registered listeners execute no more than once and listeners registered after a singleton event is dispatched will be immediately executed with the remembered event. It's a once-for-all kind of deal. Events that go through `fire()` marked as singletons are automatically remembered for every target hit. When registering a listener for a singleton event that has not yet been fired, any matching event (marked singleton or not) will be remembered on the listener's target alone, for subsequent registrations. And yes, Eventi automatically watches for `DOMContentLoaded` and fires a `^ready` event on the document element.

```javascript
Eventi.on({
  '^ready': function() {
    loadAsync('globalResource').then(function(resource) {
      Eventi.fire('^resource:loaded', resource);
    });
  },
  '^resource:loaded': function(e, resource) {
    // use resource here
  }
});
```

#### $End

Example definition: `login$1`

Not all event listeners are meant to last forever. You may declare a listener's end when registering it by appending a `$` and a condition to the event definition. The condition may be either a number (indicating the number of executions allowed), a reference to a value (either a property of the context or global/window), or a reference to a function that will return such a value. In the case of a value, you may also prefix it with `!` to reverse the condition. The "end declaration" follows all features of a definition except an alias. The most common is, of course, `$1` for single-use listeners.

```javascript
Eventi.on(player, 'death$!player.livesLeft', player.respawn);
```
```javascript
Eventi.on('load$1', Plugins.init);
```

#### !Important

Example definition: `!location`

A `!` control character in the front of an event definition is only relevant when you try to `off()` it. Listeners defined as "important" may only be unregistered by a fully-matching definition given to `off()`, including the `!`. This exists mostly to protect "internal" listeners (both Eventi's own and extensions) from being errantly unregistered.

```javascript
Eventi.on('!demo', function() {
  console.log('still here!');
});
Eventi.off('demo');
Eventi.fire('demo');// will output 'still here!'
```

#### =>Alias

Example definition: `account:notify#SMS(balance)=>textme`

Aliases are used by either `alias()` or `data-eventi` definitions to provide a simple alias for safely and conveniently referencing event definitions (particularly complicated ones). These are *strongly recommended* for any complex definitions that are repeated in your JavaScript. And, of course, for `data-eventi` declarations, they are unavoidable.

```javascript
Eventi.alias('/user:logout=>shutdown');
Eventi.on.shutdown(function() {
  // look ma, no typos!
});
```

### Multiplicity - Beyond Definition Boundaries

The following syntax options are uber-syntax for working with multiple, *separate* definitions. No syntax features can be shared across definitions conjoined by spaces, commas, or plus symbols.

#### "Multiple Events"

Example definition: `keyup[enter] blur`

Allows you to dispatch, register, unregister, or alias multiple event definitions in the same call.

```javascript
Eventi.on(editor, 'keyup[ctrl-s] blur submit', function() {
  Eventi.fire('service:send local:save');
});
```

#### "Event,Sequences"

Example definition: `validate,save`

Allows you to dispatch or listen for a connected, ordered sequence of events. This is another feature adapted from [trigger (read this!)](https://github.com/nbubna/trigger#declaring-event-sequences-is-easy). The concepts are the same, only the delimiter (now `,`) and the API given to sequenced events have changed:

```event.index``` - The index of this Event in the sequence.  
```event.previousEvent``` - The preceding Event instance (if any).  
```event.sequence``` - The array of Eventi definitions in the sequence.  
```event.pauseSequence([promise])``` - Pauses the firing of the sequence. If a Promise (or other "then-able" object) is given as argument, it will automatically resume upon successful resolution of the promise. This makes async event sequences very straightforward!  
```event.isSequencePaused()``` - Returns a Boolean indicating if the sequence has been paused.  
```event.resumeSequence([index])``` - Resumes a paused sequence at either the specified index or the next index in the sequence.  

```javascript
Eventi.on('validate', function(e) {
  var promise = asyncValidate($(this).closest('form'));
  e.pauseSequence(promise);
});
```
```html
<form>
...
  <button click="validate,save,location@/home">Save and Quit</button>
</form>
```

Unlike [trigger](https://github.com/nbubna/trigger), Eventi also allows you to register listeners for event sequences as well. Such sequences can be fired as sequences (as above) or separately. You may also specify a time in milliseconds as the first data argument, in order to restrict the timeframe for sequence completion.

```javascript
Eventi.on(editor, 'keyup[a],keyup[s],keyup[d],keyup[f]', function() {
  console.log('Fake typing!');
}, 500);
```

#### "Combo+Events"

Example definition: `scroll+click`

Allows you to listen for an unordered group of related events before executing the handler function. This is exactly like registering a listener for a sequence of events, except that the order in which the events are received is ignored (or irrelevant).

```javascript
Eventi.on(editor, 'click+click+click', function() {
  Eventi.fire(this, 'tripleclick');
}, 200);
```

And yes, you can mix combos and sequences. When doing so, sequences events will be sub-events of combos, not vice versa.


## Release History
* 2014-02-11 [v0.5.0][] (alpha)
* 2014-04-03 [v1.0.0][] (beta)
* 2014-04-04 [v1.0.1][] (beta - IE fixes)
* 2014-04-09 [v1.0.2][] (beta - toString and location fix)
* 2014-04-17 [v1.1.0][] (beta - restructure artifacts, small improvements)
* 2014-04-21 [v1.2.0][] (beta - docs, space-delimited alias arguments, artifact changes, optional `data-` prefixes, combo fix)
* 2014-04-22 [v1.2.1][] (beta - docs, shorthand type for [key] and @location)
* 2014-04-24 [v1.3.0][] (beta - server fixes, nodeunit tests, dual Eventi ctor)
* 2014-04-29 [v1.3.1][] (beta - jquery integration aid)

[v0.5.0]: https://github.com/esha/Eventi/tree/0.5.0
[v1.0.0]: https://github.com/esha/Eventi/tree/1.0.0
[v1.0.1]: https://github.com/esha/Eventi/tree/1.0.1
[v1.0.2]: https://github.com/esha/Eventi/tree/1.0.2
[v1.1.0]: https://github.com/esha/Eventi/tree/1.1.0
[v1.2.0]: https://github.com/esha/Eventi/tree/1.2.0
[v1.2.1]: https://github.com/esha/Eventi/tree/1.2.1
[v1.3.0]: https://github.com/esha/Eventi/tree/1.3.0
[v1.3.1]: https://github.com/esha/Eventi/tree/1.3.1
