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

var proto = can.Map.prototype;
var oldSet = proto.__set;
var ErrorsObj;
var defaultValidationOpts;
var processValidateOpts;

// Gets properties from the map's define property.
var getPropDefineBehavior = function (behavior, attr, define) {
	var prop;
	var defaultProp;

	if (define) {
		prop = define[attr];
		defaultProp = define['*'];

		if (prop && prop[behavior] !== undefined) {
			return prop[behavior];
		} else {
			if (defaultProp && defaultProp[behavior] !== undefined) {
				return defaultProp[behavior];
			}
		}
	}
};

// Default Map for errors object. Useful to add instance helpers
ErrorsObj = can.Map.extend({}, {
	hasErrors: function () {
		return !can.isEmptyObject(this.attr());
	}
});

// Default validation options to extend passed options from
defaultValidationOpts = {
	mustValidate: false,
	validateOnInit: false
};

// Processes validation options, creates computes from functions and adds listeners
processValidateOpts = function (itemObj, opts) {
	var processedObj = {};
	var computes = [];
	var vm = this;

	// Loop through each validation option
	can.each(opts, function (item, key) {
		var actualOpts = item;
		if (typeof item === 'function') {
			// create compute and add it to computes array
			var compute = can.compute(can.proxy(item, vm));
			actualOpts = compute(itemObj.value);
			computes.push({key: key, compute: compute});
		}
		// build the map for the final validations object
		processedObj[key] = actualOpts;
	});

	// Using the computes array, create necessary listeners
	can.each(computes, function (item) {
		item.compute.bind('change', function (ev, newVal) {
			processedObj[item.key] = newVal;
			vm._validateOne(itemObj, processedObj);
		});
	});
	return processedObj;
};

// add method to prototype that validates entire map
can.extend(can.Map.prototype, {
	validate: function () {
		var errors = can.validate.validate(this);

		// Process errors if we got them
		this.attr('errors', new ErrorsObj(errors));

		return can.isEmptyObject(errors);
	},
	_validateOne: function (item, opts) {
		var errors;
		var allowSet = true;

		// run validation
		errors = can.validate.once(item.value, can.extend({}, opts), item.key);

		// Process errors if we got them
		if (errors && errors.length > 0) {
			// Create errors property if doesn't exist
			if (!this.attr('errors')) {
				this.attr('errors', new ErrorsObj({}));
			}

			// Apply error response to observable
			this.attr('errors').attr(item.key, errors);

			// Don't set value if `mustValidate` is true
			if (opts.mustValidate === true) {
				allowSet = false;
			}
		} else {
			// clear errors for this property if they exist
			if (this.attr('errors') && this.attr('errors').attr(item.key)) {
				this.attr('errors').removeAttr(item.key);
			}
		}

		return allowSet;
	}
});

// Override the prototype's __set with a more validate-y one.
proto.__set = function (prop, value, current, success, error) {
	// allowSet is changed only if validation options exist and validation returns errors
	var allowSet = true;
	var validateOpts = getPropDefineBehavior('validate', prop, this.define);
	var propIniting = (this._init && this._init === 1) || false;
	var processedValidateOptions;

	// Build validation options from defaults and processed options
	processedValidateOptions = can.extend({}, defaultValidationOpts, processValidateOpts.call(this, {key: prop, value: value}, validateOpts));

	// If validate opts are set and not initing, validate properties
	// If validate opts are set and initing, validate properties only if validateOnInit is true
	if ((validateOpts && !propIniting) || (validateOpts && propIniting && processedValidateOptions.validateOnInit)) {
		// Validate item
		allowSet = this._validateOne({key: prop, value: value}, processedValidateOptions);
	}

	// Call old __set, in most cases, this will be the define plugin's set.
	if (allowSet) {
		oldSet.call(this, prop, value, current, success, error);
	}
};
