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

	BindableObject.prototype.handleEvent = function( event ) {
		var that = this;
		switch (event.type) {
			case "change":
				$.each( this.elements, function( i, value ) {
					that.change( $( this.elem[ i ] ).val( ) );
				} );
				break;
		}
	};

	// for each bound control, update the value
	BindableObject.prototype.change = function( value, property ) {
		if ( property === undefined ) {
			this.data = value;
		}
		else {
			this.data[ property ] = value;
		}

		$.each( this.elements, function( i, obj ) {
			if ( obj.prop.length === 0 ) {
				obj.elem.val( value );
			}
			else if ( property !== undefined ) {
				obj.elem.val( value[ property.prop ] );
			}
			else {
				// property is not defined, meaning an object that has
				// properties bound to controls has been replaced
				// this code assumes that the object in 'value' has a property
				// associated with the property being changed
				// i.e. that value[ obj.elem.prop ] is a valid property of
				// value, because if it isn't, this call will error
				obj.elem.val( value[ obj.elem.prop ] );
			}
		} );
	};

	// bind an object to an HTML element
	BindableObject.prototype.bind = function( element, property ) {
		var e;
		if ( property === undefined ) {
			element.val( this.data );
			e = {
				elem : element,
				prop : ""
			};
		}
		else {
			element.val( this.data[ property ] );
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

/*	
 * 
 * 	<div class="smartInput email">
	<span>{{emailaddress}}</span>
	<input type="text" name="emailaddress" class="input15em ui-corner-all ui-widget-content inline" value="{{emailaddress}}" placeholder="{{emaillbl}}" style="display:none;"/>
	</div>
	
*
*/
gadgetui.input = (function($) {
	function Input( args ){
		var that = this, val, ph;
		that.emitEvents = true;
		that.model;
		that.func;

		if( args.el === undefined ){
			el = $( ".gadgetUIInput", document );
		}else{
			el = args.el;
		}
		
		if( args.config !== undefined ){
			that.config( args.config );
		}
		$.each( el,  function( index, obj ){
			val = $( obj ).val();
			ph = $( obj ).attr( "placeholder" );
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
			$( obj ).wrap( "<div class='gadgetUIInputDiv'></div>");
			$( obj ).parent().prepend( "<span>" + val + "</span>");
			$( obj ).append( "<a href='javascript:void(0)'><img src='/img/recyclingcan_empty.png' height='25' style='display:none'/></a>" );
			$( obj ).hide();
	
			_bindInput( $( obj ).parent(), that.emitEvents, that.model, that.func  );
			//$( obj ).preprend( "<span>label</span>");
		});
	
		function _bindInput ( obj, emitEvents, model, func ) {
			var oVar = {};
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
	
								if( model !== undefined ){
									model.set( that.name, oVar[ that.name ] );
								}
	
								oVar.isDirty = false;
								if( emitEvents === true ){
									$( that )
										.trigger( "gadgetUIInputChange", [ oVar ] );
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
					.on( "change", function( ) {
						oVar.isDirty = true;
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