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
var checkStorage = {
	key: '',
	value: '',
	opts: {},
	map: {}
};
var validateOpt = {
	numericality: function () {
		checkStorage.value = arguments[0];
		checkStorage.key = arguments[1];
		checkStorage.opts = arguments[2];
		checkStorage.map = arguments[3];
		return {greaterThan: 2};
	}
};

var ValidatedMap = can.Map.extend({
	define: {
		myNumber: {
			value: 100,
			validate: {
				required: true
			}
		},
		computedProp: {
			validate: {
				required: function () {
					return this.attr('isRequired');
				}
			},
			value: ''
		},
		isRequired: {
			value: false,
			type: 'boolean'
		},
		anotherComputedProp: {
			value: 0,
			validate: validateOpt,
			type: 'number'
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

	// #27 - Validate method does not resolve computes
	describe('when validate method is called', function () {
		beforeEach(function () {
			validatedMap = new ValidatedMap({
				isRequired: true,
				myNumber: 0
			});
		});

		it('resolves computes before calling Validate method', function () {
			var success = false;
			try {
				validatedMap.validate();
				success = true;
			} catch (err) {
				success = err;
			}
			expect(success).to.equal(true);
		});
	});

	/**
	 * #26 When a map constructor is init'd multiple times, the validate plugin
	 * would create computes for the props but in the way it processed the
	 * props, it overwrote the prototype of the map instead of creating a unique
	 * version for each map instance.
	 */
	describe('when creating multiple instances of the same map', function () {
		beforeEach(function () {
			// Doing this should not affect our control. If bug exists, it will
			// affect all instances
			validatedMap = new ValidatedMap();
			validatedMap.attr('isRequired', true);

			// this is our control, we wont change any values on this
			secondaryMap = new ValidatedMap();
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

	// #30: Computes should have new value and key name
	describe('when validate function is passed', function () {
		beforeEach(function () {
			validatedMap = new ValidatedMap();
			validatedMap.attr('anotherComputedProp', 1);
		});
		it('compute returns correct arguments', function () {
			expect(checkStorage.value).to.equal(1);
			expect(checkStorage.key).to.equal('anotherComputedProp');
			expect(checkStorage.opts).to.equal(validateOpt);
			expect(checkStorage.map).to.equal(validatedMap);
		});
	});
});
