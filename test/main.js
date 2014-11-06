$( document ).ready( function(){

	var user = {
			firstname: "",
			lastname: "",
			tagline: "",
			role: ""
	};

	// set the model first if we're using auto data-binding
	gadgetui.model.set( "user", user );
	
	showModel();
	
	new gadgetui.input.TextInput( { config: { emitEvents: false, func : logChanges, model: gadgetui.model, activate: "click"} } );
	new gadgetui.input.SelectInput( { config: { emitEvents: false, func : logChanges, model: gadgetui.model} } );

	new gadgetui.display.CollapsiblePane( { selector: $( "#InputsDiv" ), config : { title: "Inputs", path : "/dist/" } } );
	new gadgetui.display.CollapsiblePane( { selector: $( "#modelDiv" ), config : { title: "Model", path : "/dist/", collapse: true } } );
	
	
	$( document )
		.on( "gadgetui-input-change", function(evt, obj){
			console.log( evt );
			console.log( obj );
		});

	function logChanges( obj ){
		console.log( obj );
	}

});