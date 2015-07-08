//add shim
steal('can/util', 'can-validate/validations', 'can/validate', 'can/observe', function (can, validations) {

	var Shim = can.Construct.extend({
		once: function (value, options) {
			return this.validate(value, options);
		},
		isValid: function (value, options) {
			return this.validate(value, options);
		},
		validate: function (values, options) {
			if (!isValidValue(values)) {
				values = makeValidationObject(values, options);
			}
			return validations.validate(values, options);
		}
	});

	can.validate.register('validatejs', new Shim());
});
