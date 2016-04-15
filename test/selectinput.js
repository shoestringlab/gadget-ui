
var user = { role : "" };


// set the model first if we're using auto data-binding
gadgetui.model.set("user", user);

new gadgetui.input.SelectInput(
	 document.querySelector( "select[name='role']" ),
	 {
		emitEvents : false,
		model : gadgetui.model
	}
);
