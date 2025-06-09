$(document)
	.ready( function() {
		var user = {
			firstname : "",
			lastname : "",
			nickname : "",
			tagline : "",
			role : "",
			friends : [],
			food: {}
		};

		var lookuplist = [ {
			label : "Abby",
			email : "abby@abby",
			value : "123",
			title : "Abby abby@abby"
		}, {
			label : "Andy",
			email : "andy@andy",
			value : "123",
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

		var foods = [ { text: "cereal", id : 1 },
		               { text: "eggs", id : 2 },
		               { text: "danish", id : 3 }
		              ];

		function renderLabel(item) {
			return item.label + "(" + item.email + ")";
		}

		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);


		var ll = gadgetui.objects.Constructor( gadgetui.input.LookupListInput, [
			$( "input[name='friends']" ),
			{
				emitEvents : false,
				datasource : lookuplist,
				model : gadgetui.model,
				menuItemRenderer : renderLabel
			}
		]);

		function logChanges(obj) {
			console.log(obj);
			//showModel();
		}

		$("input[name='resetLookupList']").on("click", function() {
			ll.reset();
		});
	});
