_.fire = function(target, events, props, data) {
    if (typeof props === "object" &&
        ('bubbles' in props || 'detail' in props || 'cancelable' in props)) {
        props.data = data;
    } else {
        if (props !== undefined) {
            data = data ? data.unshift(props) && data : [props];
        }
        props = { data: data };
    }
    return _.trigger(target, events, props);
};
_.trigger = function(target, events, props) {
    var event;
    for (var i=0; i<events.length; i++) {
        event = _.create(events[i], props);
        _.dispatch(target, event);
    }
    return event;
};
_.dispatch = function(target, event) {
    (target.dispatchEvent || target[_.secret] || _.noop).call(target, event);
    if (target.parentObject) {
        _.dispatch(target.parentObject, event);
    }
};
Eventi.fire = _.wrap(_.fire, 3);