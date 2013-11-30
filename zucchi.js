;(function(ctx) {
  
  var def = typeof(define) === "function"
    ?  define
    : typeof(module) !== "undefined"
    ? function(m) { module.exports = m(); }
    : function(m) { ctx.zucchi = m(); };


  // Helpers

  var slice = Array.prototype.slice,

      // Shim for Function.prototype.bind
      bind = Function.prototype.bind || function(that) {
        var fn = this;
        var args = slice.call(arguments, 1);
        return function() {
          return fn.apply(that, args.concat(slice.call(arguments)));
        };
      },

      // Extend a given object with all the properties in passed-in object(s).
      extend = function(obj) {
        var sources = slice.call(arguments, 1);
        for(var i=0,l=sources.length,source;i<l;i++) {
          source = sources[i];
          for(var prop in source) {
            obj[prop] = source[prop];
          }
        }
        return obj;
      },

      // Functional curry
      curry = function(fn, invokeWhenComplete) {
        var fnLength = fn.length,
            apply = bind.call(Function.prototype.apply, fn, undefined),
            setArgs = bind.call(bind, collectArgs, undefined);

        return setArgs([]);

        function collectArgs(args, newArg) {
          var wasInvokedWithNoNewArgument = (arguments.length == 1);

          if (!wasInvokedWithNoNewArgument) {
            args = Array.prototype.slice.call(args);
            args.push(newArg);
          }

          var hasAllArgs = (args.length == fnLength);
          if (wasInvokedWithNoNewArgument || (invokeWhenComplete && hasAllArgs)) {
            return apply(args);
          } else {
            return setArgs(args);
          }
        }
      };

  // Result Wrapper
  function DefaultActualWrapper(actual) {
    this.actual = actual;
  }
  
  DefaultActualWrapper.prototype.equals = function(expected) {
    if(this.actual != expected) { throw "FAILED: Expected " + expected + ", but got " + this.actual; }
  };
  
  
  var addAssertion = curry(function(wrapper, asserts, actual, expected) {
    var actualFn = actual,
        expectedFn = expected;
    
    if(typeof actual !== "function") {
      actualFn = function(fn) { return fn(actual); };
    }
    
    if(typeof expected !== "function") {
      expectedFn = function(actual) { options.simpleThen(actual, expected); };
    }
    
    asserts.push({actual: actualFn, expected: expectedFn});
    
    return wrapper;
  }, true);
  
  var given = function(fn) {
    var steps = [];
    
    var wrapper = function() {
      return fn.apply(this, arguments);
    };
    
    var addIt = addAssertion(wrapper)(steps);
    
    wrapper.done = function() {
      for(var i=0,l=steps.length;i<l;i++) {
        var step = steps[i];
        var actual = step.actual(fn);
        step.expected(options.prepare(actual));
      }
      
      return fn;
    };
    
    wrapper.when = function(it) {
      return { then: addIt(it) };
    };
    
    return wrapper; 
  };
  
  
  // Defaults
  function defaultPrepare(actual) {
    return new DefaultActualWrapper(actual);
  }
  
  function defaultSimpleThen(actual, expected) {
    actual.equals(expected);
  }
  
  var defaultOptions = {
      prepare: defaultPrepare,
      simpleThen: defaultSimpleThen
    };
    
  var options = defaultOptions;
  
  def(function() {
    return {
      given: given,
      use: function(newOptions) {
        options = extend({}, defaultOptions, newOptions); 
      },
      version: "0.0.1"
    };
  });
})(this);
