import can from 'can';
import 'can/map/define/define';

//add methods to can
var Validate = can.validate = can.Construct.extend({
	_validatorId: '',
	_validators: {},
	validator: function () {
			return this._validators[this._validatorId];
	},

	/*
	 * Register a validation library
	 */
	register: function (id, validator) {
		this._validatorId = id;
		this._validators[id] = validator;
	},

	/*
	* Checks if data is valid or not
	*/
	isValid: function () {
		//!steal-remove-start
		if (!this._validatorId ) {
			can.dev.warn("A validator library is required for can.validate to work properly.");
		}
		//!steal-remove-end
		return this.validator().isValid.apply(this, arguments);
	},

	/*
	 * validates one set of data
	 */
	once: function (value, options) {
		//!steal-remove-start
		if (!this._validatorId ) {
			can.dev.warn("A validator library is required for can.validate to work properly.");
		}
		//!steal-remove-end
		return this.validator().once.apply(this, arguments);
	},

	/*
	* validates multiples
	*/
	validate: function (values, options) {
		//!steal-remove-start
		if (!this._validatorId ) {
			can.dev.warn("A validator library is required for can.validate to work properly.");
		}
		if ( typeof values !== 'object' ) {
			can.dev.warn("Attempting to pass single value to validate, use can.validator.once instead.");
		}
		//!steal-remove-end
		return this.validator().validate.apply(this, arguments);

	}
},{});

export default can;
