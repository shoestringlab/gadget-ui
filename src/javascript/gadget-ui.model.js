/*
 * file: gadget-ui.model.js
 * author: Robert Munn 
 * 
 */

gadgetui.model = ( function( ) {
	"use strict";

	var _model = {};
	function BindableObject( data, element ) {
		this.data = data;
		this.elements = [ ];
		if ( element !== undefined ) {
			this.bind( element );
		}
	}

/*		BindableObject.prototype.handleEvent = function( event ) {
		var i, that = this;
		switch (event.type) {
			case "change":
				for ( i = 0; i < this.elements.length; i++ ) {
					that.change( this.elements[i].elem[ 0 ].value );
				}
				break;
		}
	};
	*/
	// for each bound control, update the value
	BindableObject.prototype.change = function( value, property ) {
		var obj, i;
		if ( property === undefined ) {
			this.data = value;
		}
		else {
			this.data[ property ] = value;
		}

		for ( i = 0; i < this.elements.length; i++ ) {
			obj = this.elements[ i ];
			if ( obj.prop.length === 0 ) {
				obj.elem.value = value;
			}
			else if ( property !== undefined ) {
				obj.elem.value = value[ property.prop ];
			}
			else {
				// property is not defined, meaning an object that has
				// properties bound to controls has been replaced
				// this code assumes that the object in 'value' has a property
				// associated with the property being changed
				// i.e. that value[ obj.elem.prop ] is a valid property of
				// value, because if it isn't, this call will error
				obj.elem.value = value[ obj.elem.prop ];
			}
			i++;
		}
	};

	// bind an object to an HTML element
	BindableObject.prototype.bind = function( element, property ) {
		var e;
		if ( property === undefined ) {
			element.value = this.data;
			e = {
				elem : element,
				prop : ""
			};
		}
		else {
			element.value = this.data[ property ];
			e = {
				elem : element,
				prop : property
			};
		}
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
			if ( n.length === 1 ) {
				return _model[ name ].data;
			}
			return _model[n[0]].data[ n[ 1 ] ];

		},
		// setter - if the name of the object to set has a period, we are
		// setting a property of the object, e.g. user.firstname
		set : function( name, value ) {
			var n = name.split( "." );
			if ( this.exists( n[ 0 ] ) === false ) {
				if ( n.length === 1 ) {
					this.create( name, value );
				}
				else {
					// don't create complex objects, only simple values
					throw "Object " + n[ 0 ] + "is not yet initialized.";
					/*	var mykey = n[1];
					 this.create( n[0], { mykey : value } );	*/
				}
			}
			else {
				if ( n.length === 1 ) {
					_model[ name ].change( value );
				}
				else {
					_model[ n[ 0 ] ].change( value, n[ 1 ] );
				}
			}
		}
	};

	}( ) );
