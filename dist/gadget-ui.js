"use strict";

/*
 * author: Robert Munn <robert.d.munn@gmail.com>
 * 
 * Copyright (C) 2016 Robert Munn
 * 
 * This is free software licensed under the Mozilla Public License 2.0
 * 
 * https://www.mozilla.org/en-US/MPL/2.0/
 * 
 * 
 */

var gadgetui = {};
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

gadgetui.input = (function($) {
	function TextInput( args ){
		var that = this, val, ph, o, bindVar;
		that.emitEvents = true;
		that.model;
		that.func;

		if( args.el === undefined ){
			el = $( "input[gadgetui-textinput='true']", document );
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
			if( val.length === 0 ){
				if( ph !== undefined && ph.length > 0 ){
					val = ph;
				}else{
					val = " ... ";
				}
			}
			$( obj ).wrap( "<div class='gadgetui-textinput-div'></div>");
			$( obj ).parent().prepend( "<span>" + val + "</span>");
			$( obj ).hide();
	
			_bindTextInput( $( obj ).parent(), that.emitEvents, that.model, that.func, o  );
		});

		function _bindTextInput( obj, emitEvents, model, func, object ) {
			var that = this, oVar;
			oVar = ( (object === undefined) ? {} : object );
			
			$( "span", $( obj ) ).on( "mouseenter", function( ) {
				that = this;
				$( $( that ) ).hide( );
				$( $( that ).parent( ) )
					.on( "mouseleave", function( ) {
						var that = this;
						if ( $( "input", $( that ) ).is( ":focus" ) === false ) {
							$( "span", $( that ) ).css( "display", "inline" );
							$( "input", $( that ) ).hide( );
						}
					} );
					$( "input", $( that ).parent( ) ).css( "min-width", "10em" )
					.css( "width", Math.round( $( "input", $( that ).parent() ).val().length * 0.66 ) + "em" )
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
								$( "span", $( that ).parent( ) ).text( newVal );
	
								if( model !== undefined && $( that ).attr( "gadgetui-bind" ) === undefined ){	
									// if we have specified a model but no data binding, change the model value
									model.set( that.name, oVar[ that.name ] );
								}
	
								oVar.isDirty = false;
								if( emitEvents === true ){
									$( that )
										.trigger( "gadgetui-input-change", [ oVar ] );
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
					/*	.on( "change", function( e ) {
						var that = this, value = e.target.value;
						if( value.trim().length === 0 ){
							value = " ... ";
						}
						oVar.isDirty = true;
						$( "span", $( that ).parent( ) ).text( value );
						})		*/
					.on( "keyup", function( event ) {
						var that = this;
						if ( parseInt( event.keyCode, 10 ) === 13 ) {
							$( that ).blur( );
						}
						$( that ).css( "width", Math.round( $( "input", $( that ).parent( ) ).val( ).length * 0.66 ) + "em" );
					});
			});
			$( obj )
				.on( "change", function( e ) {
					var that = this, value = e.target.value;
					if( value.trim().length === 0 ){
						value = " ... ";
					}
					oVar.isDirty = true;
					$( "span", $( that ).parent( ) ).text( value );
					});			
		}
		return this;
	}
	
	TextInput.prototype.config = function( args ){
		var that = this;
		that.model =  (( args.model === undefined) ? that.model : args.model );
		that.func = (( args.func === undefined) ? undefined : args.func );
		that.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	};
	
	function SelectInput( args ){
		var that = this, val, ph, o, bindVar;
		that.emitEvents = true;
		that.model;
		that.func;

		if( args.el === undefined ){
			el = $( "select[gadgetui-selectinput='true']", document );
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

			if( val.length === 0 ){
				if( ph !== undefined && ph.length > 0 ){
					val = ph;
				}else{
					val = " ... ";
				}
			}
			$( obj ).wrap( "<div class='gadgetui-selectinput-div'></div>");
			$( obj ).parent().prepend( "<span>" + val + "</span>");
			$( obj ).hide();
	
			_bindSelectInput( $( obj ).parent(), that.emitEvents, that.model, that.func, o  );

		});

		function _bindSelectInput( obj, emitEvents, model, func, object ) {
			var that = this, oVar;
			oVar = ( (object === undefined) ? {} : object );
			
			$( "span", $( obj ) ).on( "mouseenter", function( ) {
				that = this;
				$( $( that ) ).hide( );
				
				$( $( this ).parent( ) ).on( "mouseleave", function( ) {
					if ( $( "select", $( this ) ).is( ":focus" ) === false && $( "input", $( this ).parent( ).parent( ) ).is( ":focus" ) === false ) {
						$( "span", $( this ) ).css( "display", "inline" );
						$( "select", $( this ) ).hide( );
					}
				} );				
					
				$( "select", $( that ).parent( ) ).css( "min-width", "10em" )
					.css( "display", "inline" )
					.on( "blur", function( ) {
						var that = this, newVal;
						setTimeout( function( ) {
							newVal = $( that ).val( );
							if ( oVar.isDirty === true ) {
								if( newVal.trim().length === 0 ){
									newVal = " ... ";
								}
								oVar[ that.name ] = $( that ).val( );

								$( "span", $( that ).parent( ) ).text( newVal );
								if( model !== undefined && $( that ).attr( "gadgetui-bind" ) === undefined ){	
									// if we have specified a model but no data binding, change the model value
									model.set( that.name, oVar[ that.name ] );
								}
	
								oVar.isDirty = false;
								if( emitEvents === true ){
									$( that )
										.trigger( "gadgetui-input-change", [ oVar ] );
								}
								if( func !== undefined ){
									func( oVar );
								}
							}
							$( "span", $( that ).parent( ) ).css( "display", "inline" );
							$( that ).hide( );
						}, 100 );
					})
					.on( "change", function( e ) {
						var that = this, value = e.target.value;
						if( value.trim().length === 0 ){
							value = " ... ";
						}
						oVar.isDirty = true;
						$( "span", $( that ).parent( ) ).text( value );
						})					
					.on( "keyup", function( event ) {
						var that = this;
						if ( parseInt( event.keyCode, 10 ) === 13 ) {
							$( that ).blur( );
						}
					});
			});
		}
		return this;
	}
	
	SelectInput.prototype.config = function( args ){
		var that = this;
		that.model =  (( args.model === undefined) ? that.model : args.model );
		that.func = (( args.func === undefined) ? undefined : args.func );
		that.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	};
		
	
	return{
		TextInput: TextInput,
		SelectInput: SelectInput
	};
}(jQuery));
gadgetui.util = ( function(){

	return{
		split: function( val ) {
			return val.split( /,\s*/ );
		},
		extractLast: function( term ) {
			return this.split( term ).pop();
		},
		getNumberValue: function( pixelValue ){
			return Number( pixelValue.substring( 0, pixelValue.length - 2 ) );
		},

		getRelativeParentOffset: function( selector ){
			var i,
				parents = selector.parentsUntil( "body" ),
				relativeOffsetLeft = 0,
				relativeOffsetTop = 0;

			for( i = 0; i < parents.length; i++ ){
				if( $( parents[ i ] ).css( "position" ) === "relative" ){
					// set the largest offset values of the ancestors
					if( $( parents[ i ] ).offset().left > relativeOffsetLeft ){
						relativeOffsetLeft = $( parents[ i ] ).offset().left;
					}
					
					if( $( parents[ i ] ).offset().top > relativeOffsetTop ){
						relativeOffsetTop = $( parents[ i ] ).offset().top;
					}
				}
			}
			return { left: relativeOffsetLeft, top: relativeOffsetTop };
		},
		Id: function(){
			return ( (Math.random() * 100).toString() ).replace(  /\./g, "" );
		},
		bind : function( selector, model ){
			var bindVar = $( selector ).attr( "gadgetui-bind" );
			// if binding was specified, make it so
			if( bindVar !== undefined && model !== undefined ){
				model.bind( bindVar, $( selector ) );
			}
		},
		encode : function( input, options ){
			var result, canon = true, encode = true, encodeType = 'html';
			if( options !== undefined ){
				canon = ( options.canon === undefined ? true : options.canon );
				encode = ( options.encode === undefined ? true : options.encode );
				//enum (html|css|attr|js|url)
				encodeType = ( options.encodeType === undefined ? "html" : options.encodeType );
			}
			if( canon ){
				result = $.encoder.canonicalize( input );
			}
			if( encode ){
				switch( encodeType ){
					case "html":
						result = $.encoder.encodeForHTML( result );
						break;
					case "css":
						result = $.encoder.encodeForCSS( result );
						break;
					case "attr":
						result = $.encoder.encodeForHTMLAttribute( result );
						break;
					case "js":
						result = $.encoder.encodeForJavascript( result );
						break;
					case "url":
						result = $.encoder.encodeForURL( result );
						break;				
				}
				
			}
			return result;
		},
		mouseCoords : function(ev){
			// from http://www.webreference.com/programming/javascript/mk/column2/
			if(ev.pageX || ev.pageY){
				return {x:ev.pageX, y:ev.pageY};
			}
			return {
				x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
				y:ev.clientY + document.body.scrollTop  - document.body.clientTop
			};
		},
		mouseWithin : function( selector, coords ){
			var rect = selector[0].getBoundingClientRect();
			return ( coords.x >= rect.left && coords.x <= rect.right && coords.y >= rect.top && coords.y <= rect.bottom ) ? true : false;
		}
		
	};
} ());	