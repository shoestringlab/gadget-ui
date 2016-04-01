$(document)
	.ready( function() {

		var user = { food : "" };
		var foods = [ { text: "cereal", id : 1 },
		               { text: "eggs", id : 2 },
		               { text: "danish", id : 3 }
		              ];

		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);

		new gadgetui.input.ComboBox(  $( "select[name='foods']" ),
			 {
				borderWidth: 1,
				borderRadius: 5,
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
					refresh : function( scope, resolve, reject ){
						scope.data = foods;
						resolve();
					}
				}
			}
		);
		
	});