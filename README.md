gadget-ui
=========

JavaScript UI and data binding library

Version 1.4.0


**Usage**

***gadgetui.model***

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

***jquery.gadgetui.input.TextInput***

Creating new text input fields:

	new gadgetui.input.TextInput(  args );

args.el : array of jquery elements, optional

args.object : object to map to args.el if only one element is passed into the constructor. Optional, will be used to pass changed value to args.config.func.

args.config.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

args.config.func : custom function to execute when the element changes, optional. Will pass the args.object object, if it exists, as an argument.

args.config.model : model for data binding.

args.config.activate : event used to activate the select input, optional. defaults to "mouseenter".


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
    new gadgetui.input.TextInput( { config : { emitEvents: false, 
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
    new gadgetui.input.TextInput( { el : $("input[name='firstname']"), 
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

***jquery.gadgetui.input.SelectInput***

Creating new select input fields:

	new gadgetui.input.SelectInput(  args );

args.el : array of jquery elements, optional. If not specified, the component will bind to any text input with the attribute  "gadgetui-selectinput='true'".

args.object : object to map to args.el if only one element is passed into the constructor. Optional, will be used to pass changed value to args.config.func.

args.config.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

args.config.func : custom function to execute when the element changes, optional. Will pass the args.object object, if it exists, as an argument.

args.config.model : model for data binding.

args.config.activate : event used to activate the select input, optional. defaults to "mouseenter".


HTML:

	Relationship 

    <select name="role" class="gadget-ui-selectinput" gadgetui-selectinput="true" gadgetui-bind="user.role">
        <option value="">choose ...</option>
        <option value="friend">Friend</option>
        <option value="sibling">Sibling</option>
        <option value="co-worker">co-worker</option>
    </select>	

JS:

    var user = {firstname: "", lastname: "", role: ""};
    gadgetui.model.set( "user", user );
	new gadgetui.input.SelectInput( { config: { emitEvents: false, func : logChanges, model: gadgetui.model} } );

***jquery.gadgetui.input.LookupListInput***

Creating a new LookupListInput field.

	new gadgetui.input.LookupListInput(  args );

args.el : array of jquery elements, optional. If not specified, the component will bind to any text input with the attribute "gadgetui-lookuplist-input='true'". 

args.config.func : custom function to execute when the element changes, optional. Will pass the selected item from lookupList and either "add" or "remove" as arguments, func( obj, "add|remove" ).

args.config.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

args.config.itemRenderer : custom function that renders elements for the selected items, optional.

args.config.menuItemRenderer : custom function that renders elements for the menu of items, optional. 

args.config.model : model for data binding. 

args.lookupList : array of items to use as the source for the autocomplete function of the input, required.

args.minLength : minimum length of input value to trigger autocomplete, optional, default 0.

HTML: 

    <input name="friends" type="text" gadgetui-lookuplist-input="true" gadget-ui-bind="user.friends" placeholder="Friends"/>

JS: 
    
    var lookuplist = [
        {label: "Abby", email: "abby@abby", value: "123"},
        {label:"Bobby", email: "bobby@bobby", value: "456"},
        {label: "Cara", email: "cara@cara", value: "789"},
        {label: "Dan", email: "dan@dan", value: "102"}	
    ];

	function renderLabel( item ){
		return item.label + "(" + item.email + ")";
	}
	
 	var user = {firstname: "", lastname: "", role: "", friends : []};
	new gadgetui.input.LookupListInput( { config:{ emitEvents: false, lookupList: lookuplist, model: gadgetui.model, labelRenderer : renderLabel } } );
	


***jquery.gadgetui.display.CollapsiblePane***

Creating a new CollapsiblePane:

	new gadgetui.display.CollapsiblePane( args );

args.selector : The jQuery selector to create the CollapsiblePane. The selector must be a div.

args.config : The config object for the control.

args.config.title : The title to disple in the header bar of the control.

args.config.path : The path to the gadgetui script folder. Defaults to /bower_components/gadget-ui/dist/. Used for icon display.

args.config.padding : The cell padding for the selector. Defaults to .5em.

args.config.paddingTop : The cell padding for the top of the selector. Defaults to .3em. Used to correct offset shift in pane show/hide transition.

args.config.width : Width of the resulting control. Defaults to the width of the selector.

args.config.interiorWidth : Width of the selector div after rendering is complete. Defaults to "".

args.config.collapse : Whether to start the resulting control expanded or collapsed. Defaults to false.

HTML:

    <div id="modelDiv" style="width: 50%;">
    </div>
   
JS:
    new gadgetui.display.CollapsiblePane( { selector: $( "#modelDiv" ), config : { title: "Model", path : "/dist/img/" } } );
	
In this example, a pane is created from a basic div. Note that the pane copies the width of the selector and sets the selector width at 100% to fill the pane.


***jquery.gadgetui.display.Bubble***

Creating a new Bubble:

	new gadgetui.display.Bubble( selector, message, options );

selector : The jQuery selector to create the Bubble. The selector must be an HTML element with positioning.
	
message : The message to display in the Bubble.

options.bubbleType : Type of Bubble. Currently only "speech" type is supported.

options.name : Name of Bubble element. Defaults to "bubble".

options.height : Height of Bubble paragraph element.

options.width : Width of Bubble paragraph element.

options.padding : Padding of Bubble paragraph element.

options.opacity : Opacity of Bubble.

options.shadowColor : Color of Bubble shadow. Defaults to .ui-state-active color from jQuery UI CSS.

options.shadowSize : Width of shadow. Defaults to 2.

options.borderColor : Color of Bubble border. Defaults to .ui-state-active color from jQuery UI CSS.

options.borderWidth : Width of Bubble border. Defaults to 8.

options.arrowPosition : Position of arrow on Bubble. Defaults to "bottom left". ( top left | top right | top center | right top | right center | right bottom | bottom right | bottom center | bottom right | left bottom | left center | left top )

options.arrowDirection : Direction of arrow. May point toward middle of arrow ( middle ), toward nearest corner of Bubble ( corner ), or toward center of Bubble ( center ) Defaults to middle. 

options.arrowSize : Size of arrow. Defaults to 25.

options.backgroundColor : Background color inside Bubble. Defaults to "#FFFFFF".

options.lineHeight : line height of text in Bubble. Defaults to 20.

options.borderRadius : Rounded corner radius of Bubble. Defaults to 30.

options.boxShadowColor : Box shadow color of Bubble. Defaults to .ui-state-active color from jQuery UI CSS.

options.font : Font setting of text in Bubble. Defaults to "Arial sans".

options.zIndex : z-index of Bubble. Defaults to 100.

options.closable : Whether to add a close icon to Bubble to allow it to be closed manually. Defaults to false.

options.autoClose : Whether to auto-close the Bubble after a delay. Defaults to false.

options.autoCloseDelay : Delay in milliseconds before auto-closing the Bubble. Defaults to 5000.

HTML:

    <input name="firstname"/>
       
JS:

    var message = "Please indicate your first name.";
    
    new gadgetui.display.Bubble( $( "input[name='firstname']" ),
        message,
        {
            arrowPosition : "left bottom",
            position : "top right",
            arrowDirection : "middle",
            borderWidth : 10,
            height: 100,
            padding: 15,
            arrowSize: 30,
            borderRadius: 15,
            autoClose : true
            });
			
In this example, we add a Bubble to the input named "firstname", with a message instructing the user how to fill in the input. The bubble is set to close automatically after 5 seconds.


**Notes**

The codebase is in active development. Expect things to change before the functionality is stable. If you choose to use the current code in production, you have been warned.

Non-jQuery version of the library is currently the same as the jQuery version. The model does not depend on jQuery, but the input functions do.

Unit testing is a work in progress. Work is being done to integrate Syn event simulation framework into QUnit tests, but tests are not functioning at this time.

***License*** 

gadget-ui s released under the MIT license.