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
			obj.elem.trigger("change");
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
	function TextInput( args ){
		var self = this, val, ph, o, bindVar;
		self.emitEvents = true;
		self.model;
		self.func;

		if( args.el === undefined ){
			el = $( "input[gadgetui-textinput='true']", document );
		}else{
			el = args.el;
		}

		if( el.length === 1 && args.object !== undefined ){
			o = args.object;
		}

		if( args.config !== undefined ){
			self.config( args.config );
		}

		$.each( el,  function( index, obj ){
			val = $( obj ).val();
			ph = $( obj ).attr( "placeholder" );
			bindVar = $( obj ).attr( "gadgetui-bind" );
			// if binding was specified, make it so
			if( bindVar !== undefined && self.model !== undefined ){
				self.model.bind( bindVar, $( obj ) );
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
	
			_bindTextInput( $( obj ).parent(), self, o );
		});

		function _bindTextInput( obj, txtInput, object ) {
			var self = this, oVar;
			oVar = ( (object === undefined) ? {} : object );
			
			$( "span", $( obj ) ).on( txtInput.activate, function( ) {
				self = this;
				$( $( self ) ).hide( );
				$( $( self ).parent( ) )
					.on( "mouseleave", function( ) {
						var self = this;
						if ( $( "input", $( self ) ).is( ":focus" ) === false ) {
							$( "span", $( self ) ).css( "display", "inline" );
							$( "input", $( self ) ).hide( );
						}
					});
					$( "input", $( self ).parent( ) ).css( "min-width", "10em" )
					.css( "width", Math.round( $( "input", $( self ).parent() ).val().length * 0.66 ) + "em" )
					.css( "display", "inline" )
					.on( "blur", function( ) {
						var self = this, newVal;
						setTimeout( function( ) {
							newVal = $( self ).val( );
							if ( oVar.isDirty === true ) {
								if( newVal.length === 0 && $( self ).attr( "placeholder" ) !== undefined ){
									newVal = $( self ).attr( "placeholder" );
								}
								oVar[ self.name ] = $( self ).val( );
								$( "span", $( self ).parent( ) ).text( newVal );
	
								if( txtInput.model !== undefined && $( self ).attr( "gadgetui-bind" ) === undefined ){	
									// if we have specified a model but no data binding, change the model value
									txtInput.model.set( self.name, oVar[ self.name ] );
								}
	
								oVar.isDirty = false;
								if( txtInput.emitEvents === true ){
									$( self ).trigger( "gadgetui-input-change", [ oVar ] );
								}
								if( txtInput.func !== undefined ){
									txtInput.func( oVar );
								}
							}
							$( "span", $( self ).parent( ) ).css( "display", "inline" );
							$( "img", $( self ).parent( ) ).hide( );
							$( self ).hide( );
	
						}, 200 );
					})
					.on( "keyup", function( event ) {
						var self = this;
						if ( parseInt( event.keyCode, 10 ) === 13 ) {
							$( self ).blur( );
						}
						$( self ).css( "width", Math.round( $( "input", $( self ).parent( ) ).val( ).length * 0.66 ) + "em" );
					});
				// if we are only showing the input on click, focus on the element immediately
				if( txtInput.activate === "click" ){
					$( "input", $( self ).parent( ) ).focus();
				}
			});
			$( obj )
				.on( "change", function( e ) {
					var self = this, value = e.target.value;
					if( value.trim().length === 0 ){
						value = " ... ";
					}
					oVar.isDirty = true;
					$( "span", $( self ).parent( ) ).text( value );
					});			
		}
		return this;
	}
	
	TextInput.prototype.config = function( args ){
		var self = this;
		self.model =  (( args.model === undefined) ? self.model : args.model );
		self.func = (( args.func === undefined) ? undefined : args.func );
		self.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
		self.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );		
	};
	
	function SelectInput( args ){
		var self = this, val, ph, o, bindVar;
		self.emitEvents = true;
		self.model;
		self.func;

		if( args.el === undefined ){
			el = $( "select[gadgetui-selectinput='true']", document );
		}else{
			el = args.el;
		}

		if( el.length === 1 && args.object !== undefined ){
			o = args.object;
		}
		if( args.config !== undefined ){
			self.config( args.config );
		}
		$.each( el,  function( index, obj ){
			val = $( obj ).val();
			ph = $( obj ).attr( "placeholder" );
			bindVar = $( obj ).attr( "gadgetui-bind" );
			// if binding was specified, make it so
			if( bindVar !== undefined && self.model !== undefined ){
				self.model.bind( bindVar, $( obj ) );
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
	
			_bindSelectInput( $( obj ).parent(), self, o  );

		});

		function _bindSelectInput( obj, slctInput, object ) {
			var self = this, oVar;
			oVar = ( (object === undefined) ? {} : object );
			
			$( "span", $( obj ) ).on( slctInput.activate, function( ) {
				self = this;
				$( $( self ) ).hide( );
				
				$( $( this ).parent( ) ).on( "mouseleave", function( ) {
					if ( $( "select", $( this ) ).is( ":focus" ) === false && $( "input", $( this ).parent( ).parent( ) ).is( ":focus" ) === false ) {
						$( "span", $( this ) ).css( "display", "inline" );
						$( "select", $( this ) ).hide( );
					}
				} );				
					
				$( "select", $( self ).parent( ) ).css( "min-width", "10em" )
					.css( "display", "inline" )
					.on( "blur", function( ) {
						var self = this, newVal;
						setTimeout( function( ) {
							newVal = $( self ).val( );
							if ( oVar.isDirty === true ) {
								if( newVal.trim().length === 0 ){
									newVal = " ... ";
								}
								oVar[ self.name ] = $( self ).val( );

								$( "span", $( self ).parent( ) ).text( newVal );
								if( slctInput.model !== undefined && $( self ).attr( "gadgetui-bind" ) === undefined ){	
									// if we have specified a model but no data binding, change the model value
									slctInput.model.set( self.name, oVar[ self.name ] );
								}
	
								oVar.isDirty = false;
								if( emitEvents === true ){
									$( self )
										.trigger( "gadgetui-input-change", [ oVar ] );
								}
								if( slctInput.func !== undefined ){
									slctInput.func( oVar );
								}
							}
							$( "span", $( self ).parent( ) ).css( "display", "inline" );
							$( self ).hide( );
						}, 100 );
					})
				
					.on( "keyup", function( event ) {
						var self = this;
						if ( parseInt( event.keyCode, 10 ) === 13 ) {
							$( self ).blur( );
						}
					});
			});
			$( obj )			
				.on( "change", function( e ) {
					var self = this, value = e.target.value;
					if( value.trim().length === 0 ){
						value = " ... ";
					}
					oVar.isDirty = true;
					$( "span", $( self ).parent( ) ).text( value );
				});
		}
		return this;
	}


	SelectInput.prototype.config = function( args ){
		var self = this;
		self.model =  (( args.model === undefined) ? self.model : args.model );
		self.func = (( args.func === undefined) ? undefined : args.func );
		self.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
		self.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
		return self;
	};
		
	return{
		TextInput: TextInput,
		SelectInput: SelectInput
	};
}(jQuery));
gadgetui.display = (function($) {
	function CollapsiblePane( args ){
		var self = this, wrapper;
		self.selector = args.selector;
		if( args.config !== undefined ){
			self.config( args.config );
		}
		
		$( self.selector ).wrap( '<div class="collapsiblePane ui-corner-all ui-widget-content"></div>');
		wrapper = $( self.selector ).parent();
		//copy width from selector
		wrapper.css( "width", $( self.selector ).css( "width" ) );
		//now make the width of the selector 100% to fill the wrapper
		$( self.selector )
			.css( "width", "100%" )
			.css( "padding", self.padding );
		wrapper.prepend( '<div class="ui-widget-header ui-corner-all collapsiblePane-header">' + self.title + '<div><img src="' + self.path + 'img/collapse.png"/></div></div>');
		$( "div div img", wrapper )
			.on( "click", function(){
				var img = this;
				var icon = ( ( self.selector.css( "display" ) === "none" ) ? "collapse" : "expand" );
				self.selector
					.css( "padding", self.padding )
					.css( "padding-top", self.paddingTop )
					.toggle( 'blind', {}, 200, function(  ) {
						$( img ).attr( "src", self.path + "img/" + icon + ".png");
						$( this ).css( "padding", self.padding );
					});
			});
	}

	CollapsiblePane.prototype.config = function( args ){
		this.title = ( args.title === undefined ? "": args.title );
		this.path = ( args.path === undefined ? "/bower_components/gadget-ui/dist/": args.path );
		this.padding = ( args.padding === undefined ? ".5em": args.padding );
		this.paddingTop = ( args.paddingTop === undefined ? ".3em": args.paddingTop ); 
	};

	return{
		CollapsiblePane: CollapsiblePane,
	};
}(jQuery));
