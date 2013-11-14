An experiment in BDD-style/contract-style testing for testing  JavaScript functions.

Syntax:

```js
var given = zucchi.given

var square = given(function(x) { return x * x; })
	// Long form
	.when(function(fn) { return fn(1); }).then(function(actual) { actual.equals(1) })
	// Short form
	.when(2).then(4)
	.check();
```

It is also configurable to use with other assertion frameworks like chai.js

```js
zucchi.use({
  prepare: function(result) { return chai.expect(result); }
});

var given = zucchi.given;

var square = given(function(x) { return x * x;  })
	.when(function(fn) { return fn(5); } ).then(function(actual) { actual.to.equal(25); })
	.check();
```
