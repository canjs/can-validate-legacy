/*can-validate-legacy@2.0.0#shims/validatejs*/
define([
    'require',
    'exports',
    'module',
    '../can-validate',
    'validate'
], function (require, exports, module) {
    'use strict';
    var validate = require('../can-validate');
    var validatejs = require('validate');
    var processOptions = function (opts) {
        if (typeof opts.required !== 'undefined') {
            opts.presence = opts.required;
            delete opts.required;
        }
        if (opts.hasOwnProperty('mustValidate')) {
            delete opts.mustValidate;
        }
        if (opts.hasOwnProperty('validateOnInit')) {
            delete opts.validateOnInit;
        }
        return opts;
    };
    var shim = {
        once: function (value, options, name) {
            var errors = [];
            var opts = [];
            var validationOpts = [];
            if (name) {
                opts[name] = value;
                validationOpts[name] = processOptions(options);
                errors = validatejs(opts, validationOpts);
                if (errors) {
                    errors = errors[name];
                }
            } else {
                errors = validatejs.single(value, processOptions(options));
            }
            return errors;
        },
        isValid: function (value, options) {
            var errors = validatejs.single(value, processOptions(options)) || [];
            return errors.length === 0;
        },
        validate: function (values, options) {
            var valueKeys = Object.keys(values);
            var processedOpts = {};
            for (var i = 0; i < valueKeys.length; i++) {
                var prop = valueKeys[i];
                if (options[prop]) {
                    processedOpts[prop] = processOptions(options[prop]);
                }
            }
            return validatejs(values, processedOpts);
        }
    };
    validate.register('validatejs', shim);
});
//# sourceMappingURL=validatejs.js.map