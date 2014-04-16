_.alias = function(alias, text, context) {
	return function aliased(target) {
		var args = _.slice(arguments),
			index = (typeof target !== "object" || !(target.dispatchEvent || target[_key])) ? 0 : 1;
		args.splice(index, 0, text);
		return this.apply(context, args);
	};
};
Eventi.alias = function(context) {
	var texts = _.slice(arguments, 1),
		props;
	if (typeof context === "string") {
		texts.unshift(context);
		context = Eventi;
	}
	for (var prop in _.fns) {
		for (var i=0,m=texts.length; i<m; i++) {
			props = {};
			_.parse(texts[i], props, props);
			props.alias = props.alias || props.type;
			context[prop][props.alias] = _.alias(props.alias, texts[i], context);
		}
	}
	return props;
};