/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod){
		if(!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, "default": true };
		for(var p in mod) {
			if(!esProps[p]) return false;
		}
		return true;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			if(useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-validate-legacy@1.0.2#can-validate*/
define('can-validate-legacy', function (require, exports, module) {
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
});
/*can-validate-legacy@1.0.2#map/validate/validate*/
define('can-validate-legacy/map/validate/validate', function (require, exports, module) {
    var $ = require('jquery');
    var namespace = require('can-util/namespace');
    var Map = require('can-map');
    var each = require('can-util/js/each/each');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var validate = require('can-validate-legacy');
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
});
/*can-validate-legacy@1.0.2#shims/validatejs*/
define('can-validate-legacy/shims/validatejs', function (require, exports, module) {
    var validate = require('can-validate-legacy');
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
});
/*can-validate-build*/
define('can-validate-legacy/can-validate-build', function (require, exports, module) {
    var canValidate = require('can-validate-legacy');
    var validate = require('can-validate-legacy/map/validate/validate');
    var validateJsShim = require('can-validate-legacy/shims/validatejs');
    module.exports = {
        'can-validate': canValidate,
        'map': { validate: validate },
        'shims': { 'validatejs.shim': validateJsShim }
    };
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();
//# sourceMappingURL=can-validate-build.js.map