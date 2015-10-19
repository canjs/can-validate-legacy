/* jshint asi: false */
import can from 'can';
import 'can-validate/can-validate';
import 'steal-qunit';

var Shim = can.Construct.extend({
	once: function (value, options, name) {
		return {v:value, o:options, n:name};
	},
	isValid: function (value, options) {
		return {v:value, o:options};
	},
	validate: function (values, options) {
		return {v:values, o:options};
	}
});

can.validate.register('testValidator', new Shim());

test('once', function () {
	var errors = can.validate.once('foo', 'bar', 'heyo');
	equal(errors.v, 'foo', 'Value argument passed to shim.');
	equal(errors.o, 'bar', 'Options argument passed to shim.');
	equal(errors.n, 'heyo', 'Name argument passed to shim');
});

test('isValid', function () {
	var errors = can.validate.isValid('foo', 'bar');
	equal(errors.v, 'foo', 'Value argument passed to shim.');
	equal(errors.o, 'bar', 'Options argument passed to shim.');
});

test('validate', function () {
	var errors = can.validate.validate('foo', 'bar');
	equal(errors.v, 'foo', 'Value argument passed to shim.');
	equal(errors.o, 'bar', 'Options argument passed to shim.');

});
