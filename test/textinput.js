

var user = { firstname : "", lastname: "" };

// set the model first if we're using auto data-binding
gadgetui.model.set("user", user);

new gadgetui.input.TextInput(
		document.querySelector( "input[name='firstname']" ),
		{
			emitEvents : true,
			enforceMaxWidth: true,
			activate : "mouseover"
		}
	);

new gadgetui.input.TextInput(
		document.querySelector( "input[name='lastname']" ),
		{
			emitEvents : true,
			enforceMaxWidth: true,
			activate : "mouseover"
		}
	);


document.querySelector( "input[name='firstname']" )
	.addEventListener( "gadgetui-input-change", function( event ){
		console.log( event.detail );
	});

document.querySelector( "input[name='lastname']" )
.addEventListener( "gadgetui-input-change", function( event ){
	console.log( event.detail );
});