import {dialog,constructor} from '/dist/gadget-ui.es.js';

var fp1 = constructor( dialog,
	[ null,
		{
			top: 200,
			left: 200,
			width:'500px',
			title : "Some Dialog",
			path : "/dist/",
			enableShrink : false,
			overflow: "hidden",
			backgroundColor:"#fff",
			message:"Do you want to confirm?",
			buttons: [
				{ label: 'Save', click: function(){ 
					console.log( 'Confirmed');
					fp1.close();
				}},
				{ label: 'Cancel', click: function(){ 
					console.log( 'Cancelled'); 
				fp1.close(); }}
			]
		}], true );

fp1.on( "closed", function( obj ){
	console.log( "closed" );
	console.log( obj );
	//document.querySelector("body").removeChild( fp1.selector.parentNode );
});
