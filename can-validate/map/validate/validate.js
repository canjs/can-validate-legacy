/**
* @module {?} can.Map.validate Map Plugin
* @parent can-validate
*
* @description The can.Map plugin will works alongside can.Map.define to add validation
* to properties on a can.Map. Importing the plugin, validation library, and a shim will
* allow the ability to dynamically check values against validation configuration. errors
* are stored on the can.Map instance and are observable.
*
* @body
*
* ## Initialization
* Import the validation library, validate plugin and a shim to immediately use the
* can.Map.validate plugin.
* ```js
* import 'validatejs';
* import 'can-validate/map/validate';
* import 'can-validate/shims/validatejs.shim';
*```
*
* @demo ./can-validate/map/validate/demo.html
*
*
*/

import can from 'can';

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

// Override the prototype's __set with a more validate-y one.
proto.__set = function (prop, value, current, success, error) {

	// allowSet is changed only if validation options exist and validation returns errors
	var allowSet = true,
		validateOpts = getPropDefineBehavior("validate", prop, this.define),
		errors;

	// If validation options set, run validation
	if(validateOpts) {
		// run validation
		errors = can.validate.once(value, validateOpts, prop);

		// Process errors if we got them
		if(errors && errors.length > 0) {

			// Create errors property if doesn't exist
			if(!this.attr('errors')) {
				this.attr('errors', {});
			}

			// Apply error response to observable
			this.attr('errors').attr(prop,errors);

			// Don't set value if `mustValidate` is true
			if (validateOpts.mustValidate && validateOpts.mustValidate === true) {
				allowSet = false;
			}
		} else {
			// clear errors for this property if they exist
			if(this.attr('errors') && this.attr('errors').attr(prop) ) {
				this.attr('errors').removeAttr(prop);
			}
		}
	}

	// Call old __set, in most cases, this will be the define plugin's set.
	if (allowSet) {
		oldSet.call(this, prop, value, current, success, error);
	}

};
