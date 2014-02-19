_.comboRE = /\+|>/;
// overwrite fire.js' _.fireAll to watch for combo events
_.fireAll = function(target, events, props, _resumeIndex) {
    var event, sequence;
    for (var i=0; i<events.length; i++) {
		sequence = props.sequence = events[i].split(_.comboRE);
        for (var j=_resumeIndex||0; j < sequence.length && (!event||!event.isSequencePaused()); j++) {
            if (sequence[j]) {
                props.index = j;
                event = props.previousEvent = _.create(sequence[j], props);
                _.sequence(event, props, target);
                _.dispatch(target, event);
            } else {
                sequence.splice(j--, 1);
            }
        }
    }
    return event;
};
_.sequence = function(event, props, target, paused) {
    event.resumeSequence = function(index) {
        if (paused) {
            paused = false;
            _.fireAll(target, props.sequence, props, index||props.index);
        }
    };
    event.pauseSequence = function(promise) {
        if (paused !== false) {// multiple pauses is nonsense
            paused = true;
            return promise && promise.then(this.resumeSequence);
        }
    };
    event.isSequencePaused = function(){ return !!paused; };
};

Eventi.on('eventi:handler#new', function comboHandler(e, handler) {
	var text = handler.text,
		joint = text.match(_.comboRE);
	if (joint) {
		var types = text.split(joint[0]),
			fn = handler.comboFn = _.comboFn(joint[0]==='>', types, text);
		for (var i=0,m=types.length; i<m; i++) {
			// override full type with parsed, core type for comboFn's use
			types[i] = _.handler(handler.target, types[i], handler.selector, fn).type;
		}
		fn.reset();
	}
});
_.comboTimeout = 1000;
_.comboFn = function(ordered, types, text) {
	var waitingFor,
		clear,
		reset = function() {
			if (clear){ clearTimeout(clear); }
			waitingFor = types.slice();
		},
		fn = function(e) {
			if (!clear){ clear = setTimeout(reset, _.comboTimeout); }
			var i = waitingFor.indexOf(e.type);
			if (ordered ? i === 0 : i >= 0) {
				waitingFor.splice(i, 1);
				if (!waitingFor.length) {
					_.fire(e.target, text);
					reset();
				}
			}
		};
	fn.reset = reset;
	return fn;
};

// watch for handler.comboFn and remove sub-handlers
Eventi.on('eventi:handler#off', function cleanedHandler(e, handler) {
	if (handler.comboFn) {
		_.off(handler.target, '', handler.comboFn);
	}
});