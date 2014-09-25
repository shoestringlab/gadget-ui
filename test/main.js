var contact = {};

$( document ).ready( function(){
	var gadgetuiinput = new gadgetui.input.Input( { config: { emitEvents: false, func : logChanges, model: gadgetui.model } } );
	//new GadgetUIInput( { config: { emitEvents: false, func : logChanges, model: gadgetui.model } } );
	$( document )
		.on( "gadgetUIInputChange", function(evt, obj){
			console.log( evt );
			console.log( obj );
		});

	var user = {
			firstname: "",
			lastname: ""
	};
	gadgetui.model.set( "user", user );
	gadgetui.model.bind( "user.firstname", document.getElementsByName('user.firstname')[0] );
	
	function logChanges( obj ){
		console.log( obj );
	}
});