var stealTools = require("steal-tools");

stealTools.export({
	system: {
		config: "package.json!npm",
		main: "build-validate"
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
