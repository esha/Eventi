_.alias = function(alias, text) {
	return function aliased(target) {
		var args = _.slice(arguments),
			index = (typeof target !== "object" || !(target.dispatchEvent || target[_key])) ? 0 : 1;
		args.splice(index, 0, text);
		return this.apply(null, args);
	};
};
(Eventi.alias = function(context) {
	var texts = _.slice(arguments, 1),
		props;
	if (typeof context === "string") {
		texts.unshift(context);
		context = Eventi;
	}
	for (var prop in Eventi) {
		var fn = context[prop];
		if (typeof fn === "function" && !fn.utility) {
			if (context !== Eventi && fn === Eventi[prop]) {
				// prevent shared aliases for different Eventi-fied objects
				fn = context[prop] = fn.bind(context);
			}
			for (var i=0,m=texts.length; i<m; i++) {
				props = {};
				_.parse(texts[i], props, props);
				props.alias = props.alias || props.type;
				fn[props.alias] = _.alias(props.alias, texts[i]);
			}
		}
	}
	return props;
}).utility = true;