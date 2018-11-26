
		var user = {
			firstname : "",
			lastname : "",
			friends : []
		};

		var lookuplist = [ {
			label : "Abby",
			email : "abby@abby",
			value : "133",
			title : "Abby abby@abby"
		}, {
			label : "Andy",
			email : "andy@andy",
			value : "153",
			title : "Andy andy@andy"
		}, {
			label : "Anne",
			email : "anne@anne",
			value : "123",
			title : "Anne anne@anne"
		},{
			label : "Bobby",
			email : "bobby@bobby",
			value : "456"
		}, {
			label : "Cara",
			email : "cara@cara",
			value : "789"
		}, {
			label : "Dan",
			email : "dan@dan",
			value : "102"
		} ];

		function renderLabel(item) {
			return item.label + "(" + item.email + ")";
		}

		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);

		var ll = gadgetui.objects.Constructor( gadgetui.input.LookupListInput,
			[ document.querySelector( "input[name='friends']" ),
			{
				emitEvents : false,
				datasource : lookuplist,
				model : gadgetui.model,
				labelRenderer : renderLabel,
				width: 500
			}
		]
		);

		function logChanges(obj) {
			console.log(obj);
			showModel();
		}

		var reset = document.querySelector("input[name='resetLookupList']");
		reset.addEventListener("click", function() {
			ll.reset();
		});
