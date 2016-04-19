
function TextInput( selector, options ){
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	this.config( options );

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
	var _this = this, 
		obj = $( this.selector ).parent(),
		labeldiv = $( "div[class='gadgetui-inputlabel']", obj ),
		label = $( "input", labeldiv ),
		font = obj.css( "font-size" ) + " " + obj.css( "font-family" );


	// setup mousePosition
	if( gadgetui.mousePosition === undefined ){
		$( document )
			.on( "mousemove", function(ev){ 
				ev = ev || window.event; 
				gadgetui.mousePosition = gadgetui.util.mouseCoords(ev); 
			});
	}
	
	$( this.selector )
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if( $( this ).is( ":focus" ) === false ) {
				labeldiv.css( "display", "block" );
				$( this ).hide();
				$( "input", $( obj ).parent() )
					.css( "max-width",  _this.maxWidth );					
			}
		});		

	label
		.off( _this.activate )
		.on( _this.activate, function( ) {
			if( _this.useActive && ( label.attr( "data-active" ) === "false" || label.attr( "data-active" ) === undefined ) ){
				label.attr( "data-active", "true" );
			}else{
				setTimeout( 
					function(){
					if( gadgetui.util.mouseWithin( label, gadgetui.mousePosition ) === true ){
						// both input and label
						labeldiv.hide();
	
						$( "input", obj )
							.css( "max-width",  "" )
							.css( "min-width", "10em" )
							.css( "width", $.gadgetui.textWidth( $( _this.selector ).val(), font ) + 10 );
			
						//just input
						$( _this.selector ).css( "display", "block" );
							
						// if we are only showing the input on click, focus on the element immediately
						if( _this.activate === "click" ){
							$( _this.selector ).focus();
						}
						if( _this.emitEvents === true ){
							// raise an event _this the input is active
							$( _this.selector ).trigger( "gadgetui-input-show", _this.selector );
						}
					}}, _this.delay );
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
			var it = this;

			$( it ).hide( );
			label.css( "display", "block" );
			labeldiv.css( "display", "block" );
			label.attr( "data-active", "false" );
			//$( "img", $( _this ).parent( ) ).hide( );

			$( "input", $( obj ).parent() )
				.css( "max-width",  _this.maxWidth );
			
			if( _this.emitEvents === true ){
				$( it ).trigger( "gadgetui-input-hide", it );
			}	

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
			var it = this, newVal, txtWidth, labelText;
			setTimeout( function( ) {
				newVal = $( it ).val( );
					if( newVal.length === 0 && $( it ).attr( "placeholder" ) !== undefined ){
						newVal = $( it ).attr( "placeholder" );
					}
					
					txtWidth = $.gadgetui.textWidth( newVal, font );
					if( _this.maxWidth < txtWidth ){
						labelText = $.gadgetui.fitText( newVal, font, _this.maxWidth );
					}else{
						labelText = newVal;
					}
					label.val( labelText );
					if( _this.model !== undefined && $( it ).attr( "gadgetui-bind" ) === undefined ){	
						// if we have specified a model but no data binding, change the model value
						_this.model.set( it.name, oVar[ it.name ] );
					}
	
					if( _this.emitEvents === true ){
						$( it ).trigger( "gadgetui-input-change", { text: $( it ).val( ) } );
					}
					if( _this.func !== undefined ){
						_this.func( { text: $( it ).val( ) } );
					}
				
			}, 200 );
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
	$( this.selector ).parent().prepend( "<div class='gadgetui-inputlabel'><input type='text' data-active='false' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + this.value + "'></div>");
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
	var style = gadgetui.util.getStyle( $( this.selector )[0] ),
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
	var parentStyle = gadgetui.util.getStyle( $( this.selector ).parent().parent()[0] );
	this.maxWidth = gadgetui.util.getNumberValue( parentStyle.width );
};

TextInput.prototype.addCSS = function(){
	$( "input[class='gadgetui-inputlabelinput']", $( this.selector ).parent()  )
		.css( "font-size", gadgetui.util.getStyle( $( this.selector )[0] ).fontSize )
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
				.val( $.gadgetui.fitText( this.value ), this.font, this.maxWidth );
		}
	}
};

TextInput.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.borderColor =  (( options.borderColor === undefined) ? "#d0d0d0" : options.borderColor );
	this.useActive =  (( options.useActive === undefined) ? false : options.useActive );
	this.model =  (( options.model === undefined) ? this.model : options.model );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );
	this.delay = (( options.delay === undefined) ? 10 : options.delay );
	this.enforceMaxWidth = ( options.enforceMaxWidth === undefined ? false : options.enforceMaxWidth );
};