module.exports = {
    'can-validate': {
		'can-validate': require('./can-validate/can-validate')
	},
	map: {
		validate: require('./map/validate/validate')
	},
	shims: {
		'validatejs.shim': require('./shims/validatejs.shim')
	}
}
