/* jshint asi: false */
import can from 'can';
import 'can/map/define/';
import 'can-validate/can-validate';
import 'can-validate/map/validate/';
import 'can-validate/shims/validatejs.shim';
import 'steal-qunit';

var ValidatedMap = can.Map.extend({
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

var validatedMap = new ValidatedMap({});

test('validate on init', function () {
	equal(validatedMap.errors.myNumber.length, 1, 'Validate ran successfully on init.');
});

test('validate', function () {
	equal(validatedMap.errors.myString, undefined, 'Does not validate on init by default.');
	validatedMap.attr('myString', '');
	equal(validatedMap.errors.myString.length, 1, 'Validate ran successfully on change of value.');
});
