/*can-validate-legacy@1.4.0#can-validate*/
define([
    'require',
    'exports',
    'module',
    'can-log/dev',
    'can-namespace'
], function (require, exports, module) {
    'use strict';
    var dev = require('can-log/dev');
    var namespace = require('can-namespace');
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
});
//# sourceMappingURL=can-validate.js.map