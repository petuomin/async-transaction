# async-transaction

async-transaction is a javascript library for creating transactions from asynchronous functions. Actions are executed in sequence, and in case of an error, rollback functions are executed in the reversed order.

## Installation
```
npm install async-transaction
```

## Usage
```
var transaction = require('async-transaction');

var sequence = [
	{action: asyncfunc1, rollback: asyncrollbackfunc1},
	{action: asyncfunc2, rollback: asyncrollbackfunc2},
	{action: asyncfunc3, rollback: undefined},
];

transaction.run(sequence).then(function(res) {	
	// everything went ok.
}).catch(function(error) {
	// error if something failed.

	// error is instanceof transaction.RollbackError if rollback fails.
})

```
actionfunctions (asyncfunc1-3) and rollback functions (asyncrollbackfunc1-2) must return a promise.

Depends on Q-promises.
