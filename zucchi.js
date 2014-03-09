;(function(ctx) {
  
  var def = typeof(define) === "function" ? define
    : typeof(module) !== "undefined" ? function(m) { module.exports = m(); }
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

      forEach = bind.call(Function.prototype.call, Array.prototype.forEach || function(eachFn, ctx) {
        ctx = ctx || this;
        for(var i=0,l=this.length;i<l;i++) {
          eachFn.call(ctx, this[i], i, this);
        }
      }),      
      
      // Extend a given object with all the properties in passed-in object(s).
      extend = function(obj) {
        forEach(slice.call(arguments, 1), function(source) {
          for(var prop in source) {
            obj[prop] = source[prop];
          }
        });
        return obj;
      },

      // Functional curry
      curry = function(fn, forever) {
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
          if (wasInvokedWithNoNewArgument || (!forever && hasAllArgs)) {
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
  
  
  var addAssertion = curry(function(wrapper, asserts, ctx, actual, expected) {
    var actualFn,
        expectedFn = expected,
        ctxFn = ctx;
    
    if(actual.length == 1 && typeof actual[0] == "function") {
      actualFn = actual[0];
    } else {
      actualFn = function(fn) { return fn.apply(this, actual); };
    }
    
    if(typeof expected !== "function") {
      expectedFn = function(actual) { options.simpleThen(actual, expected); };
    }
    
    asserts.push({actual: actualFn, expected: expectedFn, ctx: ctxFn});
    
    return wrapper;
  });
  
  var given = function(fn) {
    var steps = [];
    
    var wrapper = function() {
      return fn.apply(this, arguments);
    };
    
    var state = addAssertion(wrapper)(steps);
    
    wrapper.done = function() {
      var eachStep = function(step) {
        var stepFn = fn, context;
        
        if(step.ctx) {
          context = step.ctx();
          stepFn = bind.call(fn, context);
        }

        var actual = step.actual.call(context, stepFn);
        step.expected.call(context, options.prepare(actual));
      };
      
      options.before.call();
      forEach(steps, options.each(eachStep));
      options.after.call();
      
      return fn;
    };
    
    wrapper.using = createUsing(state);
    wrapper.when = createWhen(state(undefined));
    wrapper.suppose = function() { return wrapper; };
    
    return wrapper; 
  };
  
  var createUsing = function(state) {
    return function(ctx) {
      return { when: createWhen(state(ctx)) };
    };
  };
  
  var createWhen = function(state) {
    return function() {
      return { then: createThen(state(arguments)) };
    };
  };
  
  var createThen = function(state) {
    return function(expected) {
      var result = state(expected);
      result.and = state;
      return result;
    };
  };
  
  var defaultOptions = {
    // Defaults
    prepare: function(actual) { return new DefaultActualWrapper(actual); },
    simpleThen: function(actual, expected) { actual.equals(expected); },
    each: function (testcase) { return testcase; },
    before: function() { /* noop */ },
    after: function() { /* noop */ }
  };
  
  var createSession = (function() {
    
    var each = function(testcase) {
      var session = this;
      return function() {
        try {
          testcase.apply(this, arguments);
          session.passed++;
        } catch(ex) {
          session.failed.push(ex);
        }
        session.total++;
      };
    };
    
    var Session = function() {
      this.total = 0;
      this.passed = 0;
      this.failed = [];
    };
    
    Session.prototype.use = function() {
      return { each: bind(each, this) };
    };
    
    Session.prototype.results = function() { /*noop*/ };
    
    return function() {
      return new Session();
    };
  })();
  
  
  var options = defaultOptions;
  
  def(function() {
    return {
      given: given,
      use: function() {
        options = extend.apply(undefined, [{}, defaultOptions].concat(slice.call(arguments))); 
      },
      createSession: createSession,
      version: "0.0.1"
    };
  });
})(this);
