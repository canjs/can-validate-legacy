/*can-validate.build*/
define(function (require, exports, module) {
    module.exports = {
        'can-validate': { 'can-validate': require('./can-validate/can-validate') },
        map: { validate: require('./can-validate/map/validate/validate') },
        shims: { 'validatejs.shim': require('./can-validate/shims/validatejs.shim') }
    };
});
//# sourceMappingURL=can-validate.build.js.map