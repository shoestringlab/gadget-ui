import {gadgetui} from '/dist/gadget-ui.es.js';


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

		//showModel();

		var textinputs = document.querySelectorAll( "input[gadgetui-textinput='true']" );
		Array.prototype.forEach.call( textinputs, function( input, ix ){
			gadgetui.objects.Constructor( gadgetui.input.TextInput,[
				input,
				{
					emitEvents : false,
					func : logChanges,
					enforceMaxWidth: true,
					activate : "mouseover"
				}
			]);
		});

		gadgetui.objects.Constructor( gadgetui.input.ComboBox,[ document.querySelector( "select[name='food']" ),
			 {
				id: 2,
				emitEvents: true,
				borderWidth: 1,
				arrowIcon: '/dist/img/arrow.png',
				save : function( text, resolve, reject ){
					console.log( "saving new value" );
					var newId = foods.length + 1;
					foods.push( { text : text, id : newId } );
					resolve( newId );
				},
				dataProvider : {
					// you can pre-populate 'data' or the refresh() function will be called when you instantiate the ComboBox
					//data : undefined,
					refresh : function( dataProvider, resolve, reject ){
						dataProvider.data = foods;
						resolve();
					}
				}
			}
		]);

		var foodEle = document.querySelector( "select[name='food']" );

		 	foodEle.addEventListener( "gadgetui-combobox-save", function( event, o ){
		 		console.log( "save: " + o );
		 	} );

		 	foodEle.addEventListener( "gadgetui-combobox-change", function( event, o ){
		 		console.log( "change:" + o );
		 	} );

		gadgetui.objects.Constructor( gadgetui.input.SelectInput,[
			document.querySelector( "select[name='role']" ),
			 {
				emitEvents : false,
				func : logChanges,
				model : gadgetui.model
			}
		]);
		/*	var ll = new gadgetui.input.LookupListInput(
			document.querySelector( "input[name='friends']" ),
			{
				emitEvents : false,
				datasource : lookuplist,
				model : gadgetui.model,
				menuItemRenderer : renderLabel
			}
		);	*/

		gadgetui.objects.Constructor( gadgetui.display.CollapsiblePane,[
			document.getElementById("InputsDiv"),
				{
					title : "Inputs",
					path : "/dist/"
				}]);

		gadgetui.objects.Constructor( gadgetui.display.CollapsiblePane,[
			document.getElementById("NarrowDiv"),
			{
				title : "Nickname",
				path : "/dist/"
			}
		]);

		gadgetui.objects.Constructor( gadgetui.display.CollapsiblePane,[
				document.getElementById("modelDiv"),
			{
				title : "Model",
				path : "/dist/",
				collapse : true
			}
		]);

		var fp = gadgetui.objects.Constructor( gadgetui.display.FloatingPane,[
			document.getElementById("debugDiv"),
			{
				title : "Floating debug pane",
				path : "/dist/",
				opacity : .5,
				position : {
					my : "right top",
					at : "right top",
					of : window
				}
			}
		]);
		// no IE 7 support
		if( !navigator.userAgent.match( /(MSIE 7)/ ) ){
			gadgetui.objects.Constructor( gadgetui.display.Bubble, [document.querySelector( "input[name='friends']" ).parentNode,
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
				}]);
		}

		gadgetui.model.bind( "user.firstname", document.querySelector( "span[name='firstname']" ) );

		document.addEventListener("gadgetui-input-change", function(evt, obj) {
			console.log(evt);
			console.log(obj);
		});



		function logChanges(obj) {
			console.log(obj);
			//showModel();
		}

		document.querySelector("input[name='resetLookupList']").addEventListener("click", function() {
			ll.reset();
		});
