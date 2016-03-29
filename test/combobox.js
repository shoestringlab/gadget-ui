$(document)
	.ready( function() {

		var user = { food : "" };
		var foods = [ { key: "cereal", value : 1 },
		               { key: "eggs", value : 2 },
		               { key: "danish", value : 3 }
		              ];

		function renderLabel(item) {
			return item.label + "(" + item.email + ")";
		}

		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);

		new gadgetui.input.ComboBox(  $( "select[name='foods']" ),
			 {
				arrowIcon: '/dist/img/arrow.png',
				save : function( text, resolve, reject ){
						console.log( "saving new value" );
						var newValue = foods.length + 1;
						foods.push( { key : text, value : newValue } );
						resolve( newValue );
				},
				dataProvider : {
					// you can pre-populate 'data' or the refresh() function will be called when you instantiate the ComboBox
					//data : undefined,
					refresh : function(){
						this.data = foods;
					}
				}
			}
		);
		
	});