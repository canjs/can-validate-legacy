- Add validate to define
	define: {
		name: {
			validate: {
				length: {
					minimum: 6
				}
			}
		}
	}
- errors on a Map
	error.name => [

	]

{{error.name}}<bit-popover title="{{error.name}}"></bit-popover>{{/error.name}}

bind('error', function(){

})

bind('error.name', function(){

})


can.validate translates define.validate format to a library

validate.js
validate/
	validate.js
	parsely.js
	w/e.js


// when validate is true, use type
validate: true,
type: 'string' //returns error if not string and if empty.



//api
validate: [
	'required', // {required: 'MESSAGE'}
	{ length: {}},
	{range:{}},
	message: '',
	useDefine: true, //type, value, true (uses both type and value)
	type: 'number' //string, date, number, boolean
	mask: '' //regex or shortcut string (email, money)
]

// use case, email address
validate: [
	{required: 'We need yo email address, bro!'},
	{mask: 'email', message: 'Come one, bro, do you even email?'}
]
//or...
validate: [
	'required',
	{mask: 'email'}
]
