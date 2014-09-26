$( document ).ready( function(){

/*		var user = {
			firstname: "",
			lastname: "",
			disabled: false
	};	*/
	
	//var first = new gadgetui.input.Input( { el : $( "input[name='firstname']" ), object : user, config: { emitEvents: false, func : logChanges} } );

	var user = {
			firstname: "",
			lastname: ""
	};
	// set the model first if we're using auto data-binding
	gadgetui.model.set( "user", user );
	
	new gadgetui.input.Input( { config: { emitEvents: false, func : logChanges, model: gadgetui.model} } );
	//new GadgetUIInput( { config: { emitEvents: false, func : logChanges, model: gadgetui.model } } );
	$( document )
		.on( "gadget-ui-input-change", function(evt, obj){
			console.log( evt );
			console.log( obj );
		});

	function logChanges( obj ){
		console.log( obj );
	}

	//gadgetui.model.bind( "user.firstname", $( "input[name='firstname']" ) );
	//gadgetui.model.bind( "user.lastname", $( "input[name='lastname']" ) );
	
});