$(document)
	.ready( function() {

		var user = { food : "" };
		var foods = [ { text: "cereal", id : 1 },
		               { text: "eggs", id : 2 },
		               { text: "danish", id : 3 }
		              ];

		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);

		new gadgetui.input.ComboBox(  $( "select[name='food']" ),
			 {
				borderWidth: 3,
				borderRadius: 10,
				arrowIcon: '/dist/img/arrow.png',
				save : function( text, resolve, reject ){
						console.log( "saving new value" );
						if( $.isArray(foods) ){
							var newId = foods.length + 1;
							foods.push( { text : text, id : newId } );
							resolve( newId );
						}else{
							reject( "Value was not saved." );
						}
				},
				dataProvider : {
					// you can pre-populate 'data' or the refresh() function will be called when you instantiate the ComboBox
					//data : undefined,
					refresh : function( dataProvider, resolve, reject ){
						if( $.isArray(foods) ){
							dataProvider.data = foods;
							resolve();
						}else{
							reject( "Data set is not an array." );
						}
					}
				}
			}
		);
		
		 $( "select[name='food']" )
		 	.on( "gadgetui-combobox-change", function( event, o ){
		 		console.log( o );
		 	});
	});