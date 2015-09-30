$(document)
	.ready( function() {
		var user = {
			firstname : "Robert",
			lastname : "",
			nickname : "Fitzy",
			tagline : "",
			role : "",
			friends : []
		};

		var lookuplist = [ {
			label : "Abby",
			email : "abby@abby",
			value : "123",
			title : "Abby abby@abby"
		}, {
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

		//showModel();

		new gadgetui.input.TextInput({
			config : {
				emitEvents : false,
				func : logChanges,
				enforceMaxWidth: true,
				activate : "mouseover"
			}
		});
		new gadgetui.input.SelectInput({
			config : {
				emitEvents : false,
				func : logChanges,
				model : gadgetui.model
			}
		});
		var ll = new gadgetui.input.LookupListInput({
			config : {
				emitEvents : false,
				lookupList : lookuplist,
				model : gadgetui.model,
				menuItemRenderer : renderLabel
			}
		});

		new gadgetui.display.CollapsiblePane({
			selector : $("#InputsDiv"),
			config : {
				title : "Inputs",
				path : "/dist/"
			}
		});
		new gadgetui.display.CollapsiblePane({
			selector : $("#NarrowDiv"),
			config : {
				title : "Nickname",
				path : "/dist/"
			}
		});
		new gadgetui.display.CollapsiblePane({
			selector : $("#modelDiv"),
			config : {
				title : "Model",
				path : "/dist/",
				collapse : true
			}
		});
		var fp = new gadgetui.display.FloatingPane({
			selector : $("#debugDiv"),
			config : {
				title : "A",
				path : "/dist/",
				opacity : .5,
				position : {
					my : "right top",
					at : "right top",
					of : window
				}
			}
		});

		new gadgetui.display.Bubble($(
			"input[name='friends']").parent().parent(),
			"This is a text bubble",
			{
				arrowPosition : "left bottom",
				position : "top right",
				arrowDirection : "middle",
				borderWidth : 10,
				height: 150,
				padding: 15,
				arrowSize: 30,
				borderRadius: 15,
				closable : true
			});

		
		gadgetui.model.bind( "user.firstname", $( "span[name='firstname']" ) );
		
		$(document).on("gadgetui-input-change", function(evt, obj) {
			console.log(evt);
			console.log(obj);
		});

		function logChanges(obj) {
			console.log(obj);
			showModel();
		}

		$("input[name='resetLookupList']").on("click", function() {
			ll.reset();
		});
	});