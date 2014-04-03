if (typeof Function.prototype.bind !== 'function') {
  Object.defineProperty(Function.prototype, 'bind', { value: function() {
    var slice = Array.prototype.slice,
      fn = this,
      callWith = slice.call(arguments),
      bound = function() {
        return fn.call.apply(fn, callWith.concat(slice.call(arguments)));
      };
    bound.prototype = fn.prototype;
    return bound;
  }});
}