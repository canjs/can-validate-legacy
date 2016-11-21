/* jshint asi: false */

var QUnit = require("steal-qunit");
var validate = require("can-validate");

var Shim = {
	once: function (value, options, name) {
		return {v: value, o: options, n: name};
	},
	isValid: function (value, options) {
		return {v: value, o: options};
	},
	validate: function (values, options) {
		return {v: values, o: options};
	}
};

QUnit.module("can-validate", {
	setup: function(){
		validate.register('testValidator', Shim);
	}
});

QUnit.test("when once method is called",function(){
	var errors = validate.once('foo', 'bar', 'heyo');

	QUnit.equal(errors.v,'foo');
	QUnit.equal(errors.o,'bar');
	QUnit.equal(errors.n,'heyo');

});
/*
describe('can-validate', function () {
	beforeEach(function () {

	});

	describe('when once method is called', function () {
		beforeEach(function () {
			errors = can.validate.once('foo', 'bar', 'heyo');
		});

		it('forwards correct arguments to shim', function () {
			expect(errors.v).to.equal('foo');
			expect(errors.o).to.equal('bar');
			expect(errors.n).to.equal('heyo');
		});
	});

	describe('when isValid method is called', function () {
		beforeEach(function () {
			errors = can.validate.isValid('foo', 'bar');
		});

		it('forwards correct arguments to shim', function () {
			expect(errors.v).to.equal('foo');
			expect(errors.o).to.equal('bar');
		});
	});

	describe('when validate method is called', function () {
		beforeEach(function () {
			errors = can.validate.validate('foo', 'bar');
		});

		it('forwards correct arguments to shim', function () {
			expect(errors.v).to.equal('foo');
			expect(errors.o).to.equal('bar');
		});
	});
});*/
