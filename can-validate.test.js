
//TODO: We can't use two different shims at the same time. But, this first test
// uses a custom shim since we are simply testing the core script and not the shims.
// Including it with the rest of the tests causes the shim's to override each other
// Need to find a workaround for this.
//import 'can-validate/validate.test';
import 'can-validate/map/validate/validate.test';
import 'can-validate/shims/validatejs.test';
//import 'can-validate/shims/validations.test';
//import 'can-validate/validations/validations.test';
