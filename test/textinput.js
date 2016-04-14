

		var user = { firstname : "", lastname: "" };

		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);

		new gadgetui.input.TextInput(
				document.querySelector( "input[name='firstname']" ),
				{
					emitEvents : false,
					enforceMaxWidth: true,
					activate : "mouseover"
				}
			);

		new gadgetui.input.TextInput(
				document.querySelector( "input[name='lastname']" ),
				{
					emitEvents : false,
					enforceMaxWidth: true,
					activate : "mouseover"
				}
			);