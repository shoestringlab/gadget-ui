$(document)
	.ready( function() {

		var user = { role : "" };


		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);


		gadgetui.objects.Constructor( gadgetui.input.SelectInput,[
			 $( "select[name='role']" ),
			 {
				emitEvents : false,
				model : gadgetui.model
			}
		]);

	});
