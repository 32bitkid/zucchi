var zucchi = require('./zucchi.js'),
    expect = require('chai').expect;

zucchi.use({ prepare: function(result) { return expect(result); } });

var square = function(x) { return x*x; };

// Basic Grammar
zucchi.given(zucchi.given)
  // support `when`
  .when(function(fn) { return fn(square); })
  .then(function(expect) { expect.itself.to.respondTo("when"); })

  // support `then`
  .when(function(fn) { return fn(square).when(1); })
  .then(function(expect) { expect.itself.to.respondTo("then"); })

  // `and` shouldn't be available if until it makes sense
  .when(function(given) { return given(square); })
  .then(function(expect) { expect.itself.not.to.respondTo("and"); })
  .when(function(given) { return given(square).when(1); })
  .then(function(expect) { expect.itself.not.to.respondTo("and"); })

  // `support` and for multiple assertions
  .when(function(given) { return given(square).when(1).then(1); })
  .then(function(expect) { expect.itself.to.respondTo("and"); })

  // support `using`
  .when(function(given) { return given(square); })
  .then(function(expect) { expect.itself.to.respondTo("using") })

  .done();

// square test
zucchi.given(square)
// squaring one
.when(1).then(1)

// squaring two
.when(2)
.then(function(e) { e.is.greaterThan(3) })
.and(function(e) { e.is.lessThan(5); })

.done();

// prototype test
var Klass = function(val) { this.val = val; }
Klass.prototype.square = zucchi.given(function() { return this.val*this.val; })
.using(function() { return { val:2 }; })
.when().then(4)
.done();

