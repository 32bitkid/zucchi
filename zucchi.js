;(function(ctx) {
  
  var define = ctx.define || function(module) { ctx.zucchi = module(); };
  
  // Result Wrapper
  function DefaultActualWrapper(actual) {
    this.actual = actual;
  }
  
  DefaultActualWrapper.prototype.equals = function(expected) {
    console.log("Checking " + this.actual + " == " + expected);
    if(this.actual != expected) { throw "Expected " + expected + ", but got " + this.actual; }
  };
  
  // Helpers
  
  // Extend a given object with all the properties in passed-in object(s).
  var extend = function(obj) {
    var sources = Array.prototype.slice.call(arguments, 1);
    for(var i=0,l=sources.length,source;i<l;i++) {
      source = sources[i];
      for(var prop in source) {
        obj[prop] = source[prop];
      }
    }
    return obj;
  };
  
  var curry = function(fn, invokeWhenComplete) {
    var fnLength = fn.length,
        apply = Function.prototype.apply.bind(fn, undefined),
        setArgs = Function.prototype.bind.bind(collectArgs, undefined);
        
    return setArgs([]);
    
    function collectArgs(args) {
      var wasInvokedWithNoNewArgument = (arguments.length == 1); 

      if (!wasInvokedWithNoNewArgument) {
        args = Array.prototype.slice.call(args);
        args.push(); 
      }
      
      var hasAllArgs = (args.length == fnLength);
      if (wasInvokedWithNoNewArgument || (invokeWhenComplete && hasAllArgs)) {
        return apply(args);
      } else {
        return setArgs(args);
      }
    }
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
    
    wrapper.check = function() {
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
  
  define(function() {
    return {
      given: given,
      use: function(newOptions) {
        options = extend({}, defaultOptions, newOptions); 
      },
      version: "0.0.1"
    };
  });
})(this);
