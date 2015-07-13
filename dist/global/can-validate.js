/*[global-shim-start]*/
(function (exports, global){
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
		modules[moduleName] = module && module.exports ? module.exports : result;
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
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({},window)
/*can-validate/can-validate*/
define('can-validate/can-validate/can-validate', [
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
/*can-validate/map/validate/validate*/
define('can-validate/can-validate/map/validate/validate', [
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
/*can-validate/shims/validatejs.shim*/
define('can-validate/can-validate/shims/validatejs.shim', [
    'exports',
    'can',
    'validate.js'
], function (exports, _can, _validateJs) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    var can = _interopRequire(_can);
    var validatejs = _interopRequire(_validateJs);
    function processOptions(opts) {
        if (opts.required) {
            opts.presence = true;
            if (typeof opts.required === 'object') {
                opts.presence = opts.required;
            }
            delete opts.required;
        }
        return opts;
    }
    ;
    var Shim = can.Construct.extend({
            once: function (value, options, name) {
                var errors = validatejs.single(value, processOptions(options));
                if (errors && name) {
                    for (var i = 0; i < errors.length; i++) {
                        errors[i] = can.capitalize(can.camelize(name)) + ' ' + errors[i];
                    }
                }
                return errors;
            },
            isValid: function (value, options) {
                var errors = validatejs.single(value, processOptions(options)) || [];
                return errors.length === 0;
            },
            validate: function (values, options) {
                var valueKeys = Object.keys(values), processedOpts = {};
                for (var i = 0; i < valueKeys.length; i++) {
                    if (options[i]) {
                        processedOpts[i] = processOptions(options[i]);
                    }
                }
                return validatejs(values, processedOpts);
            }
        });
    can.validate.register('validatejs', new Shim());
});
/*can-validate.build*/
define('can-validate/can-validate.build', function (require, exports, module) {
    module.exports = {
        'can-validate': { 'can-validate': require('can-validate/can-validate/can-validate') },
        map: { validate: require('can-validate/can-validate/map/validate/validate') },
        shims: { 'validatejs.shim': require('can-validate/can-validate/shims/validatejs.shim') }
    };
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
//# sourceMappingURL=can-validate.build.js.map