# async-transaction


```
var transaction = require('transaction');

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

Depends on Q-promises.