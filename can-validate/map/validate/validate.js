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
* ## Usage
*
* Using can-validate Map plugin only requires two extra actions,
*
* - add a validate object to the desired property
* - add a check in the view for the errors object
*
* The validate object depends on the desired valdiation library. The examples
* below use ValidateJS.
*
*```js
* var ViewModel = can.Map.extend({
*   define: {
*     name: {
*       value: '',
*       validate: {
*         required: true
*       }
*     }
*   }
* });
* var viewModel = new ViewModel({});
* viewModel.validate();
* // `errors` will have an error because the `name` value is empty
* //  and required is true.
* viewModel.attr('errors');
* viewModel.attr('name', 'Juan');
* viewModel.attr('errors'); // => Errors is now empty!
*```
*
* ## Demo
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

//TODO: Don't do this, instead create a property during `setup` that is removed
// during `init`.
var isMapInitializing = function () {
	var initing = false;
	// Pre 2.3
	if (this._init) {
		initing = this._init === 1 || false;
	}

	// 2.3
	if (this._initializing) {
		initing = this._initializing;
	}

	// post 2.3
	if (this.__inSetup) {
		initing = this.__inSetup;
	}

	return initing;
};

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

// add method to prototype that validates entire map
can.extend(can.Map.prototype, {

	/**
	* @function validate Validate
	* @deprecated {1.0} `validate` is deprecated and will be removed in version 1.0.
	* Use `_validate` instead.
	*
	* @description Runs validation on the entire map instance. Actual behavior of
	* "validate all" is defined by the registered shim.
	*/
	validate: function () {
		return this._validate();
	},

	/**
	* @function _validate _Validate
	* @description Runs validation on the entire map instance. Actual behavior of
	* "validate all" is defined by the registered shim (`validate`).
	*/
	_validate: function () {
		var errors = can.validate.validate(this);

		// Process errors if we got them
		this.attr('errors', new ErrorsObj(errors));

		return can.isEmptyObject(errors);
	},
	/**
	* @function _validateOne Validate One
	* @description Main method used by `can.Map.define` setter when a property changes.
	*  Runs validation on a property. Actual behavior of "validate one" is defined
	*  by the registered shim (`once`).
	*
	*  It also handles setting the errors property on the map instance and then
	* manages the errors for the current property within the errors object.
	*
	* @param {object} item A key/value object
	* @param {object} opts Object that contains validation config.
	* @return {boolean} True if method found that the property can be saved; if
	*  validation fails and the property must validate (`mustValidate` property),
	*  this will be `false`.
	*/
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
	},

	/**
	* @function _processValidateOpts Process Validate Opts
	* @description Allows the ability to pass computes in validation properties,
	* this allows for things like making a property required based on the value on
	* another property.
	*
	* Processes validation options, creates computes from functions and adds
	* listeners to computes.
	* @param {object} itemObj Property to validate
	* @param {object} opts Map of validation options
	*/
	_processValidateOpts: function (itemObj, opts) {
		var processedObj = {};
		var computes = [];
		var vm = this;

		// Loop through each validation option
		can.each(opts, function (item, key) {
			var actualOpts = item;
			if (typeof item === 'function') {
				// create compute and add it to computes array
				var compute = can.compute(can.proxy(item, vm));
				//actualOpts = compute(itemObj.value);
				actualOpts = compute;
				computes.push({key: key, compute: compute});
			}
			// build the map for the final validations object
			processedObj[key] = actualOpts;
		});

		// Using the computes array, create necessary listeners
		// We do this afterwards instead of inline so we can have access
		// to the final set of validation options.
		can.each(computes, function (item) {
			item.compute.bind('change', function (ev, newVal) {
				processedObj[item.key] = newVal;
				itemObj.value = vm.attr(itemObj.key);
				vm._validateOne(itemObj, processedObj);
			});
		});
		return processedObj;
	}
});

// Override the prototype's __set with a more validate-y one.
proto.__set = function (prop, value, current, success, error) {
	// allowSet is changed only if validation options exist and validation returns errors
	var allowSet = true;
	var validateOpts = getPropDefineBehavior('validate', prop, this.define);
	var propIniting = isMapInitializing.call(this);

	if (typeof validateOpts !== 'undefined') {
		//create validation computes
		if (propIniting) {
			validateOpts = can.extend({},
				defaultValidationOpts,
				validateOpts,
				this._processValidateOpts({key: prop, value: value}, validateOpts)
			);
			this.define[prop].validate = validateOpts;
		}
		// If validate opts are set and not initing, validate properties
		// If validate opts are set and initing, validate properties only if validateOnInit is true
		if ((validateOpts && !propIniting) || (validateOpts && propIniting && validateOpts.validateOnInit)) {
			// Validate item
			allowSet = this._validateOne({key: prop, value: value}, validateOpts);
		}
	}

	// Call old __set, in most cases, this will be the define plugin's set.
	if (allowSet) {
		oldSet.call(this, prop, value, current, success, error);
	}
};
