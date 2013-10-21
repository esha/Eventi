# Eventier

Enjoy easy, rich, native and custom event handling.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/nbubna/Eventier/master/dist/Eventier.min.js
[max]: https://raw.github.com/nbubna/Eventier/master/dist/Eventier.js


## The Plan

#### core.js
* DOM based custom event firing: `Eventier.fire([el, ]'type')`
* rich event syntax (i.e. trigger.js minus declarative mapping): `Eventier.fire([el, ]"category:type['constant']#tags")`
* event sequence support (with async friendly `e.stopSequence([promise])`)
* optional DOM or JS configuration, if there's anything to config

#### listen.js
* on/off for simple event: `Eventier.on([el, ]'type', fn)`,`Eventier.off([el, ]['type', ][fn])`
* filter by selector (aka delegation): `Eventier.on('selector', 'type', fn)`
* filter by rich syntax: `Eventier.on("category:type#tag", fn)`
* bind data w/listener: `Eventier.on('type', fn, data)`
* listen X times: `Eventier.only(2, 'type', fn)`
* ready-style events (call late listeners, ignore multiple firings): `Eventier.heard('type', fn)`
* applying rich event data as listener arg(s): `Eventier.on('type', function(e, arg, arg){})`

#### declare.js (will require listen.js)
* DOM declared event mapping (i.e. trigger.js' declarative stuff)
* DOM declared event handlers (i.e. something like on.js, with no JS in DOM)

#### html.js
* ```HTML._.fn.fire = Eventier.fire;```
* ```if (listen.js){ HTML._.fn.on = Eventier.on; HTML._.fn.off = Eventier.off; ... }```

#### ?jquery.js?
* add custom properties to $.event.props
* add namespace support to rich syntax (ick)
* listen for events in jQuery's manual bubbling system (ick again)
* filter $.fn.trigger, $.fn.on, $.fn.off, $.fn.one to intercept calls with Eventier syntax
  * or add $.fn.eventierFire, $.fn.eventierOn, etc. (gross)
  * or add a massively overloaded $.fn.eventier (yikes)
  * or replace their ancient event handling entirely? (hah. probably asking for trouble.)

#### ?object.js? (seems pointless w/o listen.js)
* non-DOM object rich event support
* that doesn't fail to call subsequent handlers when one throws an error

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
