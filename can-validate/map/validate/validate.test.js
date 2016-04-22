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
			value: 100,
			validate: {
				presence: true
			}
		}
	}
});

var validatedMap = new ValidatedMap();

test('validate on set', function () {
	validatedMap.attr('myNumber', '');

	equal(validatedMap.errors.myNumber.length, 1, 'Validate ran successfully on set.');
});
