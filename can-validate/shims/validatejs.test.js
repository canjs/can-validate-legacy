/* jshint asi: false */
import can from 'can';
import 'can-validate/map/validate/validate';
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

var test = new ValidatedMap({});

test('validate on init', function () {
	equal(test.errors.myNumber.length, 1, 'Validate ran successfully on init.');
});

test('validate', function () {
	equal(test.errors.myString, undefined, 'Does not validate on init by default.');
	test.attr('myString', 'a');
	equal(test.errors.myString.length, 1, 'Validate ran successfully on change of value.');
});
