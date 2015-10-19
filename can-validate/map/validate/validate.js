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
import 'can-validate/can-validate';

var proto = can.Map.prototype,
	oldSet = proto.__set,
	getPropDefineBehavior = function(behavior, attr, define) {
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

var ErrorsObj = can.Map.extend({},{
	hasErrors: function () {
		return !can.isEmptyObject(this.attr());
	}
});

var defaultValidationOpts = {
	mustValidate: false,
	validateOnInit: false
}

// add method to prototype that valdiates entire map
can.extend(can.Map.prototype, {
	validate: function () {
		var errors = can.validate.validate(this);

		// Process errors if we got them
		this.attr('errors', new ErrorsObj(errors));

		return can.isEmptyObject(errors);
	}
});

// Override the prototype's __set with a more validate-y one.
proto.__set = function (prop, value, current, success, error) {

	// allowSet is changed only if validation options exist and validation returns errors
	var allowSet = true,
		validateOpts = getPropDefineBehavior("validate", prop, this.define),
		processedValidateOptions = can.extend({},defaultValidationOpts,validateOpts),
		defaultValue = getPropDefineBehavior("value", prop, this.define),
		propIniting = (this._init && this._init === 1) || false,
		errors;

	// If validate opts are set and not initing, validate properties
	// If validate opts are set and initing, validate properties only if validateOnInit is true
	if((validateOpts && !propIniting) || (validateOpts && propIniting && processedValidateOptions.validateOnInit )  ) {

		// run validation
		errors = can.validate.once(value, can.extend({},processedValidateOptions), prop);

		// Process errors if we got them
		if(errors && errors.length > 0) {

			// Create errors property if doesn't exist
			if(!this.attr('errors')) {
				this.attr('errors', new ErrorsObj({}));
			}

			// Apply error response to observable
			this.attr('errors').attr(prop,errors);

			// Don't set value if `mustValidate` is true
			if (processedValidateOptions.mustValidate === true) {
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
