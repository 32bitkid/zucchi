var zucchi = require('./zucchi.js'),
    expect = require('chai').expect;

zucchi.use({ prepare: function(result) { return expect(result); } });

var square = function(x) { return x*x; };

// Basic Grammar
zucchi.given(zucchi.given)
  .when(function(fn) { return fn(square); })
  .then(function(expect) { expect.itself.to.respondTo("when"); })

  .when(function(fn) { return fn(square).when(1); })
  .then(function(expect) { expect.itself.to.respondTo("then"); })

  .when(function(given) { return given(square); })
  .then(function(expect) { expect.itself.not.to.respondTo("and"); })

  .when(function(given) { return given(square).when(1).then(1); })
  .then(function(expect) { expect.itself.to.respondTo("and"); })

  .done();

zucchi
.given(square)

.when(1).then(1)

.when(2)
.then(4)
.and(function(e) { e.to.equal(4); })

.done();


