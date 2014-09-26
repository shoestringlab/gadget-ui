gadget-ui
=========

JavaScript UI and data binding library


** Usage **

*** gadget-ui.model ***

creating values: 
	// Note: set can be used in place of create in most cases. set will throw an error if you try to set() a new value with an explicit property, e.g. set( "user.firstname", "Robert" );
    var user = { firstname: "Rob", middlename: "", lastname: "Munn" };
    gadgetui.model.create( "user", user);	

Setting values:

    var user = { firstname: "Rob", middlename: "", lastname: "Munn" };
    gadgetui.model.set( "user", user);
    console.log( gadgetui.model.get( "user") );
    //returns Object{ firstname: "Rob", middlename: "", lastname: "Munn" }
    
    // change the object
    user = gadgetui.model.get( "user" );
    user.firstname = "Robert";
    gadgetui.model.set( "user", user);
    console.log( gadgetui.model.get( "user") );
    //returns Object{ firstname: "Robert", middlename: "", lastname: "Munn" }
        
    // change a property of an object
    gadgetui.model.set( "user.middlename", "Daniel" );
    console.log( gadgetui.model.get( "user") );
    //returns Object{ firstname: "Robert", middlename: "Daniel", lastname: "Munn" }    

Getting values:

    console.log( gadgetui.model.get( "user") );
    //returns Object{ firstname: "Robert", middlename: "Daniel", lastname: "Munn" }
    console.log( gadgetui.model.get( "user.firstname") );
	// returns "Robert"
	
Checking if a value exists:

	console.log( gadgetui.model.exists( "user" ) );
	//returns true	
	
Removing values:

	gadgetui.model.destroy( "user");
	console.log( gadgetui.model.exists( "user" ) );
	//returns false
	
*** jquery.gadget-ui.input ***
	
Creating new input fields:

	gadgetui.input.Input(  args );
	
	args.el : array of jquery elements, optional
	args.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", 
						which you can listen for to capture changes in input values, optional, default = true.
	args.func : custom function to execute when the element changes, optional.
	args.model : model to set changed values to. gadget-ui expects a model with a set( name, value ) function that sets the new value. 
						"Name" is the value of the name property of the input. 
						"Value" is the value of the input.
						optional, 

By default 

HTML:

	<input name="user.firstname" class="gadget-ui-input" placeholder="first name" value=""/>

JS:

	var gadgetuiinput = new gadgetui.input.Input( { config: { emitEvents: false, func : logChanges, model: gadgetui.model } } );

** Notes **

Unit testing is a work in progress. Work is being done to integrate Syn event simulation framework into QUnit tests, but tests are not functioning at this time.

*** License *** 

gadget-ui s released under the MIT license.