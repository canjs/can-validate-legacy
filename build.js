var stealTools = require("steal-tools");

stealTools.export({
	system: {
		config: "package.json!npm",
		main: "can-validate/can-validate"
	},
	options: {
		sourceMaps: true
	},
	outputs: {
		"+cjs": {},
		"+amd": {},
		"+global-js": {}
	}
});
