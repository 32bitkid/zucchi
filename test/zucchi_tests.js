var zucchi = require('../zucchi.js'),
    expect = require('chai').expect;

zucchi.use({prepare: function(result) { return expect(result); } });

var square = function(x) { return x*x; };

// Basic Grammar
zucchi.given(zucchi.given)
  // support `when`
  .when(function(given) { return given(square); })
  .then(function(expect) { expect.itself.to.respondTo("when"); })

  // support `then`
  .when(function(given) { return given(square).when(1); })
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

  .done(true);

var square = zucchi.given(function(x) { return x*x; })
  .when(3).then(4);

square(2);
