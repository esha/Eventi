// elements can have `[data-]eventi="handleMe@event"` attributes
// try to resolve handleMe at call-time on element w/attr, global (declared event handler)
// otherwise, fire as application event (declared event mapping)
// impl should scan document for eventi attributes on ^ready, register those listeners
// use MutationObserver to watch for eventi attribute changes?
// use trigger.js' intelligent click/enter-on-child interpreter