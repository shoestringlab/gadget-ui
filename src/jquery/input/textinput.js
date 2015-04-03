function TextInput( args ){
	var self = this, val, ph, o, bindVar, lineHeight, minHeight, borderSize, paddingLeft;
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
		$( obj ).parent().prepend( "<div class='gadgetui-inputlabel'><input type='text' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + val + "'></div>");
		$( obj ).hide();

		lineHeight = $( obj ).css( "height" );

		$( obj ).parent().css( "min-height", lineHeight );

		$( "input[class='gadgetui-inputlabelinput']", $( obj ).parent()  )
			.css( "font-size", $( obj ).css( "font-size" ) )
			.css( "width", Math.round( $( "input[class!='gadgetui-inputlabelinput']", $( obj ).parent() ).val().length * 0.66 ) + "em" )
			.css( "border", "1px solid transparent" );

		$( "div[class='gadgetui-inputlabel']", $( obj ).parent() )
			.css( "height", lineHeight )
			.css( "padding-left", "2px" )
			.css( "font-size", $( obj ).css( "font-size" ) )
			.css( "display", "block" );

		_bindTextInput( $( obj ).parent(), self, o );
	});

	function _bindTextInput( obj, txtInput, object ) {
		var self = this, oVar;
		oVar = ( (object === undefined) ? {} : object );

		$( "div[class='gadgetui-inputlabel']", $( obj ) ).on( txtInput.activate, function( ) {
			self = this;
			$( $( self ) ).hide( );
			$( $( self ).parent( ) )
				.on( "mouseleave", function( ) {
					var self = this;
					if ( $( "input", obj ).is( ":focus" ) === false ) {
						$( "div[class='gadgetui-inputlabel']", $( self ) ).css( "display", "block" );
						$( "input[class!='gadgetui-inputlabelinput']", obj ).hide( );
					}
				});
			
			$( "input", obj )
				.css( "min-width", "10em" )
				.css( "width", Math.round( $( "input[class!='gadgetui-inputlabelinput']", $( self ).parent() ).val().length * 0.66 ) + "em" )
			
			$( "input[class!='gadgetui-inputlabelinput']", obj )
				.css( "display", "block" )
				.on( "blur", function( ) {
					var self = this, newVal;
					setTimeout( function( ) {
						newVal = $( self ).val( );
						if ( oVar.isDirty === true ) {
							if( newVal.length === 0 && $( self ).attr( "placeholder" ) !== undefined ){
								newVal = $( self ).attr( "placeholder" );
							}
							oVar[ self.name ] = $( self ).val( );
							$( "div[class='gadgetui-inputlabel'] input", $( self ).parent( ) ).val( newVal );

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
						$( "div[class='gadgetui-inputlabel']", $( self ).parent( ) ).css( "display", "block" );
						$( "img", $( self ).parent( ) ).hide( );
						$( self ).hide( );

					}, 200 );
				})
				.on( "keyup", function( event ) {
					var self = this;
					if ( parseInt( event.keyCode, 10 ) === 13 ) {
						$( self ).blur( );
					}
					$( "input", obj )
						.css( "width", Math.round( $( "input[class!='gadgetui-inputlabelinput']", $( self ).parent( ) ).val( ).length * 0.66 ) + "em" );
				});
			// if we are only showing the input on click, focus on the element immediately
			if( txtInput.activate === "click" ){
				$( "input[class!='gadgetui-inputlabelinput']", obj ).focus();
			}
		});
		$( "input[class!='gadgetui-inputlabelinput']", obj )
			.on( "change", function( e ) {
				var self = this, value = e.target.value;
				if( value.trim().length === 0 ){
					value = " ... ";
				}
				oVar.isDirty = true;
				$( "div[class='gadgetui-inputlabel'] input", $( self ).parent( ) ).val( value );
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
