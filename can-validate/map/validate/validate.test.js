/* jshint asi: false */
import can from 'can';
import 'can-validate/map/validate/validate';
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

var test = new ValidatedMap();

test.attr('myNumber', null);
