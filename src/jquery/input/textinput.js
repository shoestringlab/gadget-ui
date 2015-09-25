
function TextInput( args ){
	var self = this, val, o, lineHeight;
	self.emitEvents = true;
	self.model;
	self.func;

	self.setElements( args.el );
	
	if( self.el.length === 1 && args.object !== undefined ){
		o = args.object;
	}

	if( args.config === undefined ){
		args.config = {};
	}
	self.config( args.config );
	
	$.each( self.el,  function( index, input ){
		// bind to the model if binding is specified
		_bindToModel( input, self.model );

		val = self.setInitialValue( input );
		self.addClass( input );
		self.addControl( input, val );
		lineHeight = self.setLineHeight( input );
		self.setWidth( input, val );
		self.addCSS( input, lineHeight );

		self.addBindings( $( input ), o );
	});

	return this;
}

TextInput.prototype.addBindings = function( input, object ){

	var self = this, oVar, 
		obj = $( input ).parent(),
		labeldiv = $( "div[class='gadgetui-inputlabel']", obj ),
		label = $( "input", labeldiv ),
		font = obj.css( "font-size" ) + " " + obj.css( "font-family" );
	oVar = ( (object === undefined) ? {} : object );

	input
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if( input.is( ":focus" ) === false ) {
				labeldiv.css( "display", "block" );
				input.hide();
				$( "input", $( obj ).parent() )
					.css( "max-width",  self.maxWidth );					
			}
		});		

	label
		.off( self.activate )
		.on( self.activate, function( ) {
			
			// both input and label
			labeldiv.hide();
			
			$( "input", obj )
				.css( "max-width",  "" )
				.css( "min-width", "10em" )
				.css( "width", $.gadgetui.textWidth( input.val(), font ) + 10 );

			//just input
			input.css( "display", "block" );
				
			// if we are only showing the input on click, focus on the element immediately
			if( self.activate === "click" ){
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
			var it = this, newVal, txtWidth, labelText;
			setTimeout( function( ) {
				newVal = $( it ).val( );
				if ( oVar.isDirty === true ) {
					if( newVal.length === 0 && $( it ).attr( "placeholder" ) !== undefined ){
						newVal = $( it ).attr( "placeholder" );
					}
					oVar[ it.name ] = $( it ).val( );
					
					txtWidth = $.gadgetui.textWidth( newVal, font );
					if( self.maxWidth < txtWidth ){
						labelText = $.gadgetui.fitText( newVal, font, self.maxWidth );
					}else{
						labelText = newVal;
					}
					label.val( labelText );
					if( self.model !== undefined && $( it ).attr( "gadgetui-bind" ) === undefined ){	
						// if we have specified a model but no data binding, change the model value
						self.model.set( it.name, oVar[ it.name ] );
					}
	
					oVar.isDirty = false;
					if( self.emitEvents === true ){
						$( it ).trigger( "gadgetui-input-change", [ oVar ] );
					}
					if( self.func !== undefined ){
						self.func( oVar );
					}
				}

				label.css( "display", "block" );
				labeldiv.css( "display", "block" );
				//$( "img", $( self ).parent( ) ).hide( );

				$( "input", $( obj ).parent() )
					.css( "max-width",  self.maxWidth );
				
				$( it ).hide( );
	
			}, 200 );
		});
	input
		.off( "keyup" )
		.on( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				$( this ).blur( );
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
};

TextInput.prototype.addClass = function( input ){
	$( input )
		.addClass( "gadgetui-textinput" );
};

TextInput.prototype.setInitialValue = function( input ){

	var val = $( input ).val(),	
		ph = $( input ).attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}

	return val;
};

TextInput.prototype.addControl = function( input, val ){
	$( input ).wrap( "<div class='gadgetui-textinput-div'></div>");
	$( input ).parent().prepend( "<div class='gadgetui-inputlabel'><input type='text' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + val + "'></div>");
	$( input ).hide();	
};

TextInput.prototype.setLineHeight = function( input ){
	var lineHeight = $( input ).outerHeight();
	// minimum height
	if( lineHeight > 20 ){
		$( input ).parent()
			.css( "min-height", lineHeight );
		// add min height to label div as well so label/input isn't offset vertically
		$( "div[class='gadgetui-inputlabel']", $( input ).parent() )
			.css( "min-height", lineHeight );
	}
};

TextInput.prototype.setWidth = function( input, val ){
	var style = window.getComputedStyle( $( input )[0] ),
		parentStyle = window.getComputedStyle( $( input ).parent().parent()[0] ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant,
		width = $.gadgetui.textWidth( $( input ).val(), font ) + 10,
		maxWidth = parentStyle.width; parseInt( parentStyle.width.substring( 0, parentStyle.width.length - 2 ), 10 );
	
	if( maxWidth > 10 && this.enforceMaxWidth === true ){
		$( "input", $( input ).parent() )
			.css( "max-width", maxWidth );
		this.maxWidth = maxWidth;
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
};

TextInput.prototype.addCSS = function( input, lineHeight ){
	
	$( "input[class='gadgetui-inputlabelinput']", $( input ).parent()  )
		.css( "font-size", window.getComputedStyle( $( input )[0] ).fontSize )
		.css( "border", "3px solid transparent" );

	$( "div[class='gadgetui-inputlabel']", $( input ).parent() )
		.css( "height", lineHeight )
		//.css( "padding-left", "2px" )
		.css( "font-size", $( input ).css( "font-size" ) )
		.css( "display", "block" );	
	
	$( input )
		.css( "border-width", "3px" );
};

TextInput.prototype.setElements = function( el ){

	if( el === undefined ){
		el = $( "input[gadgetui-textinput='true']", document );
	}
	this.el = el;
};

TextInput.prototype.config = function( args ){
	var self = this;
	self.model =  (( args.model === undefined) ? self.model : args.model );
	self.func = (( args.func === undefined) ? undefined : args.func );
	self.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	self.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
	self.enforceMaxWidth = ( args.enforceMaxWidth === undefined ? false : args.enforceMaxWidth );
};