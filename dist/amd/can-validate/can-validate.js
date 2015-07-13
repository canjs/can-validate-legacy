/*can-validate/can-validate*/
define([
    'exports',
    'module',
    'can'
], function (exports, module, _can) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    var can = _interopRequire(_can);
    var Validate = can.validate = can.Construct.extend({
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
                return this.validator().validate.apply(this, arguments);
            }
        }, {});
    module.exports = can;
});
//# sourceMappingURL=can-validate.js.map