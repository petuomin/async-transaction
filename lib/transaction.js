/*jshint newcap: false*/
"use strict";

var Q = require('q');


function RollbackError(message) {
  this.name = 'RollbackError';
  this.message = message || 'Rollback failed';
}
RollbackError.prototype = Object.create(Error.prototype);
RollbackError.prototype.constructor = RollbackError;

function run(sequence) {

	var rollbacks = [];

	var runner = Q.defer();

	var chain = Q();
	sequence.forEach(function (stepDef) {
		chain = chain.then(step(stepDef));
	});
	chain.then(function() {		
		runner.resolve();
	}).catch(function(error) {
		
		// do a rollback
		executeRollbacks(error.rollbacks).then(function() {
			runner.reject(error);
		}, function(error) {
			runner.reject(new RollbackError(error.message));
		}).done();

	});

	return runner.promise;


	// transaction step
	function step(fn) {

		return function() {
			var p = fn.action();

			p.catch(function(error) {
				//Add rollbackinfo to error
				error.rollbacks = rollbacks;
				throw error;
			});

			p.then(function(result) {
				rollbacks.unshift(fn.rollback);
				return result;
			});
		
			return p;
		};
	}

}

function executeRollbacks(rollbackSequence) {
	return rollbackSequence.reduce(function (soFar, f) {
		return soFar.then(f);
	}, Q());
}


module.exports = {
	run: run,
	RollbackError: RollbackError
};
