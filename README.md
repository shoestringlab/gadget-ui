gadget-ui
=========

JavaScript UI and data binding library


**Usage**

***gadget-ui.model***

Creating values:

    // Note: set can be used in place of create in most cases. set will throw an error if you try 
             to set() a new value with an explicit property, e.g. set( "user.firstname", "Robert" );
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
	
***jquery.gadget-ui.input***
	
Creating new input fields:

	gadgetui.input.Input(  args );
	
args.el : array of jquery elements, optional

args.object : object to map to args.el if only one element is passed into the constructor. Optional, will be used to pass changed value to args.config.func.

args.config.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

args.config.func : custom function to execute when the element changes, optional.

args.config.model : model for data binding. 
	
gadget-ui.input expects a model with a set( name, value ) function that sets the new value. 

"name" is the value of the name property of the input. 

"value" is the value of the input.

gadget-ui.input also expect a bind( property, element ) method for auto-binding via the gadgetui-bind directive.

"property" is the model value that will be bound to the element. If you are binding to a simple value, like "name", property will be that object name, e.g. "name". 
If you are binding to an object, e.g. user {firstname: "", lastname: "" }, property will be the name of the object and the key to bind the control to, e.g. "user.firstname".

"element" is the element that will be bound to the model. In the jQuery package, it is a jQuery selector. 
							

Auto-generating gadgetui.input objects and auto-binding to the model:

HTML:

    <div>
    First Name	<input name="firstname" 
                  class="gadget-ui-input" 
                  gadgetui-input="true" 
                  gadgetui-bind="user.firstname" 
                  placeholder="first name" value=""/>
    </div>
    <div>
    Last Name <input name="lastname" 
                  class="gadget-ui-input" 
                  gadgetui-input="true" 
                  gadgetui-bind="user.lastname" 
                  placeholder="last name" value=""/>	
    </div>

JS:

    var user = {firstname: "", lastname: ""};
    gadgetui.model.set( "user", user );
    new gadgetui.input.Input( { config : { emitEvents: false, 
                                func : logChanges,
                                model : gadgetui.model  } } );

In this example, the controls are automatically turned into gadgetui.input controls by specifying the gadgetui-input directive in the control as true. Also,
the controls are automatically bound to the user object in the model, each to a specific property based on the gadgetui-bind directive in the control.



Manual binding:

HTML:

    <div>
    First Name	<input name="firstname" 
                   class="gadget-ui-input" placeholder="first name" value=""/>
    </div>

JS:

    var user = {firstname: "", lastname: ""};
    gadgetui.model.set( "user", user );
    new gadgetui.input.Input( { el : $("input[name='firstname']"), 
        object : user, 
        config : { emitEvents: false, func: logChanges } } );

    // data binding for two way binding between model and control
    gadgetui.model.bind( "user.firstname", $("input[name='firstname']"));

This is an older method of two-way binding and no longer preferred, though it is still supported.

In this example, the control "firstname" is bound to the firstname property of the user object stored in the model. If the control value changes, the model value will change. If the
model value changes, the control value will change. Also note in this example that we passed the control to the construct via the "el" argument. When using data binding via the bind()
method, this isn't necessary for basic functionality. It only becomes necessary if you would like to pass a custom object to the constructor as we have done. You may find this useful
if you want to also pass a custom function to the constructor via the "func" config argument, because when the control changes, the custom object will be passed to the custom function
with the new value from the control, and to the "gadget-ui-input-change" event if you accept the default configuration for the control to emit events when its value changes. 



**Notes**

The codebase is in active development. Expect things to change before the functionality is stable. If you choose to use the current code in production, you have been warned.

Unit testing is a work in progress. Work is being done to integrate Syn event simulation framework into QUnit tests, but tests are not functioning at this time.

***License*** 

gadget-ui s released under the MIT license.