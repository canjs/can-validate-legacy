//Copies old map validation plugin stuff
steal('can', function (can) {

	//validations object is by property.  You can have validations that
	//span properties, but this way we know which ones to run.
	//  proc should return true if there's an error or the error message

	return can.Construct.extend({
		once: function (value, options, key) {
			var errors = [];
			// normalize argumetns
			if (!proc) {
				proc = options;
				options = {};
			}

			errors.push(function (newVal) {
				// if options has a message return that, otherwise, return the error
				var res = proc.call(this, newVal, attrName);
				return res === undefined ? undefined : options.message || res;
			});
		},

		validate: function (values, options) {
			var errors=[];
			options = options || {};

			can.each(values, function (attrName) {
				var opts = options[attrName];
				// Add a test function for each attribute
				if (!errors[attrName]) {
					errors[attrName] = [];
				}

				opts.each(function (opt, key) {
					var validator = 'validate' + can.capitalize(key) + 'Of';

					
				});

				errors[attrName].push(function (newVal) {
					// if options has a message return that, otherwise, return the error
					var res = proc.call(this, newVal, attrName);
					return res === undefined ? undefined : options.message || res;
				});
			});
		},

		validationMessages: {
			format: 'is invalid',
			inclusion: 'is not a valid option (perhaps out of range)',
			lengthShort: 'is too short',
			lengthLong: 'is too long',
			presence: 'can\'t be empty',
			range: 'is out of range',
			numericality: 'must be a number'
		},
		validateFormatOf: function (attrNames, regexp, options) {
			validate.call(this, attrNames, options, function (value) {
				if (typeof value !== 'undefined' && value !== null && value !== '' && String(value)
					.match(regexp) === null) {
					return this.constructor.validationMessages.format;
				}
			});
		},
		validateInclusionOf: function (attrNames, inArray, options) {
			validate.call(this, attrNames, options, function (value) {
				if (typeof value === 'undefined') {
					return;
				}
				for (var i = 0; i < inArray.length; i++) {
					if (inArray[i] === value) {
						return;
					}
				}
				return this.constructor.validationMessages.inclusion;
			});
		},
		validateLengthOf: function (attrNames, min, max, options) {
			validate.call(this, attrNames, options, function (value) {
				if ((typeof value === 'undefined' || value === null) && min > 0 || typeof value !== 'undefined' && value !== null && value.length < min) {
					return this.constructor.validationMessages.lengthShort + ' (min=' + min + ')';
				} else if (typeof value !== 'undefined' && value !== null && value.length > max) {
					return this.constructor.validationMessages.lengthLong + ' (max=' + max + ')';
				}
			});
		},
		validatePresenceOf: function (attrNames, options) {
			validate.call(this, attrNames, options, function (value) {
				if (typeof value === 'undefined' || value === '' || value === null) {
					return this.constructor.validationMessages.presence;
				}
			});
		},
		validateRangeOf: function (attrNames, low, hi, options) {
			validate.call(this, attrNames, options, function (value) {
				if ((typeof value === 'undefined' || value === null) && low > 0 || typeof value !== 'undefined' && value !== null && (value < low || value > hi)) {
					return this.constructor.validationMessages.range + ' [' + low + ',' + hi + ']';
				}
			});
		},
		validatesNumericalityOf: function (attrNames) {
			validate.call(this, attrNames, function (value) {
				var res = !isNaN(parseFloat(value)) && isFinite(value);
				if (!res) {
					return this.constructor.validationMessages.numericality;
				}
			});
		}
	},{});
});
