$(document)
	.ready( function() {

new gadgetui.display.Bubble( $( "select" ),
	"Select Food",
	{
		arrowPosition : "left bottom",
		position : "top right",
		arrowDirection : "middle",
		font: ".7em 'Arial'",
		borderWidth : 10,
		height: 150,
		padding: 15,
		arrowSize: 30,
		borderRadius: 15,
		closable : true
	});
});