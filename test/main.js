$(document)
	.ready( function() {
		var user = {
			firstname : "Robert",
			lastname : "",
			nickname : "Fitzgerald Monster",
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

		function renderLabel(item) {
			return item.label + "(" + item.email + ")";
		}

		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);

		//showModel();

		var textinputs = $( "input[gadgetui-textinput='true']" );
		$.each( textinputs, function( ix, input ){
			new gadgetui.input.TextInput(
				$( input ),
				{
					emitEvents : false,
					func : logChanges,
					enforceMaxWidth: true,
					activate : "mouseover"
				}
			);			
		});
		
		new gadgetui.input.SelectInput(
			 $( "select[name='role']" ),
			 {
				emitEvents : false,
				func : logChanges,
				model : gadgetui.model
			}
		);
		var ll = new gadgetui.input.LookupListInput(
			$( "input[name='friends']" ),
			{
				emitEvents : false,
				datasource : lookuplist,
				model : gadgetui.model,
				menuItemRenderer : renderLabel
			}
		);

		new gadgetui.display.CollapsiblePane(
				$("#InputsDiv"),
				{
					title : "Inputs",
					path : "/dist/"
				});
		new gadgetui.display.CollapsiblePane(
			$("#NarrowDiv"),
			{
				title : "Nickname",
				path : "/dist/"
			}
		);
		new gadgetui.display.CollapsiblePane(
			$("#modelDiv"),
			{
				title : "Model",
				path : "/dist/",
				collapse : true
			}
		);
		var fp = new gadgetui.display.FloatingPane(
			$("#debugDiv"),
			{
				title : "A",
				path : "/dist/",
				opacity : .5,
				position : {
					my : "right top",
					at : "right top",
					of : window
				}
			}
		);

		new gadgetui.display.Bubble( $( "input[name='friends']" ).parent(),
			"Start typing to add friends - Abby, Andy, Anne, Bobby, Cara, Dan are the names in the list.",
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