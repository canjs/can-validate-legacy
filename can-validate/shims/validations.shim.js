//add shim
steal('can', 'can-validate/validations', 'can-validate', 'can/observe', function (can, Validations) {
	//var validate = new Validations();
	var Shim = can.Construct.extend({
		once: function (value, options) {
			return Validations.validate(value, options);
		},
		isValid: function (value, options) {
			return Validations.validate(value, options);
		},
		validate: function (values, options) {
			return Validations.validate(values, options);
		}
	});

	can.validate.register('validations', new Shim());
});
