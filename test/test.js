$( document ).ready( function(){
	var gadgetuiinput = new gadgetui.input.Input( { config: { emitEvents: false, func : logChanges, model: gadgetui.model } } );

	$( document )
		.on( "gadgetui-textinput-change", function(evt, obj){
			console.log( evt );
			console.log( obj );
		});

	function logChanges( obj ){
		console.log( obj );
	}

	QUnit.module("binding", {
		setup: function() {
			// runs before each test
			// set up model with user object

			var user = {
					firstname: "",
					lastname: ""
			};
			gadgetui.model.set( "user", user );
			gadgetui.model.bind( "user.firstname", $( "input[name='user.firstname']" ) );
		},
		teardown: function() {
			// runs after each test
			gadgetui.model.destroy( "user" );
		}
	});

	QUnit.test( "Input to model binding", function( assert ) {
		// change the first name field
		//$( "span", $( "input[name='user.firstname']" ).parent() )
		Syn.move( {clientX: 1, clientY: 1}, $( "span", $( "input[name='user.firstname']" ).parent() ) )
			.click( {}, $( "input[name='user.firstname']" ) )
			.delay()
			.type( "William" );
		var p = $( "input[name='user.firstname']" ).position();
		Syn.move( {clientX: p.left, clientY: p.top },  $( "span", $( "input[name='user.lastname']" ).parent() ));
		
		//$( "input[name='user.firstname']" ).val( "William" );
		//$( "input[name='user.firstname']" ).trigger( "blur" );	
		console.log( gadgetui.model.get( "user.firstname" ) );
		console.log( $( "input[name='user.firstname']" ).val() );
		
		console.log( gadgetui.model.get("user") );
		assert.equal( $( "input[name='user.firstname']" ).val()  , "William", "Input user.firstname has a value of William" );
		assert.equal( gadgetui.model.get( "user.firstname" ) , "William", "Model user key firstname has a value of William" );
	});	
	QUnit.test( "Model to input binding", function( assert ) {
		// bind user.firstname input to model user.firstname key
		gadgetui.model.set( "user.firstname", "Robert" );

		assert.equal( gadgetui.model.get( "user.firstname" ) , "Robert", "Model user key firstname has a value of Robert" );
		assert.equal( $( "input[name='user.firstname']" ).val() , "Robert", "Input user.firstname has a value of Robert." );
		assert.equal( $( "input[name='user.firstname']" ).val() , gadgetui.model.get( "user.firstname" ), "Input user.firstname is equal to model user key firstname." );
	});


});