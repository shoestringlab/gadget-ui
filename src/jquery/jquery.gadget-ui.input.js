gadgetui.input = (function($) {
	
	var _bindToModel = function( obj, model ){
		var bindVar = $( obj ).attr( "gadgetui-bind" );
		// if binding was specified, make it so
		if( bindVar !== undefined && model !== undefined ){
			model.bind( bindVar, $( obj ) );
		}
	};
	
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
			// bind to the model if binding is specified
			_bindToModel( obj, self.model );
			
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
			
			$( "span", $( obj.parent() ) )
				.css( "padding", ".3em" );
	
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
		var self = this, val, ph, o;
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
			// bind to the model if binding is specified
			_bindToModel( obj, self.model );

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
		
	function LookupListInput( args ){
		var self = this, index, obj, o;

		_renderLabel = function( item ){
			return item.label;
		};

		this.labelRenderer = _renderLabel;
		this.lookupList;
		this.emitEvents = true;
		this.model;

		if( args.el === undefined ){
			this.el = $( "input[gadgetui-lookuplist-input='true']", document );
		}else{
			this.el = args.el;
		}
		if( el.length === 1 && args.object !== undefined ){
			o = args.object;
		}
		if( args.config !== undefined ){
			self.config( args.config );
		}
		$.each( this.el,  function( index, obj ){
			val = $( obj ).val();
			// bind to the model if binding is specified
			_bindToModel( obj, self.model );

			$( obj ).wrap( '<div class="gadgetui-lookuplistinput-div ui-widget-content ui-corner-all" style="width:100%;"></div>');
	
			_bind( obj, self, o );

		});
		
		function _bind( obj, component, o ){
			var self = component;
			
			$( obj ).parent()
				.on( "click", function(){
					$( obj ).focus();
				})
				.on( "click", "div[class~='gadgetui-lookuplist-input-cancel']", function(e){
					self.remove( obj, $( e.target ).attr( "gadgetui-lookuplist-input-value" ) );
					//console.log( e );
				});
			
			$( obj )

			.on( "keydown", function( event ) {
				if ( event.keyCode === $.ui.keyCode.TAB && $( this ).data( "ui-autocomplete" ).menu.active ) {
					event.preventDefault( );
				}
			} ).autocomplete( {
				minLength : self.minLength,
				source : function( request, response ) {
					response( $.ui.autocomplete.filter( self.lookupList, gadgetui.util.extractLast( request.term ) ) );
				},

				focus : function( ) {
					// prevent value inserted on
					// focus
					return false;
				},
				select : function( event, ui ) {
					var recipient, returnValue, terms = gadgetui.util.split( this.value );
					// remove the current input
					terms.pop( );
					if( self.emitEvents === true ){
						$( this )
							.trigger( "gadgetui-lookuplistinput-add", [ ui.item ] );
					}
					if( self.model !== undefined ){
						//update the model 
					}
					self.add( this, ui.item );
					this.value = '';
					this.focus( );
					return false;
				}
			} ).on( "keydown", function( event ) {
				$( this ).css( "width", Math.round( ( $( this ).val( ).length * 0.66 ) + 3 ) + "em" );
		
				if ( event.keyCode === $.ui.keyCode.TAB && $( this ).data( "ui-autocomplete" ).menu.active ) {
					event.preventDefault( );
				}
				if ( event.keyCode === $.ui.keyCode.BACKSPACE && $( this ).val( ).length === 0 ) {
					event.preventDefault();
					var elem = $( this ).prev( "div[class~='gadgetui-lookuplist-input-item-wrapper']" );

					elem.remove( );
				}
			}).autocomplete( "instance" )._renderItem = function( ul, item ) {
				return $( "<li>" )
				.attr( "data-value", item.value )
				.append( $( "<a>" ).text( self.labelRenderer( item ) ) )
				.appendTo( ul );
			};			
		};
	}

	LookupListInput.prototype.add = function( el, item ){
		$( "<div class='gadgetui-lookuplist-input-item-wrapper'><div class='gadgetui-lookuplist-input-cancel ui-corner-all ui-widget-content' gadgetui-lookuplist-input-value='" + item.value + "'><div class='gadgetui-lookuplist-input-item'>" + this.labelRenderer( item ) + "</div></div></div>" )
			.insertBefore( el );
	};

	LookupListInput.prototype.remove = function( el, value ){
		$( "div[gadgetui-lookuplist-input-value='" + value + "']", $( el ).parent() ).remove();
	};

	LookupListInput.prototype.config = function( args ){
		var self = this;
		self.model =  (( args.model === undefined) ? self.model : args.model );
		self.labelRenderer = (( args.labelRenderer === undefined) ? self.labelRenderer : args.labelRenderer );
		self.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
		self.lookupList = (( args.lookupList === undefined) ? true : args.lookupList );
		self.minLength = (( args.minLength === undefined) ? 0 : args.minLength );
		return self;
	};

	return{
		TextInput: TextInput,
		SelectInput: SelectInput,
		LookupListInput: LookupListInput
	};
}(jQuery));