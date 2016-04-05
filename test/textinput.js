$(document)
	.ready( function() {

		var user = { firstname : "", lastname: "" };

		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);

		new gadgetui.input.TextInput(
				$( "input" ),
				{
					emitEvents : false,
					enforceMaxWidth: true,
					activate : "mouseover"
				}
			);
	});