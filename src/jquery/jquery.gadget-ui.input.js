
gadgetui.input = (function($) {
	function Input( args ){
		var that = this, val, ph;
		that.emitEvents = true;
		that.model;
		that.func;

		if( args.el === undefined ){
			el = $( ".gadget-ui-input", document );
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
			$( obj ).wrap( "<div class='gadget-ui-input-div'></div>");
			$( obj ).parent().prepend( "<span>" + val + "</span>");
			//$( obj ).append( "<a href='javascript:void(0)'><img src='img/recyclingcan_empty.png' height='25' style='display:none'/></a>" );
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