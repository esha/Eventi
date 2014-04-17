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

## Methods

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


### Eventi.off([targets, ][eventi, ][fn])

Unregisters event listeners that match the specified event(s) and/or function on the specified target(s), or the global/window object, if none is specified.

Arguments | Required | Type(s) | Default | Description
--------- | -------- | ------- | ------- | -----------
target | No | _Object_, _Array_ | global/window | A single target or array of them.
eventi | No | _String_, _Array_* | | One or more space-delimited Eventi definitions (or portions thereof) or an array of them (*in which case you *must* specify a target argument)
fn | No | _Function_ | | The specific listener function to be removed.

```javascript
Eventi.off(user, 'account:');
```

### Eventi.alias([context, ]eventi,...)

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

### Eventi.fy(target)

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
#### Category:
#### #Tags
#### (Detail)
#### _NoBubbles

### Browser - Environment Awareness

#### <.Delegate>
#### [Key]
#### @Location

### Control - For Special Handling

#### =>Alias
#### ^Singleton
#### $End
#### !Important

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
