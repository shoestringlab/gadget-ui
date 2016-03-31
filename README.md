gadget-ui
=========

JavaScript UI and data binding library

Version 2.1.0

For a quickstart guide and working examples, see http://www.bonnydoonmedia.com/index.cfm/projects/gadget-ui/.


**Usage**

***gadgetui.model***

Creating values:

    // Note: set can be used in place of create in most cases. set will throw an error if you try 
             to set() a new value with an explicit property, e.g. set( "user.firstname", "Robert" );
    var user = { firstname: "Rob", middlename: "", lastname: "Munn" };
    // either
    gadgetui.model.create( "user", user);
    // or
    gadgetui.model.set( "user", user);	

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
	
Binding a DOM element

    gadgetui.model.bind( "user.firstname", $( "input[name='firstname']") );
    gadgetui.model.bind( "user.firstname", $( "div[name='firstname']") );
    
    * Note that you can bind more than one element to the same model element.
    
    
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


***jquery.gadgetui.display.CollapsiblePane***

Creating a new CollapsiblePane:

	new gadgetui.display.CollapsiblePane( selector, options );

selector : The jQuery selector to create the CollapsiblePane. The selector must be a div.

options.title : The title to disple in the header bar of the control.

options.path : The path to the gadgetui script folder. Defaults to /bower_components/gadget-ui/dist/. Used for icon display.

options.padding : The cell padding for the selector. Defaults to .5em.

options.paddingTop : The cell padding for the top of the selector. Defaults to .3em. Used to correct offset shift in pane show/hide transition.

options.width : Width of the resulting control. Defaults to the width of the selector.

options.interiorWidth : Width of the selector div after rendering is complete. Defaults to "".

options.collapse : Whether to start the resulting control expanded or collapsed. Defaults to false.

HTML:

    <div id="modelDiv" style="width: 50%;">
    </div>

JS:
    new gadgetui.display.CollapsiblePane( $( "#modelDiv" ), { title: "Model", path : "/dist/img/" } );
	
In this example, a pane is created from a basic div. Note that the pane copies the width of the selector and sets the selector width at 100% to fill the pane.

***jquery.gadgetui.display.FloatingPane***

Creating a new FloatingPane:

	new gadgetui.display.FloatingPane( selector, options );

selector : The jQuery selector to create the FloatingPane. The selector must be a div.

options.title : The title to display in the header bar of the control.

options.path : The path to the gadgetui script folder. Defaults to /bower_components/gadget-ui/dist/. Used for icon display.

options.position : Position element, e.g. jQuery UI, that determines where pane is initially positioned.

options.padding : The cell padding for the selector. Defaults to 15px.

options.paddingTop : The cell padding for the top of the selector. Defaults to .3em. Used to correct offset shift in pane show/hide transition.

options.width : Width of the resulting control. Defaults to the width of the selector.

options.minWidth : Minimum width of the resulting control.

options.interiorWidth : Width of the selector div after rendering is complete. Defaults to "".

options.opacity : CSS property for transparency of the pane. Defaults to 1 (opaque).

options.zIndex : CSS property for z-index of control that enables it to float above other content. Defaults to 100000.


HTML:

    <div id="floatingDiv" style="width: 50%;">
    </div>
   
JS:
    new gadgetui.display.FloatingPane( $( "#modelDiv" ), { title: "Floating Message Pane", path : "/dist/img/" } );
	
In this example, a pane is created from a basic div. Note that the pane copies the width of the selector and sets the selector width at 50%.


***jquery.gadgetui.display.ComboBox***

Creating a new ComboBox:

    new gadgetui.input.ComboBox( selector, options );
 
selector : jQuery selector, required. 

options : Options object. 

options.activate : event used to activate the select input, optional. defaults to "mouseenter".

options.model : model for data binding. 

options.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

options.dataProvider : Object that may contain data key and refresh method to re-populate data.

options.dataProvider.data : An array of objects in form { id: id, text: text } to populate the select box. Optional.
                            - Data can be pre-populated when the ComboBox is instantiated, or omitted. If data is omitted, refresh() will
                              be called when the ComboBox is instantiated.

options.dataProvider.refresh : Method that is called to re-populate data array. Called automatically after save().

options.save : Method that is called after [Enter] is pressed after entering a new term in the text input field. 
               - This method should save the new term and return the id of the saved term via the resolve() method.
               - Method takes three arguments:
                 - text : the term typed into the input box.
                 - resolve : Promise.resolve method to call when term has been saved and new id can be returned to ComboBox. 
                             - Resolve should be passed new id : resolve( id )
                 - reject : Promise.reject method to call if the term was not successfully saved.
                 
options.delay : Time in milliseconds to wait before activating the control.

options.inputBackground : CSS property to set for the background of the input. Defaults to #ffffff.

options.borderWidth : CSS property for border width of the ComboBox. Defaults to 1.

options.borderColor : CSS property for ComboBox border color. Defaults to silver.

options.borderStyle : CSS property for ComboBox border style. Defaults to solid.

options.borderRadius : CSS property. Defaults to 5.

options.width : width of control. Defaults to 150.

options.newOption : The default select option when no value is set. Defaults to { text: "...", id: 0 }.

options.id : Id of option to set as selected when the component is initialized. Defaults to newOption.id.

options.arrowIcon : Down arrow image used on the select box. Defaults to "/bower_components/gadget-ui/dist/img/arrow.png".

options.scaleIconHeight : Boolean flag whether to scale the arrow icon vertically to fill a larger space. Defaults to false.

options.animate : Boolean, whether to display a short animation glow after save() finishes. Defaults to true.

options.glowColor : CSS property, color of the glow around the combo box. Defaults to 'rgb(82, 168, 236)'.

options.animateDelay : Time in milliseconds for the animation to run. Defaults to 500.

HTML:

    <p>Select your favorite breakfast food, or enter something new:</p>
    <div style="margin-left: 50px;">

        <select name="foods" gadgetui-bind="user.food">

        </select>
    </div>

JavaScript

        var user = { food : "" };
        var foods = [ { text: "cereal", id : 1 },
                       { text: "eggs", id : 2 },
                       { text: "danish", id : 3 }
                      ];

        gadgetui.model.set("user", user);

        new gadgetui.input.ComboBox(  $( "select[name='foods']" ),
             {
                save : function( text, resolve, reject ){
                        var newId = foods.length + 1;
                        foods.push( { text : text, id : newId } );
                        resolve( newId );
                },
                dataProvider : {
                    refresh : function( scope, resolve, reject ){
                        scope.data = foods;
                        resolve();
                    }
                }
            }
        );    

In this example, we create a user object { food : "" }, a foods array of objects, and we bind user.food in the model to the ComboBox. We then create the ComboBox, passing in a save() method 
that adds new terms to the foods array and passed back the new id, and a dataProvider object with a refresh method to set the updated array as the data value of the dataProvider.


***jquery.gadgetui.input.LookupListInput***


Creating a new LookupListInput field.

2.x

    new gadgetui.input.LookupListInput( selector, options );

selector : jQuery selector, required. 

options : Replaces args.config in 1.x.

options.datasource : array of items to use as the source for the autocomplete function of the input, required.

options.func : custom function to execute when the element changes, optional. Will pass the selected item from lookupList and either "add" or "remove" as arguments, func( obj, "add|remove" ).

options.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

options.itemRenderer : custom function that renders elements for the selected items, optional.

options.menuItemRenderer : custom function that renders elements for the menu of items, optional. 

options.model : model for data binding. 

options.minLength : minimum length of input value to trigger autocomplete, optional, default 0.


1.x

    new gadgetui.input.LookupListInput( args );

args.el : array of jquery elements, optional. If not specified, the component will bind to any text input with the attribute "gadgetui-lookuplist-input='true'". 

args.lookupList : array of items to use as the source for the autocomplete function of the input, required.

args.config.func : custom function to execute when the element changes, optional. Will pass the selected item from lookupList and either "add" or "remove" as arguments, func( obj, "add|remove" ).

args.config.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

args.config.itemRenderer : custom function that renders elements for the selected items, optional.

args.config.menuItemRenderer : custom function that renders elements for the menu of items, optional. 

args.config.model : model for data binding. 

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
	new gadgetui.input.LookupListInput( $( "input[name='friends']"), { emitEvents: false, lookupList: lookuplist, model: gadgetui.model, labelRenderer : renderLabel } );
	

***jquery.gadgetui.input.SelectInput***

Creating new select input fields:

2.x
   	new gadgetui.input.SelectInput(  selector, options );

1.x
	new gadgetui.input.SelectInput(  args );

Options

2.x

selector : jQuery selector to bind the control to.

options : Replaces args.config in 1.x. 

options.object : Replaces arsg.object in 1.x.

options.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

options.func : custom function to execute when the element changes, optional. Will pass the args.object object, if it exists, as an argument.

options.model : model for data binding.

options.activate : event used to activate the select input, optional. defaults to "mouseenter".

1.x

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
	new gadgetui.input.SelectInput( $( "input[name='firstname']" ), { emitEvents: false, func : logChanges, model: gadgetui.model}  );


***jquery.gadgetui.input.TextInput***

Creating new text input fields:

2.x

	new gadgetui.input.TextInput( selector, options );

1.x

	new gadgetui.input.TextInput( args );

Options

2.x


selector : jQuery selector upon which the control will be applied.

options : Replaces config in 1.x. 

options.object : object to map to seletor. Optional, will be used to pass changed value to options.func.

options.useActive : Boolean flag to indicate whether user should have to activate the control by clicking on it before enabling input. Defaults to false. 
                    This flag enables functionality where you can click on an element to give it focus without activating the input control,.

options.enforceMaxWidth : Boolean flag whether to limit the size of labels so controls don't overflow their containers. Defaults to false.

options.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

options.func : custom function to execute when the element changes, optional. Will pass the args.object object, if it exists, as an argument.

options.model : model for data binding.

options.activate : event used to activate the select input, optional. defaults to "mouseenter".

options.delay : time in milliseconds to wait before activating the control. 

1.x


args.el : array of jquery elements, optional

args.object : object to map to args.el if only one element is passed into the constructor. Optional, will be used to pass changed value to args.config.func.

args.config.emitEvents : boolean, whether to trigger a custom event of type "gadget-ui-input-change", which you can listen for to capture changes in input values, optional, default = true.

args.config.func : custom function to execute when the element changes, optional. Will pass the args.object object, if it exists, as an argument.

args.config.model : model for data binding.

args.config.activate : event used to activate the select input, optional. defaults to "mouseenter".

args.config.delay : time in milliseconds to wait before activating the control. 

gadget-ui.input expects a model with a set( name, value ) function that sets the new value. 

"name" is the value of the name property of the input. 

"value" is the value of the input.

gadget-ui.input also expect a bind( property, element ) method for auto-binding via the gadgetui-bind directive.

"property" is the model value that will be bound to the element. If you are binding to a simple value, like "name", property will be that object name, e.g. "name". 
If you are binding to an object, e.g. user {firstname: "", lastname: "" }, property will be the name of the object and the key to bind the control to, e.g. "user.firstname".

"element" is the element that will be bound to the model. In the jQuery package, it is a jQuery selector. 
							
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


**Notes**

The codebase is in active development. Expect things to change before the functionality is stable. If you choose to use the current code in production, you have been warned.

Non-jQuery version of the library is currently the same as the jQuery version. The model does not depend on jQuery, but the input functions do.

Unit testing is a work in progress. Work is being done to integrate Syn event simulation framework into QUnit tests, but tests are not functioning at this time.

***License*** 

gadget-ui is released under the Mozilla Public License 2.0.