/*can-validate-legacy@1.0.2#can-validate*/
var dev = require('can-util/js/dev/dev');
var namespace = require('can-util/namespace');
var Validate = {
    _validatorId: '',
    _validators: {},
    validator: function () {
        return this._validators[this._validatorId];
    },
    register: function (id, validator) {
        this._validatorId = id;
        this._validators[id] = validator;
    },
    isValid: function () {
        return this.validator().isValid.apply(this, arguments);
    },
    once: function () {
        return this.validator().once.apply(this, arguments);
    },
    validate: function () {
        var validateArgs = arguments;
        return this.validator().validate.apply(this, validateArgs);
    }
};
namespace.validate = Validate;
module.exports = Validate;
//# sourceMappingURL=can-validate.js.map