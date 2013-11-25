_.fire = function(target, sequence, props, data, _resumeIndex) {
    if (props) {
        if (typeof props !== "object" ||
            (!('bubbles' in props) && !('detail' in props) && !('cancelable' in props)) {
            data = data ? data.unshift(props) && data : [props];
        }
    } else {
        props = {};
    }
    if (data && data.length) {
        props.data = data;
    }

    var event;
    if (sequence.length === 1) {
        event = _.create(sequence[0], props));
        _.dispatch(event);
    } else {
        props.sequence = sequence;
        for (var i=_resumeIndex||0; i < sequence.length && (!event||!event.isSequenceStopped()); i++) {
            if (sequence[i]) {
                props.index = i;
                event = props.previousEvent = _.create(sequence[i], props);
                _.sequence(event, props, target);
                _.dispatch(event);
            } else {
                sequence.splice(i--, 1);
            }
        }
    }
    return event;
};
_.dispatch = function(target, event) {
    return (target.dispatchEvent || target[_.secret] || _.noop)(event);
};
_.sequence = function(event, props, target, stopped) {
    event.resumeSequence = function(index) {
        if (stopped) {
            stopped = false;
            _.fire(target, props.sequence, props, null, index||props.index);
        }
    };
    event.stopSequence = function(promise) {
        if (stopped !== false) {// multiple stops is nonsense
            stopped = true;
            return promise && promise.then(this.resumeSequence);
        }
    };
    event.isSequenceStopped = function(){ return !!stopped; };
};

Eventier.fire = _.fixArgs(3, _.fire);
