/* jshint asi: false */
steal("can/util", "can-validate/map/validate", "can-validate/shims/validatejs.shim", "can/test", "steal-qunit", function (can) {

	var ValidatedMap = can.Map.extend({
		define: {
			myNumber: {
				value: 100,
				validate: {
					presence: true
				}
			}
		}
	});

	var test = new ValidatedMap();

	test.attr('myNumber', null);
});
