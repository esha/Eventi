# Eventi

Powerful application events and event handling, made easy.

## Getting Started
Download the [full][], [minified][min], or [server][server] versions. [![Build Status](https://travis-ci.org/esha/Eventi.png?branch=master)](https://travis-ci.org/esha/Eventi)  
[Bower][bower]: `bower install eventi`  
[NPM][npm]: `npm install eventi`   
[Component][component]: `component install esha/Eventi`  

[full]: https://raw.github.com/esha/Eventi/master/dist/Eventi.js
[min]: https://raw.github.com/esha/Eventi/master/dist/Eventi.min.js
[server]: https://raw.github.com/esha/Eventi/master/dist/Eventi.server.js
[npm]: https://npmjs.org/package/eventi
[bower]: http://bower.io/
[component]: http://component.io/

## Eventi API

#### Eventi.fire([target, ]eventi[, data,...])

Creates and dispatches the specified event(s) on the specified target(s), attaching any specified data.

Arguments | Required | Type(s) | Default | Description
--------- | -------- | ------- | ------- | -----------
target | No | _Object_, _Array_ | global/window | A single target or array of them.
eventi | Yes | _String_, _Event_, _Array_* | | One or more space-delimited Eventi definitions, an Event instance, or an array of either
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
eventi | Yes | _String_, _Array_* | | One or more space-delimited Eventi definitions or an array of them (*in which case you *must* specify a target argument)
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
eventi | No | _String_, _Array_* | | One or more space-delimited Eventi definitions (or portions thereof) or an array of them (*in which case you must specify a target argument)
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

#### Type (e.g. `open`)

This is the central, "action" portion in an Eventi definition. It is *not* optional in most definitions, with the exception of calls to `off()`. It is what you have left after you strip off all the other event and handler properties described below here. It is an Event instance's `type` property. This should typically be a simple verb, in present or past tense.

```javascript
var e = new Eventi('open');
console.log(e.type);// outputs 'open'
```

#### Category: (e.g. `account:open`)

This is the "subject" option in an Eventi definition. The category always precedes the type and is delimited from it by a `:`. It is an Eventi instance's `category` property. This should typically be a simple noun, and represent the subject or owner of a set of events. It is good practice to provide a category for your events unless you specifically mean them to be broadly applied.

```javascript
var e = Eventi.fire('account:open');
console.log(e.category);// outputs 'account'
```

#### #Tags (e.g. `move#up#left`)

These are the "adverb" or "adjective" portions of Eventi definitions. They always follow the type and are delimited from it and each other by `#`. When creating an Event, they are set together in an array on the instance as the `tags` property and each individual tag is set on the instance as a property with a value of `true`. Use these to distinguish related sub-types of events or provide simple annotations for the subject or object of an event.

```javascript
Eventi.on('open#new', function(e) {
  if (e.unverified) {
    console.log(e.tags.join(' & '));// outputs 'new & unverified'
  }
}).fire('open#new#unverified');
```

#### (Detail) (e.g. `account:label(["verified","gold"])`)

This is the "object" portion of an Eventi definition. It follows the type and is delimited by `(` and `)`. The contents may be either JSON (which will get parsed), a reference to a global value (which will be resolved), or an arbitrary string. The result is an instance's `detail` property. Use this to declaratively attach contextual information for an event at the moment it is created.

```javascript
window.user = { name: "jdoe123" };
var e = Eventi.fire('like(user.name)');
console.log(e.detail);// outputs 'jdoe123'
```


### Browser - Environment Awareness

#### <.Delegate> (e.g. `cancel<.transaction>`)

This specifies a selector for event delegation and is delimited by `<` and `>`. It instructs a listener to only react to events happening within the bounds of elements matching the specified selector and to use the matching element as the context for the handling function.

```javascript
Eventi.on('change<[type=checkbox]>', function(e) {
  console.log(this.type);// always outputs 'checkbox'
});
```

#### [Key]  (e.g. keyup[delete])

This specifies a key or combination thereof, by either keyCode or description, and is delimited by `[` and `]`. It instructs a listener to only react to events that know

#### @Location

### Control - For Special Handling

#### _NoBubbles (e.g. `_hide`)

This simply tells the dispatching code not to let an event propogate beyond the immediate target. Include a `_` in the control characters at the start of an event definition to set the `bubbles` property to false.

```javascript
Eventi.on('test', function(e) {
  console.log('Element events will never get here if they do not bubble.');
});
Eventi.fire(document.getElementById('hideme'), '_test');
```

#### /Global (e.g. `/login`)

This registers the listener on the global/window object but executes handler functions in the context for which they are registered. Include a `/` in the control characters at the start of an event definition to assign the listener globally.

```javascript
var buttons = document.querySelector('button,[type=submit]');
Eventi.on(buttons, '/ajaxStart', function(e) {
  this.disabled = true;
});
```

#### ^Singleton (e.g. `^ready`)

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

#### $End (e.g. `login$1`)

Not all event listeners are meant to last forever. You may declare a listener's end when registering it by appending a `$` and a condition to the event definition. The condition may be either a number (indicating the number of executions allowed), a reference to a value (either a property of the context or global/window), or a reference to a function that will return such a value. In the case of a value, you may also prefix it with `!` to reverse the condition. The "end declaration" follows all features of a definition except an alias. The most common is, of course, `$1` for single-use listeners.

```javascript
Eventi.on(player, 'respawn:$!livesLeft', player.respawn);
```javascript
```
Eventi.on('load$1', Plugins.init);
```

#### !Important (e.g. `!location`)

A `!` control character in the front of an event definition is only relevant when you try to `off()` it. Listeners defined as "important" may only be unregistered by a fully-matching definition given to `off()`, including the `!`. This exists mostly to protect "internal" listeners (both Eventi's own and extensions) from being errantly unregistered.

```javascript
Eventi.on('!demo', function() {
  console.log('still here!');
});
Eventi.off('demo');
Eventi.fire('demo');// will output 'still here!'
```

#### =>Alias




### Multiplicity - One Is Not Enough

#### "Multiple Events"
#### "Event,Sequences"
#### "Combo+Events"


## Release History
* 2014-02-11 [v0.5.0][] (alpha)
* 2014-04-03 [v1.0.0][] (beta)
* 2014-04-04 [v1.0.1][] (beta - IE fixes)
* 2014-04-09 [v1.0.2][] (beta - toString and location fix)
* 2014-04-17 [v1.1.0][] (beta - restructure artifacts, small improvements)
* 2014-04-18 [v1.1.1][] (beta - docs, space-delimited alias arguments)

[v0.5.0]: https://github.com/esha/Eventi/tree/0.5.0
[v1.0.0]: https://github.com/esha/Eventi/tree/1.0.0
[v1.0.1]: https://github.com/esha/Eventi/tree/1.0.1
[v1.0.2]: https://github.com/esha/Eventi/tree/1.0.2
[v1.1.0]: https://github.com/esha/Eventi/tree/1.1.0
[v1.1.1]: https://github.com/esha/Eventi/tree/1.1.1
