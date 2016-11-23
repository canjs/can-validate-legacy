var canValidate = require("./can-validate");
var validate = require("./can-validate/map/validate/");
var validateJsShim = require("./can-validate/shims/validatejs.shim");

module.exports = {
	"can-validate": canValidate,
	"map": {
		validate: validate
	},
	"shims": {
		"validatejs.shim": validateJsShim
	}
};
