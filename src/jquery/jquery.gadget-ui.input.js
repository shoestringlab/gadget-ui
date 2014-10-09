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
									$( that ).trigger( "gadgetui-input-change", [ oVar ] );
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
				
					.on( "keyup", function( event ) {
						var that = this;
						if ( parseInt( event.keyCode, 10 ) === 13 ) {
							$( that ).blur( );
						}
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