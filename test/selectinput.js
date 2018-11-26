
var user = { name:"John Smith", role : "" };
var user2 = { name: "Jack Smith", role : "" };
var user3 = { name: "Jonathan Smith", role : "" };
var roles = [
	{ id: 0, text: "choose ..." },
	{	id: 1, text: "friend" },
	{	id: 2, text: "sibling" },
	{	id: 3, text: "co-worker" },
	{	id: 4, text: "president" }
];

// set the model first if we're using auto data-binding
gadgetui.model.set("user", user);
gadgetui.model.set("user2", user2);
gadgetui.model.set("user3", user3);
gadgetui.model.set( "roles", roles );

gadgetui.objects.Constructor( gadgetui.input.SelectInput, [
	 document.querySelector( "select[name='role']" ),
	 {
		emitEvents : true,
		model : gadgetui.model
	}
]);

gadgetui.objects.Constructor( gadgetui.input.SelectInput, [
	 document.querySelector( "select[name='role2']" ),
	 {
		emitEvents : false,
		model : gadgetui.model
	}
]);

gadgetui.objects.Constructor( gadgetui.input.SelectInput, [
	 document.querySelector( "select[name='role3']" ),
	 {
		emitEvents : false,
		model : gadgetui.model,
		dataProvider: { data: roles }
	}
]);

document.querySelector( "select[name='role']" )
	.addEventListener( "gadgetui-input-change", function( event ){
		console.log( event.detail );
	});
