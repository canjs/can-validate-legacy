/* jshint asi: false */
var namespace = require("can-util/namespace");
var Map = require("can-map");
var isEmptyObject = require("can-util/js/is-empty-object/is-empty-object");
var QUnit = require("steal-qunit");

require("can-map-define");
require("can-validate-legacy");
require("can-validate-legacy/map/validate/");
require("can-validate-legacy/shims/validatejs");

var validatedMap;
var secondaryMap;

var ValidatedMap = Map.extend({
	define: {
		myNumber: {
			value: 100,
			validate: {
				required: true
			}
		},
		computedProp: {
			validate: {
				required: function () {
					return this.attr("isRequired");
				}
			},
			value: ""
		},
		isRequired: {
			value: false,
			type: "boolean"
		}
	}
});

QUnit.module("Map Validate Plugin");

QUnit.test("when validateOnInit is not set, it should not run validation",function(){
	validatedMap = new ValidatedMap();
	QUnit.ok(isEmptyObject(validatedMap.errors));
});

QUnit.test("validations run when value is set",function(){
	validatedMap = new ValidatedMap();
	validatedMap.attr("myNumber", "");
	QUnit.equal(validatedMap.errors.myNumber.length, 1);
});

// #27 - Validate method does not resolve computes
QUnit.test("when validate method is called, resolves computes before calling Validate method",function(){
	validatedMap = new ValidatedMap({
		isRequired: true,
		myNumber: 0
	});
	var success = false;
	try {
		validatedMap.validate();
		success = true;
	} catch (err) {
		success = err;
	}
	QUnit.ok(success);
});

/**
 * #26 When a map constructor is init'd multiple times, the validate plugin
 * would create computes for the props but in the way it processed the
 * props, it overwrote the prototype of the map instead of creating a unique
 * version for each map instance.
 */
QUnit.test("when creating multiple instances of the same map, each instance is discrete",function(){
	// Doing this should not affect our control. If bug exists, it will
	// affect all instances
	validatedMap = new ValidatedMap();
	validatedMap.attr("isRequired", true);

	// this is our control, we wont change any values on this
	secondaryMap = new ValidatedMap();

	secondaryMap.attr("computedProp", "");
	QUnit.equal(isEmptyObject(secondaryMap.attr("errors")), true, 'control map validates successfully');

	// other map validates, sets error
	validatedMap.attr("computedProp", "");
	QUnit.equal(validatedMap.attr("computedProp"), "");
	QUnit.ok(typeof validatedMap.attr("errors.computedProp") !== "undefined", 'other map validates, sets error');
});

var ShimValidatedMap = Map.extend({
	define: {
		myNumber: {
			value: "test",
			validate: {
				required: true,
				numericality: true,
				validateOnInit: true
			}
		},
		myString: {
			value: "12345",
			validate: {
				required: true,
				length: 2
			}
		}
	}
});

QUnit.module("Validate.js Shim", {
	setup: function(){
		validatedMap = new ShimValidatedMap({});
	}
});

QUnit.test("validates on init by default",function(){
	QUnit.equal(validatedMap.attr('errors').myNumber.length, 1);
});

QUnit.test("validates on init by default",function(){
	QUnit.equal(validatedMap.errors.myNumber.length, 1);
});

QUnit.test("does not validate on init, when validate on init is false",function(){
	QUnit.equal(validatedMap.errors.myString, undefined);
});

QUnit.test("runs validation on value",function(){
	validatedMap.attr("myString", "");
	QUnit.equal(validatedMap.errors.myString.length, 1);
});
