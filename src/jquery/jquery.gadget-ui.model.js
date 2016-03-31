gadgetui.model = ( function( $ ) {
	"use strict";

	var _model = {};
	function BindableObject( data, element ) {
		this.data = data;
		this.elements = [ ];
		if ( element !== undefined ) {
			this.bind( element );
		}
	}

	BindableObject.prototype.handleEvent = function( ev ) {
		var ix, obj;
		switch ( ev.type ) {
			case "change":
				for( ix = 0; ix < this.elements.length; ix++ ){
					obj = this.elements[ ix ];
					if( ev.target.name === obj.prop ){
						//select box binding
						if( ev.target.type.match( /select/ ) ){
							this.change( { 	value : $( ev.target ).val(), 
									key : $( ev.target ).find('option:selected').text() 
								}, ev, obj.prop );
						}
						else{
						// text input binding
						this.change( ev.target.value, ev, obj.prop );
						}
					}
				}
				
		}
	};

	// for each bound control, update the value
	BindableObject.prototype.change = function( value, event, property ) {
		var ix, obj;

		// this code changes the value of the BinableObject to the incoming value
		if ( property === undefined ) {
			// Directive is to replace the entire value stored in the BindableObject
			// update the BindableObject value with the incoming value
			// value could be anything, simple value or object, does not matter
			this.data = value;
		}
		else if ( typeof this.data === 'object' ) {
			//Directive is to replace a property of the value stored in the BindableObject
			// verifies that "data" is an object and not a simple value
			// update the BindableObject's specified property with the incoming value
			// value could be anything, simple value or object, does not matter
			
			if( this.data[ property ] === undefined ){
				throw( "Property '" + property + "' of object is undefined." );
			}
			else{
				this.data[ property ] = value;
			}			
			// check if we are updating only a single property or the entire object
		
		}
		else {
			throw "Attempt to treat a simple value as an object with properties. Change fails.";
		}

		// check if there are other dom elements linked to the property
		for( ix = 0; ix < this.elements.length; ix++ ){
			obj = this.elements[ ix ];
			if( ( property === undefined || property === obj.prop ) && ( event.target !== undefined && obj.elem[0] != event.target ) ){
				this.updateDomElement( obj.elem, value );
			}
		}
	};
	
	BindableObject.prototype.updateDom = function( value, property ){
		var ix, obj;
		// this code changes the value of the DOM element to the incoming value
		for( ix = 0; ix < this.elements.length; ix++ ){
			obj = this.elements[ ix ];

			if ( property === undefined  || ( property !== undefined && obj.prop === property ) ){

				// this code sets the value of each control bound to the BindableObject
				// to the correspondingly bound property of the incoming value
				this.updateDomElement( obj.elem, value );
				//break;
			}
		}
	};
	
	BindableObject.prototype.updateDomElement = function( selector, value ){
		if( typeof value === 'object' ){
			// select box objects are populated with { key: key, value: value } 
			if( selector.is( "div" ) === true ){
				selector.text( value.text );
			}else{
				selector.val( value.id );
			}
		}else{
			if( selector.is( "div" ) === true ){
				selector.text( value );
			}else{
				selector.val( value );
			}
		}
		console.log( "updated Dom element: " + selector );
		selector.trigger( "change" );
	};

	// bind an object to an HTML element
	BindableObject.prototype.bind = function( element, property ) {
		var e;

		if ( property === undefined ) {
			// BindableObject holds a simple value
			// set the DOM element value to the value of the Bindable object
			element.val( this.data );
			e = {
				elem : element,
				prop : ""
			};
		}
		else {
			// Bindable object holds an object with properties
			// set the DOM element value to the value of the specified property in the
			// Bindable object
			element.val( this.data[ property ] );
			e = {
				elem : element,
				prop : property
			};
		}
		//add an event listener so we get notified when the value of the DOM element
		// changes
		element[ 0 ].addEventListener( "change", this, false );
		this.elements.push( e );
	};

	return {
		BindableObject : BindableObject,

		create : function( name, value, element ) {
			if ( element !== undefined ) {
				_model[ name ] = new BindableObject( value, element );
			}
			else {
				_model[ name ] = new BindableObject( value );
			}
		},

		destroy : function( name ) {
			delete _model[ name ];
		},

		bind : function( name, element ) {
			var n = name.split( "." );
			if ( n.length === 1 ) {
				_model[ name ].bind( element );
			}
			else {
				_model[ n[ 0 ] ].bind( element, n[ 1 ] );
			}
		},

		exists : function( name ) {
			if ( _model.hasOwnProperty( name ) ) {
				return true;
			}

			return false;
		},
		// getter - if the name of the object to get has a period, we are
		// getting a property of the object, e.g. user.firstname
		get : function( name ) {
			var n = name.split( "." );
			try{
				if ( n.length === 1 ) {
					if( _model[name] === undefined ){
						throw "Key '" + name + "' does not exist in the model.";
					}else{
						return _model[ name ].data;
					}
				}
				if( _model[n[0]] === undefined ){
					throw "Key '" + n[0] + "' does not exist in the model.";
				}
				return _model[n[0]].data[ n[ 1 ] ];

			}catch( e ){
				console.log( e );
				return undefined;
			}
		},

		// setter - if the name of the object to set has a period, we are
		// setting a property of the object, e.g. user.firstname
		set : function( name, value ) {
			var n = name.split( "." ), fevent = {};
			if ( this.exists( n[ 0 ] ) === false ) {
				if ( n.length === 1 ) {
					this.create( name, value );
				}
				else {
					// don't create complex objects, only simple values
					throw "Object " + n[ 0 ] + "is not yet initialized.";
				}
			}
			else {
				if ( n.length === 1 ) {
					_model[ name ].change( value, fevent );
					_model[ name ].updateDom( value );
				}
				else {
					_model[ n[ 0 ] ].change( value, fevent, n[1] );
					_model[ n[ 0 ] ].updateDom( value, n[1] );	
				}
			}
			console.log( "model value set: name: " + name + ", value: " + value );
		}
	};

}( jQuery ) );
