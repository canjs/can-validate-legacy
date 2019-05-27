/*[process-shim]*/
(function(global, env) {
	// jshint ignore:line
	if (typeof process === "undefined") {
		global.process = {
			argv: [],
			cwd: function() {
				return "";
			},
			browser: true,
			env: {
				NODE_ENV: env || "development"
			},
			version: "",
			platform:
				global.navigator &&
				global.navigator.userAgent &&
				/Windows/.test(global.navigator.userAgent)
					? "win"
					: ""
		};
	}
})(
	typeof self == "object" && self.Object == Object
		? self
		: typeof process === "object" &&
		  Object.prototype.toString.call(process) === "[object process]"
			? global
			: window,
	"development"
);

/*[global-shim-start]*/
(function(exports, global, doEval) {
	// jshint ignore:line
	var origDefine = global.define;

	var get = function(name) {
		var parts = name.split("."),
			cur = global,
			i;
		for (i = 0; i < parts.length; i++) {
			if (!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val) {
		var parts = name.split("."),
			cur = global,
			i,
			part,
			next;
		for (i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if (!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod) {
		if (!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, default: true };
		for (var p in mod) {
			if (!esProps[p]) return false;
		}
		return true;
	};

	var hasCjsDependencies = function(deps) {
		return (
			deps[0] === "require" && deps[1] === "exports" && deps[2] === "module"
		);
	};

	var modules =
		(global.define && global.define.modules) ||
		(global._define && global._define.modules) ||
		{};
	var ourDefine = (global.define = function(moduleName, deps, callback) {
		var module;
		if (typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for (i = 0; i < deps.length; i++) {
			args.push(
				exports[deps[i]]
					? get(exports[deps[i]])
					: modules[deps[i]] || get(deps[i])
			);
		}
		// CJS has no dependencies but 3 callback arguments
		if (hasCjsDependencies(deps) || (!deps.length && callback.length)) {
			module = { exports: {} };
			args[0] = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args[1] = module.exports;
			args[2] = module;
		} else if (!args[0] && deps[0] === "exports") {
			// Babel uses the exports and module object.
			module = { exports: {} };
			args[0] = module.exports;
			if (deps[1] === "module") {
				args[1] = module;
			}
		} else if (!args[0] && deps[0] === "module") {
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
		if (globalExport && !get(globalExport)) {
			if (useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	});
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function() {
		// shim for @@global-helpers
		var noop = function() {};
		return {
			get: function() {
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load) {
				doEval(__load.source, global);
			}
		};
	});
})(
	{},
	typeof self == "object" && self.Object == Object
		? self
		: typeof process === "object" &&
		  Object.prototype.toString.call(process) === "[object process]"
			? global
			: window,
	function(__$source__, __$global__) {
		// jshint ignore:line
		eval("(function() { " + __$source__ + " \n }).call(__$global__);");
	}
);

/*can-validate-legacy@2.0.0#can-validate*/
define('can-validate-legacy', [
    'require',
    'exports',
    'module',
    'can-log/dev/dev',
    'can-namespace'
], function (require, exports, module) {
    'use strict';
    var dev = require('can-log/dev/dev');
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
/*can-validate-legacy@2.0.0#map/validate/validate*/
define('can-validate-legacy/map/validate/validate', [
    'require',
    'exports',
    'module',
    'can-assign',
    'can-map',
    'can-reflect',
    'can-validate-legacy',
    'can-compute'
], function (require, exports, module) {
    'use strict';
    var assign = require('can-assign');
    var Map = require('can-map');
    var canReflect = require('can-reflect');
    var validate = require('can-validate-legacy');
    var compute = require('can-compute');
    var deepAssign = function () {
        var objects = [].slice.call(arguments);
        var out = {};
        for (var i = 0; i < objects.length; i++) {
            assign(out, objects[i]);
        }
        return out;
    };
    var isEmptyObject = function (value) {
        return canReflect.size(value) === 0;
    };
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
        canReflect.eachKey(opts, function (item, key) {
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
            validateOpts = assign({}, getPropDefineBehavior('validate', key, this.define));
            propIniting = true;
        }
        if (typeof validateOpts !== 'undefined') {
            if (propIniting) {
                validateOpts = deepAssign(defaultValidationOpts, validateOpts, this._processValidateOpts({
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
    assign(Map.prototype, {
        _initValidation: function () {
            var self = this;
            var validateCache = getValidateFromCache.call(this);
            canReflect.eachKey(this.define, function (props, key) {
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
            canReflect.eachKey(this.define, function (value, key) {
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
            errors = validate.once(item.value, assign({}, opts), item.key);
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
            canReflect.eachKey(opts, function (item, key) {
                processedObj[key] = item;
                if (typeof item === 'function') {
                    var newCompute = compute(item.bind(self));
                    computes.push({
                        key: key,
                        compute: newCompute
                    });
                    processedObj[key] = newCompute;
                }
            });
            canReflect.each(computes, function (item) {
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
/*can-validate-legacy@2.0.0#shims/validatejs*/
define('can-validate-legacy/shims/validatejs', [
    'require',
    'exports',
    'module',
    'can-validate-legacy',
    'validate.js'
], function (require, exports, module) {
    'use strict';
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
define('can-validate-legacy/can-validate-build', [
    'require',
    'exports',
    'module',
    'can-validate-legacy',
    'can-validate-legacy/map/validate/validate',
    'can-validate-legacy/shims/validatejs'
], function (require, exports, module) {
    'use strict';
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
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window);
//# sourceMappingURL=can-validate-build.js.map