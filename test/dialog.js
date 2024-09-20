import {dialog,constructor} from '/dist/gadget-ui.es.js';

var fp1 = constructor( dialog,
	[ document.querySelector("#dlg1"),
		{
			top: 200,
			left: 200,
			title : "Some Dialog",
			path : "/dist/",
			enableShrink : false,
			overflow: "hidden",
			buttons: [
				{ label: 'Save', click: function(){ console.log( 'Saved')}},
				{ label: 'Cancel', click: function(){ 
					console.log( 'Cancelled'); 
				fp1.close(); }}
			]
		}], true );

fp1.on( "closed", function( obj ){
	console.log( "closed" );
	console.log( obj );
});
