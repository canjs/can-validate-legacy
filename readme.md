@page can-validate-plugin Can-Validate
@link http://canjs.github.io/can-validate/ Home

# Can Validate

> [Can-validate home](http://canjs.github.io/can-validate/)

A plugin for CanJS that wraps any validation library to `can.validate`. **Can.Validate doesn't do any validation of its own** but instead provides some abstraction to your library of choice. The chosen library is registered with can-validate using a shim.

The plugin is made of three parts:

- Can-Validate core plugin
- A validation library shim
- Validation library

Further more, the package also includes a `can.Map` plugin that works with the `can.Map.define` called `can.Map.validate`.

## can-validate plugin

Adds the `validate` property to the `can` object. The `validate` object adds some useful methods for validation that simply forward arguments to the registered validation library.

To add `can-validate` to your module, simply add the following lines:

```javascript
import can from 'can';
// can.validate is now available
import 'can-validate/can-validate';
// Substitute with your library of choice
import 'validate.js';
// If not using ValidateJS, then you'll need a custom shim
import 'can-validate/shims/validatejs.shim';
```

From this point you could do the following:

```javascript
var myVal = '';
var validateOpts = {myVal: {required: true}};

// `errors` will have an error because the value is empty
//  and required is true.
var errors = can.validate.once(myVal, validateOpts);
```

### Shims and Validation Libraries

A shim registers a validation library with can-validate. It also processes properties and values into a structure more acceptable by the validation library. This allows consuming libraries to switch validation libraries simply by switching out their shim - any new behavior or legacy behavior can be baked into the new shim.

Don't have a library of choice? Can.Validate ships with a shim for CanJS Validations and [ValidateJS](http://validatejs.org/).

## can.Map.validate plugin

```javascript
import can from 'can';
import 'can/map/define/define';
// can.validate is now available
import 'can-validate/can-validate';
// Substitute with your library of choice
import 'validate.js';
// If not using ValidateJS, then you'll need a custom shim
import 'can-validate/shims/validatejs.shim';

// Augments the can.Map setter
import 'can-validate/map/validate';
```

All can.Map's created in the module will now have an augmented setter that checks properties as they are set. This allows the following...

```javascript
var ViewModel = can.Map.extend({
  define: {
    name: {
      value: '',
      validate: {
        required: true
      }
    }
  }
});
var viewModel = new ViewModel({});
viewModel.validate();
// `errors` will have an error because the `name` value is empty
//  and required is true.
viewModel.attr('errors');
viewModel.attr('name', 'Juan');
viewModel.attr('errors'); // => Errors is now empty!
```

## Documentation

The docs cover the following topics:

- can.validate core
- can.Map.validate plugin
- The CanJS Validations library
- Available Shims
- Creating your own shim


Check out the demos as well:

- [Can.Validate](http://canjs.github.io/can-validate/can-validate.html)
- [Can.Map.Validate](http://canjs.github.io/can-validate/can.Map.validate.html)

### Change Log

A change log is maintained [here](changelog.html).

### Contributing

Want to contribute? [Read the contributing](contributing.html) guide to start.
