/*can-validate-legacy@1.1.0#shims/validatejs*/
var validate = require('../can-validate.js');
var validatejs = require('validate.js');
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
//# sourceMappingURL=validatejs.js.map