
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
	