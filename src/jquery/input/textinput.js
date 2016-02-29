
function TextInput( selector, options ){
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	if( options !== undefined ){
		this.config( options );
	}

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );

	this.setInitialValue();
	this.addClass();
	this.addControl();
	this.setLineHeight();
	this.setFont();
	this.setMaxWidth();
	this.setWidth();
	this.addCSS();

	this.addBindings();
}

TextInput.prototype.addBindings = function(){

	var self = this, oVar, 
		obj = $( this.selector ).parent(),
		labeldiv = $( "div[class='gadgetui-inputlabel']", obj ),
		label = $( "input", labeldiv ),
		font = obj.css( "font-size" ) + " " + obj.css( "font-family" );
	oVar = ( (this.object === undefined) ? {} : this.object );

	$( this.selector )
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if( $( this ).is( ":focus" ) === false ) {
				labeldiv.css( "display", "block" );
				$( this ).hide();
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
				.css( "width", $.gadgetui.textWidth( $( self.selector ).val(), font ) + 10 );

			//just input
			$( self.selector ).css( "display", "block" );
				
			// if we are only showing the input on click, focus on the element immediately
			if( self.activate === "click" ){
				$( self.selector ).focus();
			}
		});
	$( this.selector )
		.off( "focus" )
		.on( "focus", function(e){
			e.preventDefault();
		});
	$( this.selector )
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
	$( this.selector )
		.off( "keyup" )
		.on( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				$( this ).blur( );
			}
			$( "input", obj )
				.css( "width", $.gadgetui.textWidth( $( this ).val(), font ) + 10 );
		});
	$( this.selector )
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

TextInput.prototype.addClass = function(){
	$( this.selector )
		.addClass( "gadgetui-textinput" );
};

TextInput.prototype.setInitialValue = function(){

	var val = $( this.selector ).val(),	
		ph = $( this.selector ).attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}

	this.value = val;
};

TextInput.prototype.addControl = function(){
	$( this.selector ).wrap( "<div class='gadgetui-textinput-div'></div>");
	$( this.selector ).parent().prepend( "<div class='gadgetui-inputlabel'><input type='text' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + this.value + "'></div>");
	$( this.selector ).hide();	
};

TextInput.prototype.setLineHeight = function(){
	var lineHeight = $( this.selector ).outerHeight();
	// minimum height
	if( lineHeight > 20 ){
		$( this.selector ).parent()
			.css( "min-height", lineHeight );
		// add min height to label div as well so label/input isn't offset vertically
		$( "div[class='gadgetui-inputlabel']", $( this.selector ).parent() )
			.css( "min-height", lineHeight );
	}
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function(){
	var style = window.getComputedStyle( $( this.selector )[0] ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		this.font = font;
};

TextInput.prototype.setWidth = function(){
	this.width = $.gadgetui.textWidth( $( this.selector ).val(), this.font ) + 10;
	if( this.width === 10 ){
		this.width = this.maxWidth;
	}
};

TextInput.prototype.setMaxWidth = function(){
	var parentStyle = window.getComputedStyle( $( this.selector ).parent().parent()[0] );
	this.maxWidth = gadgetui.util.getNumberValue( parentStyle.width );
};

TextInput.prototype.setBorderColor = function(){
	this.borderColor = window.getComputedStyle( $( this.selector )[0] ).borderBottomColor;
	
	/*	if( this.borderColor === undefined ){
		this.borderColor = style.borderBottomColor;
	}	*/
};

TextInput.prototype.addCSS = function(){
	
	$( "input[class='gadgetui-inputlabelinput']", $( this.selector ).parent()  )
		.css( "font-size", window.getComputedStyle( $( this.selector )[0] ).fontSize )
		.css( "padding-left", "4px" )
		.css( "border", "1px solid transparent" )
		.css( "width", this.width );

	$( "div[class='gadgetui-inputlabel']", $( this.selector ).parent() )
		.css( "height", this.lineHeight )
		
		.css( "font-size", $( this.selector ).css( "font-size" ) )
		.css( "display", "block" );	
	
	$( this.selector )
		.css( "padding-left", "4px" )
		.css( "border", "1px solid " + this.borderColor );

	if( this.maxWidth > 10 && this.enforceMaxWidth === true ){
		$( "input", $( this.selector ).parent() )
			.css( "max-width", this.maxWidth );

		if( this.maxWidth < this.width ){
			$( "input[class='gadgetui-inputlabelinput']", $( this.selector ).parent() )
				.val( $.gadgetui.fitText( this.value ), font, this.maxWidth );
		}
	}
};

TextInput.prototype.config = function( args ){
	this.borderColor =  (( args.borderColor === undefined) ? this.setBorderColor() : args.borderColor );
	this.model =  (( args.model === undefined) ? this.model : args.model );
	this.object = (( args.object === undefined) ? undefined : args.object );
	this.func = (( args.func === undefined) ? undefined : args.func );
	this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	this.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
	this.enforceMaxWidth = ( args.enforceMaxWidth === undefined ? false : args.enforceMaxWidth );
};