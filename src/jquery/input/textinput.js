
function TextInput( args ){
	var self = this, val, ph, o, bindVar, lineHeight, minHeight, maxWidth, width, borderSize, paddingLeft, input, style, parentStyle, font;
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

	$.each( el,  function( index, input ){
		// bind to the model if binding is specified
		_bindToModel( input, self.model );

		val = $( input ).val();
		ph = $( input ).attr( "placeholder" );
		$( input )
			.addClass( "gadgetui-textinput" );

		if( val.length === 0 ){
			if( ph !== undefined && ph.length > 0 ){
				val = ph;
			}else{
				val = " ... ";
			}
		}
		
		$( input ).wrap( "<div class='gadgetui-textinput-div'></div>");
		$( input ).parent().prepend( "<div class='gadgetui-inputlabel'><input type='text' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + val + "'></div>");
		$( input ).hide();

		lineHeight = $( input ).outerHeight();
		// minimum height
		if( lineHeight > 20 ){
			$( input ).parent()
				.css( "min-height", lineHeight );
		}

		style = window.getComputedStyle( $( input )[0] );
		parentStyle = window.getComputedStyle( $( input ).parent().parent()[0] );
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		width = $.gadgetui.textWidth( $( input ).val(), font ) + 10;
		//maxWidth = $( input ).parent().width();
		maxWidth = parentStyle.width;
		maxWidth = parseInt( maxWidth.substring( 0, maxWidth.length - 2 ), 10 );
		//console.log( val + ": " + "width: " + width + " maxWidth: " + maxWidth );
		
		if( maxWidth > 10 && self.enforceMaxWidth === true ){
			$( "input", $( input ).parent() )
				.css( "max-width", maxWidth );
			self.maxWidth = maxWidth;
			if( width === 10 ){
				width = maxWidth;
			}
			if( maxWidth < width ){
				$( "input[class='gadgetui-inputlabelinput']", $( input ).parent() )
					.val( $.gadgetui.fitText( val ), font, maxWidth );
			}
		}
		if( maxWidth > width ){
			width = maxWidth;
		}

		//input = $( "input[class!='gadgetui-inputlabelinput']", $( obj ).parent() );
		//font = $( input ).css( "font-size" ) + " " + $( input ).css( "font-family" );
		$( "input[class='gadgetui-inputlabelinput']", $( input ).parent()  )
			.css( "font-size", style.fontSize )
			//.css( "width", width )
			.css( "border", "1px solid transparent" );

		$( "div[class='gadgetui-inputlabel']", $( input ).parent() )
			.css( "height", lineHeight )
			.css( "padding-left", "2px" )
			.css( "font-size", $( input ).css( "font-size" ) )
			.css( "display", "block" );

		_bindTextInput( $( input ), self, o );
		//console.log( "rendered input" );
	});

	function _bindTextInput( input, txtInput, object ) {
		var self = this, oVar, 
			obj = $( input ).parent(),
			labeldiv = $( "div[class='gadgetui-inputlabel']", obj ),
			label = $( "input", labeldiv ),
			//input = $( "input[class~='gadgetui-textinput']", obj ),
			span = $( "span", obj ),
			font = obj.css( "font-size" ) + " " + obj.css( "font-family" );
		oVar = ( (object === undefined) ? {} : object );

		obj
			.off( "mouseleave" )
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
			.off( txtInput.activate )
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
			.off( "focus" )
			.on( "focus", function(e){
				e.preventDefault();
			});
		input
			.off( "blur" )
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
			});
		input
			.off( "keyup" )
			.on( "keyup", function( event ) {
				var self = this;
				if ( parseInt( event.keyCode, 10 ) === 13 ) {
					$( self ).blur( );
				}
				$( "input", obj )
					.css( "width", $.gadgetui.textWidth( input.val(), font ) + 10 );
			});
		input
			.off( "change" )
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
	self.enforceMaxWidth = ( args.enforceMaxWidth === undefined ? false : args.enforceMaxWidth );
};