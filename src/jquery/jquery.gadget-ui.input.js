gadgetui.input = (function($) {
	function Input( args ){
		var that = this, val, ph, o, bindVar;
		that.emitEvents = true;
		that.model;
		that.func;

		if( args.el === undefined ){
			el = $( "input[gadgetui-input='true']", document );
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
							$( "img", $( that ) ).hide( );
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
						var that = this;
						oVar.isDirty = true;
						$( "span", $( that ).parent( ) ).text( e.target.value );
						})
					.on( "keyup", function( event ) {
						var that = this;
						if ( parseInt( event.keyCode, 10 ) === 13 ) {
							$( that ).blur( );
						}
						$( that ).css( "width", Math.round( $( "input", $( that ).parent( ) ).val( ).length * 0.66 ) + "em" );
					});
				// show the trashcan icon
				$( "img", $( that ).parent( ) ).css( "display", "inline" );
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