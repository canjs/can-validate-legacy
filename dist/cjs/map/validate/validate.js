/*can-validate-legacy@1.0.2#map/validate/validate*/
var $ = require('jquery');
var namespace = require('can-util/namespace');
var Map = require('can-map');
var each = require('can-util/js/each/each');
var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
var validate = require('../../can-validate.js');
var compute = require('can-compute');
var proto = Map.prototype;
var oldSet = proto.__set;
var ErrorsObj;
var defaultValidationOpts;
var config = {
    errorKeyName: 'errors',
    validateOptionCacheKey: 'validateOptions'
};
var resolveComputes = function (itemObj, opts) {
    var processedObj = {};
    each(opts, function (item, key) {
        var actualOpts = item;
        if (typeof item === 'function') {
            actualOpts = item(itemObj.value);
        }
        processedObj[key] = actualOpts;
    });
    return processedObj;
};
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
ErrorsObj = Map.extend({}, {
    hasErrors: function () {
        return !isEmptyObject(this.attr());
    }
});
defaultValidationOpts = {
    mustValidate: false,
    validateOnInit: false
};
var getValidateFromCache = function () {
    var validateCacheKey = '__' + config.validateOptionCacheKey;
    if (!this[validateCacheKey]) {
        this[validateCacheKey] = {};
    }
    return this[validateCacheKey];
};
var initProperty = function (key, value) {
    var validateOpts;
    var mapValidateCache;
    var propIniting;
    mapValidateCache = getValidateFromCache.call(this);
    if (mapValidateCache[key] && !isEmptyObject(mapValidateCache[key])) {
        validateOpts = mapValidateCache[key];
        propIniting = false;
    } else {
        validateOpts = $.extend({}, getPropDefineBehavior('validate', key, this.define));
        propIniting = true;
    }
    if (typeof validateOpts !== 'undefined') {
        if (propIniting) {
            validateOpts = $.extend({}, defaultValidationOpts, validateOpts, this._processValidateOpts({
                key: key,
                value: value
            }, validateOpts));
            mapValidateCache[key] = validateOpts;
        }
        return true;
    }
    return false;
};
var oldSetup = proto.setup;
var oldInit = proto.init;
proto.setup = function () {
    this._initValidate = true;
    oldSetup.apply(this, arguments);
};
proto.init = function () {
    this._initValidation();
    this._initValidate = false;
    if (oldInit) {
        oldInit.apply(this, arguments);
    }
};
$.extend(Map.prototype, {
    _initValidation: function () {
        var self = this;
        var validateCache = getValidateFromCache.call(this);
        each(this.define, function (props, key) {
            if (props.validate && !validateCache[key]) {
                initProperty.call(self, key, self[key]);
            }
        });
    },
    validate: function () {
        return this._validate();
    },
    _validate: function () {
        var validateOpts = getValidateFromCache.call(this);
        var processedOpts = {};
        var self = this;
        each(this.define, function (value, key) {
            if (value.validate) {
                processedOpts[key] = resolveComputes({
                    key: key,
                    value: self.attr(key)
                }, validateOpts[key]);
            }
        });
        var errors = validate.validate(this.serialize(), processedOpts);
        this.attr('errors', new ErrorsObj(errors));
        return isEmptyObject(errors);
    },
    _validateOne: function (item, opts) {
        var errors;
        var allowSet = true;
        errors = validate.once(item.value, $.extend({}, opts), item.key);
        if (errors && errors.length > 0) {
            if (!this.attr('errors')) {
                this.attr('errors', new ErrorsObj({}));
            }
            this.attr('errors').attr(item.key, errors);
            if (opts.mustValidate === true) {
                allowSet = false;
            }
        } else {
            if (this.attr('errors') && this.attr('errors').attr(item.key)) {
                this.attr('errors').removeAttr(item.key);
            }
        }
        return allowSet;
    },
    _processValidateOpts: function (itemObj, opts) {
        var processedObj = {};
        var computes = [];
        var self = this;
        each(opts, function (item, key) {
            processedObj[key] = item;
            if (typeof item === 'function') {
                var newCompute = compute($.proxy(item, self));
                computes.push({
                    key: key,
                    compute: newCompute
                });
                processedObj[key] = newCompute;
            }
        });
        each(computes, function (item) {
            item.compute.bind('change', function () {
                itemObj.value = self.attr(itemObj.key);
                self._validateOne(itemObj, processedObj);
            });
        });
        return processedObj;
    }
});
proto.__set = function (prop, value, current, success, error) {
    var allowSet = true;
    var checkValidate = initProperty.call(this, prop, value);
    var validateOpts = getValidateFromCache.call(this)[prop];
    var mapIniting = this._initValidate;
    if (checkValidate !== false) {
        validateOpts = resolveComputes({
            key: prop,
            value: value
        }, validateOpts);
        if (validateOpts && !mapIniting || validateOpts && mapIniting && validateOpts.validateOnInit) {
            allowSet = this._validateOne({
                key: prop,
                value: value
            }, validateOpts);
        }
    }
    if (allowSet) {
        oldSet.call(this, prop, value, current, success, error);
    }
};
//# sourceMappingURL=validate.js.map