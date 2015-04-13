function TextInput( args ){
	var self = this, val, ph, o, bindVar, lineHeight, minHeight, borderSize, paddingLeft, input, font;
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

		self.maxWidth = $( obj ).parent().width();
		
		$( "input", $( obj ).parent() )
			.css( "max-width", self.maxWidth );

		$( obj ).parent()
			.css( "min-height", lineHeight );
		input = $( "input[class!='gadgetui-inputlabelinput']", $( obj ).parent() );
		font = input.css( "font-size" ) + " " + input.css( "font-family" );
		$( "input[class='gadgetui-inputlabelinput']", $( obj ).parent()  )
			.css( "font-size", $( obj ).css( "font-size" ) )
			.css( "width", $.gadgetui.textWidth( input.val(), font ) + 10 )
			.css( "border", "1px solid transparent" );

		$( "div[class='gadgetui-inputlabel']", $( obj ).parent() )
			.css( "height", lineHeight )
			.css( "padding-left", "2px" )
			.css( "font-size", $( obj ).css( "font-size" ) )
			.css( "display", "block" );

		_bindTextInput( $( obj ).parent(), self, o );
	});

	function _bindTextInput( obj, txtInput, object ) {
		var self = this, oVar, 
			labeldiv = $( "div[class='gadgetui-inputlabel']", obj ),
			label = $( "input", labeldiv ),
			input = $( "input[class!='gadgetui-inputlabelinput']", obj ),
			span = $( "span", obj ),
			font = obj.css( "font-size" ) + " " + obj.css( "font-family" );
		oVar = ( (object === undefined) ? {} : object );

		obj
			.on( "mouseleave", function( ) {
				if( input.is( ":focus" ) === false ) {
					labeldiv.css( "display", "block" );
					input.hide( );
					//
					$( "input", $( obj ).parent() )
						.css( "max-width",  txtInput.maxWidth );					
				}
			});		
		
		labeldiv
			.on( txtInput.activate, function( ) {
				self = this;
				$( self ).hide();
				
				// both input and label
				
				$( "input", obj )
					.css( "max-width",  "" )
					.css( "min-width", "10em" )
					.css( "width", $.gadgetui.textWidth( input.val(), font ) + 10 );

				//just input
				input.css( "display", "block" );
					
				// if we are only showing the input on click, focus on the element immediately
				if( txtInput.activate === "click" ){
					input.focus();
				}
			});
		input
			.on( "blur", function( ) {
				var self = this, newVal, txtWidth, labelText;
				setTimeout( function( ) {
					newVal = $( self ).val( );
					if ( oVar.isDirty === true ) {
						if( newVal.length === 0 && $( self ).attr( "placeholder" ) !== undefined ){
							newVal = $( self ).attr( "placeholder" );
						}
						oVar[ self.name ] = $( self ).val( );
						
						txtWidth = $.gadgetui.textWidth( newVal, font );
						labelText = $.gadgetui.fitText( newVal, font, txtInput.maxWidth );
						label.val( labelText );
						//span.text( newVal );
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
					
					label.css( "display", "block" );
					labeldiv.css( "display", "block" );
					//$( "img", $( self ).parent( ) ).hide( );


					
					$( "input", $( obj ).parent() )
						.css( "max-width",  txtInput.maxWidth );
					
					$( self ).hide( );
		
				}, 200 );
			})
			.on( "keyup", function( event ) {
				var self = this;
				if ( parseInt( event.keyCode, 10 ) === 13 ) {
					$( self ).blur( );
				}
				$( "input", obj )
					.css( "width", $.gadgetui.textWidth( input.val(), font ) + 10 );
			})	
			.on( "change", function( e ) {
				var value = e.target.value;
				if( value.trim().length === 0 ){
					value = " ... ";
				}
				oVar.isDirty = true;
				label.val( value );
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
