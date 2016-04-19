gadgetui.input = (function($) {
	function TextInput( args ){
		var _this = this, val, ph, o, bindVar;
		_this.emitEvents = true;
		_this.model;
		_this.func;

		if( args.el === undefined ){
			el = $( "input[gadgetui-textinput='true']", document );
		}else{
			el = args.el;
		}

		if( el.length === 1 && args.object !== undefined ){
			o = args.object;
		}
		if( args.config !== undefined ){
			_this.config( args.config );
		}
		$.each( el,  function( index, obj ){
			val = $( obj ).val();
			ph = $( obj ).attr( "placeholder" );
			bindVar = $( obj ).attr( "gadgetui-bind" );
			// if binding was specified, make it so
			if( bindVar !== undefined && _this.model !== undefined ){
				_this.model.bind( bindVar, $( obj ) );
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
	
			_bindTextInput( $( obj ).parent(), _this.emitEvents, _this.model, _this.func, o  );
		});

		function _bindTextInput( obj, emitEvents, model, func, object ) {
			var _this = this, oVar;
			oVar = ( (object === undefined) ? {} : object );
			
			$( "span", $( obj ) ).on( "mouseenter", function( ) {
				_this = this;
				$( $( _this ) ).hide( );
				$( $( _this ).parent( ) )
					.on( "mouseleave", function( ) {
						var _this = this;
						if ( $( "input", $( _this ) ).is( ":focus" ) === false ) {
							$( "span", $( _this ) ).css( "display", "inline" );
							$( "input", $( _this ) ).hide( );
						}
					} );
					$( "input", $( _this ).parent( ) ).css( "min-width", "10em" )
					.css( "width", Math.round( $( "input", $( _this ).parent() ).val().length * 0.66 ) + "em" )
					.css( "display", "inline" )
					.on( "blur", function( ) {
						var _this = this, newVal;
						setTimeout( function( ) {
							newVal = $( _this ).val( );
							if ( oVar.isDirty === true ) {
								if( newVal.length === 0 && $( _this ).attr( "placeholder" ) !== undefined ){
									newVal = $( _this ).attr( "placeholder" );
								}
								oVar[ _this.name ] = $( _this ).val( );
								$( "span", $( _this ).parent( ) ).text( newVal );
	
								if( model !== undefined && $( _this ).attr( "gadgetui-bind" ) === undefined ){	
									// if we have specified a model but no data binding, change the model value
									model.set( _this.name, oVar[ _this.name ] );
								}
	
								oVar.isDirty = false;
								if( emitEvents === true ){
									$( _this )
										.trigger( "gadgetui-input-change", [ oVar ] );
								}
								if( func !== undefined ){
									func( oVar );
								}
							}
							$( "span", $( _this ).parent( ) ).css( "display", "inline" );
							$( "img", $( _this ).parent( ) ).hide( );
							$( _this ).hide( );
	
						}, 200 );
					})
					/*	.on( "change", function( e ) {
						var _this = this, value = e.target.value;
						if( value.trim().length === 0 ){
							value = " ... ";
						}
						oVar.isDirty = true;
						$( "span", $( _this ).parent( ) ).text( value );
						})		*/
					.on( "keyup", function( event ) {
						var _this = this;
						if ( parseInt( event.keyCode, 10 ) === 13 ) {
							$( _this ).blur( );
						}
						$( _this ).css( "width", Math.round( $( "input", $( _this ).parent( ) ).val( ).length * 0.66 ) + "em" );
					});
			});
			$( obj )
				.on( "change", function( e ) {
					var _this = this, value = e.target.value;
					if( value.trim().length === 0 ){
						value = " ... ";
					}
					oVar.isDirty = true;
					$( "span", $( _this ).parent( ) ).text( value );
					});			
		}
		return this;
	}
	
	TextInput.prototype.config = function( args ){
		var _this = this;
		_this.model =  (( args.model === undefined) ? _this.model : args.model );
		_this.func = (( args.func === undefined) ? undefined : args.func );
		_this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	};
	
	function SelectInput( args ){
		var _this = this, val, ph, o, bindVar;
		_this.emitEvents = true;
		_this.model;
		_this.func;

		if( args.el === undefined ){
			el = $( "select[gadgetui-selectinput='true']", document );
		}else{
			el = args.el;
		}

		if( el.length === 1 && args.object !== undefined ){
			o = args.object;
		}
		if( args.config !== undefined ){
			_this.config( args.config );
		}
		$.each( el,  function( index, obj ){
			val = $( obj ).val();
			ph = $( obj ).attr( "placeholder" );
			bindVar = $( obj ).attr( "gadgetui-bind" );
			// if binding was specified, make it so
			if( bindVar !== undefined && _this.model !== undefined ){
				_this.model.bind( bindVar, $( obj ) );
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
	
			_bindSelectInput( $( obj ).parent(), _this.emitEvents, _this.model, _this.func, o  );

		});

		function _bindSelectInput( obj, emitEvents, model, func, object ) {
			var _this = this, oVar;
			oVar = ( (object === undefined) ? {} : object );
			
			$( "span", $( obj ) ).on( "mouseenter", function( ) {
				_this = this;
				$( $( _this ) ).hide( );
				
				$( $( this ).parent( ) ).on( "mouseleave", function( ) {
					if ( $( "select", $( this ) ).is( ":focus" ) === false && $( "input", $( this ).parent( ).parent( ) ).is( ":focus" ) === false ) {
						$( "span", $( this ) ).css( "display", "inline" );
						$( "select", $( this ) ).hide( );
					}
				} );				
					
				$( "select", $( _this ).parent( ) ).css( "min-width", "10em" )
					.css( "display", "inline" )
					.on( "blur", function( ) {
						var _this = this, newVal;
						setTimeout( function( ) {
							newVal = $( _this ).val( );
							if ( oVar.isDirty === true ) {
								if( newVal.trim().length === 0 ){
									newVal = " ... ";
								}
								oVar[ _this.name ] = $( _this ).val( );

								$( "span", $( _this ).parent( ) ).text( newVal );
								if( model !== undefined && $( _this ).attr( "gadgetui-bind" ) === undefined ){	
									// if we have specified a model but no data binding, change the model value
									model.set( _this.name, oVar[ _this.name ] );
								}
	
								oVar.isDirty = false;
								if( emitEvents === true ){
									$( _this )
										.trigger( "gadgetui-input-change", [ oVar ] );
								}
								if( func !== undefined ){
									func( oVar );
								}
							}
							$( "span", $( _this ).parent( ) ).css( "display", "inline" );
							$( _this ).hide( );
						}, 100 );
					})
					.on( "change", function( e ) {
						var _this = this, value = e.target.value;
						if( value.trim().length === 0 ){
							value = " ... ";
						}
						oVar.isDirty = true;
						$( "span", $( _this ).parent( ) ).text( value );
						})					
					.on( "keyup", function( event ) {
						var _this = this;
						if ( parseInt( event.keyCode, 10 ) === 13 ) {
							$( _this ).blur( );
						}
					});
			});
		}
		return this;
	}
	
	SelectInput.prototype.config = function( args ){
		var _this = this;
		_this.model =  (( args.model === undefined) ? _this.model : args.model );
		_this.func = (( args.func === undefined) ? undefined : args.func );
		_this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	};
		
	
	return{
		TextInput: TextInput,
		SelectInput: SelectInput
	};
}(jQuery));