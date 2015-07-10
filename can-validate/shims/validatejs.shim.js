/**
* @module {can.Construct} validatejs-shim ValidateJS Shim
* @parent can-validate-shims
* @description
* HEYO!
*
*
*/

import can from 'can';
import validatejs from 'validate.js';

//add shim
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
	once: function (value, options, name) {
		var errors = validatejs.single(value, processOptions(options));

		// Add the name to the front of the error string
		if (errors && name) {
			for (var i = 0; i < errors.length; i++) {
				// Attempt to prettyify the name in each error
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
