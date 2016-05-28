/* jshint asi: false */
import can from 'can';
import 'can/map/define/';
import 'can-validate';
import 'can-validate/map/validate/';
import 'can-validate/shims/validatejs.shim';
import 'chai';
import 'steal-mocha';
var expect = chai.expect;
var validatedMap;
var secondaryMap;
var ValidatedMap = can.Map.extend({
	define: {
		myNumber: {
			value: 100,
			validate: {
				required: true
			}
		},
		computedProp: {
			value: '',
			validate: {
				presence: function () {
					return this.attr('isRequired');
				}
			}
		},
		isRequired: {
			value: false,
			type: 'boolean'
		}
	}
});

describe('Validate can.Map define plugin', function () {
	describe('on init', function () {
		describe('validateOnInit is not set', function () {
			beforeEach(function () {
				validatedMap = new ValidatedMap();
			});
			it('does not validate', function () {
				expect(can.isEmptyObject(validatedMap.errors)).to.equal(true);
			});
		});
	});

	describe('when set is called', function () {
		beforeEach(function () {
			validatedMap = new ValidatedMap();
			validatedMap.attr('myNumber', '');
		});

		it('validates', function () {
			expect(validatedMap.errors.myNumber.length).to.equal(1);
		});
	});

	describe('when creating multiple instances of the same map', function () {
		beforeEach(function () {
			validatedMap = new ValidatedMap();
			secondaryMap = new ValidatedMap({isRequired: true});
		});
		it('first map validates successfully', function () {
			expect(can.isEmptyObject(validatedMap.errors.computedProp)).to.equal(true);
		});
		it('second map validates, sets error', function () {
			expect(secondaryMap.attr('computedProp')).to.equal(true);
			expect(can.isEmptyObject(secondaryMap.errors.computedProp)).to.equal(true);
		});
	});
});
