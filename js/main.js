var contact = {};

$( document ).ready( function(){
	
	
	
	new SmartInput( { config: { emitEvents: false, func : logChanges } } );
	
	$( document )
		.on( "smartInputChange", function(evt, obj){
			console.log( evt );
			console.log( obj );
		});

	function logChanges( obj ){
		console.log( obj );
	}
});