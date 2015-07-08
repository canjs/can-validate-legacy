steal('can/util', 'can-validate', 'can/map', function (can) {

	var proto = can.Map.prototype,
		oldSet = proto.__set;

	var getPropDefineBehavior = function(behavior, attr, define) {
		var prop, defaultProp;

		if(define) {
			prop = define[attr];
			defaultProp = define['*'];

			if(prop && prop[behavior] !== undefined) {
				return prop[behavior];
			}
			else if(defaultProp && defaultProp[behavior] !== undefined) {
				return defaultProp[behavior];
			}
		}
	};
	proto.__set = function (prop, value, current, success, error) {
		var allowSet = true,
			validateOpts = getPropDefineBehavior("validate", prop, this.define),
			errors;

		// If validation options set, run validation
		if(validateOpts) {
			// run validation
			errors = can.validate.once(value, validateOpts, prop);

			if(errors && errors.length > 0) {

				// Create errors property if doesn't exist
				if(!this.attr('errors')) {
					this.attr('errors', {});
				}

				// Apply error response to observable
				this.attr('errors').attr(prop,errors);

				// Don't set value if `precheck` is true
				if (validateOpts.precheck && validateOpts.precheck === true) {
					allowSet = false;
				}
			} else {
				// clear errors for this property if they exist
				if(this.attr('errors') && this.attr('errors').attr(prop) ) {
					this.attr('errors').removeAttr(prop);
				}
			}
		}

		if (allowSet) {
			oldSet.call(this, prop, value, current, success, error);
		}

	};
});
