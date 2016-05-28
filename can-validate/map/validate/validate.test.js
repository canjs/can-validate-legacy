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
			value: 'hello',
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

	/**
	 * When a map constructor is init'd multiple times, the validate plugin would
	 * create computes for the props but in the way it processed the props, it
	 * overwrote the prototype of the map instead of creating a unique version for
	 * each map instance.
	 */
	describe('when creating multiple instances of the same map', function () {
		beforeEach(function () {
			// Doing this should not affect our control. If bug exists, it will
			// affect all instances
			validatedMap = new ValidatedMap({});
			validatedMap.attr('isRequired', true);

			// this is our control, we wont change any values on this
			secondaryMap = new ValidatedMap({});
		});
		afterEach(function () {
			validatedMap = null;
			secondaryMap = null;
		});
		it('control map validates successfully', function () {
			secondaryMap.attr('computedProp', '');
			expect(can.isEmptyObject(secondaryMap.attr('errors'))).to.equal(true);
		});
		it('other map validates, sets error', function () {
			validatedMap.attr('computedProp', '');
			expect(validatedMap.attr('computedProp')).to.equal('');
			expect(typeof validatedMap.attr('errors.computedProp') !== 'undefined').to.equal(true);
		});
	});
});
