/* jshint asi: false */
import can from 'can';
import 'can/map/define/';
import 'can-validate/can-validate';
import 'can-validate/map/validate/';
import 'can-validate/shims/validatejs.shim';
import 'chai';
import 'steal-mocha';
const expect = chai.expect;
let validatedMap;
const ValidatedMap = can.Map.extend({
	define: {
		myNumber: {
			value: 'test',
			validate: {
				required: true,
				numericality: true,
				validateOnInit: true
			}
		},
		myString: {
			value: '12345',
			validate: {
				required: true,
				length: 2
			}
		}
	}
});

describe('ValidateJS Shim', function () {
	beforeEach(function () {
		validatedMap = new ValidatedMap({});
	});

	describe('when map is being inited', function () {
		it('validates on init by default', function () {
			expect(validatedMap.errors.myNumber.length).to.equal(1);
		});
	});

	describe('when validate on init is false', function () {
		it('does not validate on init', function () {
			expect(validatedMap.errors.myString).to.equal(undefined);
		});
	});

	describe('when invalid value is set', function () {
		beforeEach(function () {
			validatedMap.attr('myString', '');
		});
		it('returns errors', function () {
			expect(validatedMap.errors.myString.length).to.equal(1);
		});
	});
});
