/*can-validate/map/validate/validate*/
define([
    'exports',
    'can'
], function (exports, _can) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    var can = _interopRequire(_can);
    var proto = can.Map.prototype, oldSet = proto.__set;
    var getPropDefineBehavior = function (behavior, attr, define) {
        var prop, defaultProp;
        if (define) {
            prop = define[attr];
            defaultProp = define['*'];
            if (prop && prop[behavior] !== undefined) {
                return prop[behavior];
            } else if (defaultProp && defaultProp[behavior] !== undefined) {
                return defaultProp[behavior];
            }
        }
    };
    proto.__set = function (prop, value, current, success, error) {
        var allowSet = true, validateOpts = getPropDefineBehavior('validate', prop, this.define), errors;
        if (validateOpts) {
            errors = can.validate.once(value, validateOpts, prop);
            if (errors && errors.length > 0) {
                if (!this.attr('errors')) {
                    this.attr('errors', {});
                }
                this.attr('errors').attr(prop, errors);
                if (validateOpts.precheck && validateOpts.precheck === true) {
                    allowSet = false;
                }
            } else {
                if (this.attr('errors') && this.attr('errors').attr(prop)) {
                    this.attr('errors').removeAttr(prop);
                }
            }
        }
        if (allowSet) {
            oldSet.call(this, prop, value, current, success, error);
        }
    };
});
//# sourceMappingURL=validate.js.map