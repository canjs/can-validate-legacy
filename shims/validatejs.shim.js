//add shim
steal('can/util', 'valdiatejs/validate', 'can-validate', 'can/observe', function (can, validatejs) {

	function processOptions(opts){
		//check required
		if (opts.required) {
			opts.presence = true;
			if (typeof opts.required === 'object') {
				opts.presence = opts.required;
			}
			delete opts.required;
		}
		return opts;
	};

	var Shim = can.Construct.extend({
		once: function () {
			var value = arguments[0],
				options = arguments[1],
				name = '';

			// check if passing the name
			if (arguments.length > 2) {
				name = arguments[0];
				value = arguments[1];
				options = arguments[2];
			}
			var errors = validatejs.single(value, processOptions(options));

			// Add the name to the front of the error string
			if (errors && name) {
				for (var i = 0; i < errors.length; i++) {

					// Attempt to prettyify the name
					errors[i] = can.capitalize(can.camelize(name)) + ' ' + errors[i];
				}
			}

			return errors;
		},
		isValid: function (value, options) {
			var errors = validatejs.single(value, processOptions(options)) || [];

			return errors.length === 0;
		},
		validate: function (values, options) {
			var valueKeys = Object.keys(values), // <ie9 solution?
				processedOpts = {};

			// process options for each value
			for (var i = 0; i < valueKeys.length; i++) {
				if ( options[i] ) {
					processedOpts[i] = processOptions(options[i]);
				}
			}
			return validatejs(values, processedOpts);
		}
	});

	can.validate.register('validatejs', new Shim());
});
