var gadgetui = {};
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


	BindableObject.prototype.handleEvent = function( e ) {
		var that = this;
		switch (e.type) {
			case "change":
				$.each( this.elements, function( i, value ) {
					if( e.target.name === value.prop ){
						that.change( e.target.value, value.prop );
					}
				} );
				break;
		}
	};

	// for each bound control, update the value
	BindableObject.prototype.change = function( value, property ) {
		var that = this;
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
			this.data[ property ] = value;
		}
		else {
			throw "Attempt to treat a simple value as an object with properties. Change fails.";
		}

		// this code changes the value of the DOM element to the incoming value
		$.each( this.elements, function( i, obj ) {
			if ( obj.prop.length === 0 && typeof value !== 'object' ) {
				// BindableObject holds a simple value
				// make sure the incoming value is a simple value
				// set the DOM element value to the incoming value
				obj.elem.val( value );
			}
			else if ( property !== undefined && typeof value === 'object' ) {
				// incoming value is an object
				// this code sets the value of each control bound to the BindableObject
				// to the correspondingly bound property of the incoming value
				obj.elem.val( value[ property.prop ] );
			}
			else if ( property !== undefined && typeof value !== 'object' ) {
				// this is an update coming from the control to the BindableObject
				// no need to update the control, it already holds the correct value
				return true;
			}
			else if ( typeof value === 'object' ) {
				// property is not defined, meaning an object that has
				// properties bound to controls has been replaced
				// this code assumes that the object in 'value' has a property
				// associated with the property being changed
				// i.e. that value[ obj.elem.prop ] is a valid property of
				// value, because if it isn't, this call will error
				obj.elem.val( value[ obj.prop ] );
			}
			else {
				console.log( "No change conditions met for " + obj + " to change." );
				// skip the rest of this iteration of the loop
				return true;
			}
			//var event = new Event('change');
			obj.elem.change();
		} );
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

}( jQuery ) );


gadgetui.input = (function($) {
	function Input( args ){
		var that = this, val, ph, o, bindVar;
		that.emitEvents = true;
		that.model;
		that.func;

		if( args.el === undefined ){
			el = $( "input[class~='gadget-ui-input']", document );
		}else{
			el = args.el;
		}

		if( el.length === 1 && args.object !== undefined ){
			o = args.object;
		}
		if( args.config !== undefined ){
			that.config( args.config );
		}
		$.each( el,  function( index, obj ){
			val = $( obj ).val();
			ph = $( obj ).attr( "placeholder" );
			bindVar = $( obj ).attr( "gadgetui-bind" );
			// if binding was specified, make it so
			if( bindVar !== undefined && that.model !== undefined ){
				that.model.bind( bindVar, $( obj ) );
			}
			//if( $( obj ).attr( "si-object" ) !== undefined ){
				//o = window[ $( obj ).attr( "si-object" ) ];
			//}
			//f = o[ $( obj ).attr( "si-field" ) ];
			if( val.length === 0 ){
				if( ph !== undefined && ph.length > 0 ){
					val = ph;
				}else{
					val = " ... ";
				}
			}
			$( obj ).wrap( "<div class='gadget-ui-input-div'></div>");
			$( obj ).parent().prepend( "<span>" + val + "</span>");
			//$( obj ).append( "<a href='javascript:void(0)'><img src='img/recyclingcan_empty.png' height='25' style='display:none'/></a>" );
			$( obj ).hide();
	
			_bindInput( $( obj ).parent(), that.emitEvents, that.model, that.func, o  );
			//$( obj ).preprend( "<span>label</span>");
		});
	
		function _bindInput ( obj, emitEvents, model, func, object ) {
			oVar = ( (object === undefined) ? {} : object );
			
			$( "span", $( obj ) ).on( "mouseenter", function( ) {
				$( $( this ) ).hide( );
				$( $( this ).parent( ) )
					.on( "mouseleave", function( ) {
						if ( $( "input", $( this ) ).is( ":focus" ) === false ) {
							$( "span", $( this ) ).css( "display", "inline" );
							$( "input", $( this ) ).hide( );
							$( "img", $( this ) ).hide( );
						}
					} );
				$( "input", $( this ).parent( ) ).css( "min-width", "10em" )
					.css( "width", Math.round( $( "input", $( this ).parent() ).val().length * 0.66 ) + "em" )
					.css( "display", "inline" )
					.on( "blur", function( ) {
						var that = this, newVal;
						setTimeout( function( ) {
							newVal = $( that ).val( );
							if ( oVar.isDirty === true ) {
								if( newVal.length === 0 && $( that ).attr( "placeholder" ) !== undefined ){
									newVal = $( that ).attr( "placeholder" );
								}
								oVar[ that.name ] = $( that ).val( );
								//_saveContact( oVar );
	
								$( "span", $( that ).parent( ) ).text( newVal );
								//contact.change( );
	
								//legacyAvatar.model.set( "activeContact", oVar );
	
								if( model !== undefined && $( that ).attr( "gadgetui-bind" ) === undefined ){	
									// if we have specified a model but no data binding, change the model value
									model.set( that.name, oVar[ that.name ] );
								}
	
								oVar.isDirty = false;
								if( emitEvents === true ){
									$( that )
										.trigger( "gadget-ui-input-change", [ oVar ] );
								}
								if( func !== undefined ){
									func( oVar );
								}
							}
							$( "span", $( that ).parent( ) ).css( "display", "inline" );
							$( "img", $( that ).parent( ) ).hide( );
							$( that ).hide( );
	
						}, 200 );
					})
					.on( "change", function( e ) {
						oVar.isDirty = true;
						$( "span", $( this ).parent( ) ).text( e.target.value );
						})
					.on( "keyup", function( event ) {
						if ( parseInt( event.keyCode, 10 ) === 13 ) {
							$( this ).blur( );
						}
						$( this ).css( "width", Math.round( $( "input", $( this ).parent( ) ).val( ).length * 0.66 ) + "em" );
					});
				// show the trashcan icon
				$( "img", $( this ).parent( ) ).css( "display", "inline" );
			});
		}
		return this;
	}
	
	Input.prototype.config = function( args ){
		var that = this;
		that.model =  (( args.model === undefined) ? that.model : args.model );
		that.func = (( args.func === undefined) ? undefined : args.func );
		that.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	};
	
	return{
		Input: Input
	};
}(jQuery));