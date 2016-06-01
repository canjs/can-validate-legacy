/* jshint asi: false */
import can from 'can';
import 'can-validate/can-validate';

import 'chai';
import 'steal-mocha';
const expect = chai.expect;
let errors;

const Shim = can.Construct.extend({
	once: function (value, options, name) {
		return {v: value, o: options, n: name};
	},
	isValid: function (value, options) {
		return {v: value, o: options};
	},
	validate: function (values, options) {
		return {v: values, o: options};
	}
});

describe('can-validate', function () {
	beforeEach(function () {
		can.validate.register('testValidator', new Shim());
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
});
