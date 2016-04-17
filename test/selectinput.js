
var user = { role : "" };


// set the model first if we're using auto data-binding
gadgetui.model.set("user", user);

new gadgetui.input.SelectInput(
	 document.querySelector( "select[name='role']" ),
	 {
		emitEvents : true,
		model : gadgetui.model
	}
);
document.querySelector( "select[name='role']" )
	.addEventListener( "gadgetui-input-change", function( event ){
		console.log( event.detail );
	});