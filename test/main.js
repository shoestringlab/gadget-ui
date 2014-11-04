$( document ).ready( function(){

	var user = {
			firstname: "",
			lastname: "",
			tagline: "",
			role: ""
	};

	// set the model first if we're using auto data-binding
	gadgetui.model.set( "user", user );
	
	new gadgetui.input.TextInput( { config: { emitEvents: false, func : logChanges, model: gadgetui.model, activate: "click"} } );
	new gadgetui.input.SelectInput( { config: { emitEvents: false, func : logChanges, model: gadgetui.model} } );

	$( document )
		.on( "gadgetui-input-change", function(evt, obj){
			console.log( evt );
			console.log( obj );
		});

	function logChanges( obj ){
		console.log( obj );
	}

});