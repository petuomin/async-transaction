/*jshint mocha:true*/
"use strict";

var Q = require('q');

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var transaction = require('../lib/transaction');

describe('transcation', function() {

	it('should run actions and result in OK if all is well', function(done) {

		var sequence = [
			{action: af("del1"), rollback: af("undel1")},
			{action: af("del2"), rollback: af("undel2")},
			{action: af("merge"), rollback: undefined},
		];

		transaction.run(sequence).then(function(res) {			
			assert(true, "Success callback should be called when everyting is ok");

		}).catch(function(error) {
			if (error.name == "AssertionError") {
				throw error;
			}
			assert(false, "Error callback should not be called when everyting is ok");
		}).done(function() {
			done(); // <- for mocha.
		});
	});

	it('should rollback on error and tell what failed', function(done) {

		var sequence = [
			{action: af("del1"), rollback: af("undel1")},
			{action: af("del2"), rollback: af("undel2")},
			{action: ff("merge"), rollback: undefined},
		];

		transaction.run(sequence).then(function(res) {	
			assert(false, "Success callback was run on error case. Result was: " + res);
		}).catch(function(error) {
			if (error.name == "AssertionError") {
				throw error;
			}
			
			expect(error.message).to.equal("merge");


		}).done(function() {
			done(); // <- for mocha.
		});
	});

	it('should stop execution on first error', function(done) {

		var sequence = [
			{action: af("del1"), rollback: af("undel1")},
			{action: ff("del2"), rollback: af("undel2")},
			{action: af("merge"), rollback: undefined},
		];

		transaction.run(sequence).then(function(res) {	
			assert(false, "Success callback was run on error case. Result was: " + res);
		}).catch(function(error) {
			if (error.name == "AssertionError") {
				throw error;
			}
			
			expect(error.message).to.equal("del2");


		}).done(function() {
			done(); // <- for mocha.
		});
	});


	it('should throw an RollbackError if rollback fails', function(done) {

		var sequence = [
			{action: af("del1"), rollback: ff("undel1")},
			{action: af("del2"), rollback: af("undel2")},
			{action: ff("merge"), rollback: undefined},
		];

		transaction.run(sequence).then(function(res) {	
			assert(false, "Success callback was run on error case.");
		}).catch(function(error) {
			if (error.name == "AssertionError") {
				throw error;
			}
			
			expect(error.message).to.equal("undel1");
			expect(error).to.be.instanceof(transaction.RollbackError);


		}).done(function() {
			done(); // <- for mocha.
		});
	});
	
});
describe('RollbackError', function() {
	it('should be accessible', function() {
		expect(transaction.RollbackError).to.be.a('function');
	});
	it('should have default message if message not fiven', function() {
		var rollbackError = new transaction.RollbackError();
		expect(rollbackError.message).to.equal('Rollback failed');
	});
});


function af(text) {
	return function() {
		return asyncFunc(text);
	};
}
function ff(text) {
	return function() {
		return asyncFail(text);
	};
}

function asyncFunc(text) {
	var d = Q.defer();
	console.log("Doing %s", text);
	setTimeout(function() { d.resolve(text); }, 50);

	return d.promise;
}

function asyncFail(text) {
	var d = Q.defer();

	setTimeout(function() {d.reject(new Error(text)); }, 50);

	return d.promise;
}

