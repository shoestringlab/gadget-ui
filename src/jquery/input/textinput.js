function TextInput( selector, options ){
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	this.config( options );

	this.setInitialValue();
	this.addControl();
	this.setLineHeight();
	this.setFont();
	this.setMaxWidth();
	this.setWidth();
	this.addCSS();
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.label, this.model );
	this.addBindings();
}

TextInput.prototype.addControl = function(){
	this.selector.wrap( "<div class='gadgetui-inputdiv'></div>" );
	this.inputDiv = this.selector.parent();
	this.inputDiv.wrap( "<div class='gadgetui-textinput-div'></div>");
	this.wrapper = this.selector.parent().parent();
	this.wrapper.prepend( "<div class='gadgetui-inputlabel'><input type='text' data-active='false' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + this.value + "'></div>");
	this.labelDiv = $( "div[class='gadgetui-inputlabel']", this.wrapper );
	this.label = $( "input[class='gadgetui-inputlabelinput']", this.wrapper );
	this.label.attr( "gadgetui-bind", this.selector.attr( "gadgetui-bind" ) );
};

TextInput.prototype.setInitialValue = function(){
	var val = this.selector.val(),
		ph = this.selector.attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== null && ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}
	this.value = val;
};

TextInput.prototype.setLineHeight = function(){
	var lineHeight = this.selector.outerHeight();
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function(){
	var style = gadgetui.util.getStyle( this.selector ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		this.font = font;
};

TextInput.prototype.setWidth = function(){
	this.width = $.gadgetui.textWidth( this.selector.val(), this.font ) + 10;
	if( this.width === 10 ){
		this.width = this.maxWidth;
	}
};

TextInput.prototype.setMaxWidth = function(){
	var parentStyle = gadgetui.util.getStyle( this.selector.parent().parent() );
	this.maxWidth = gadgetui.util.getNumberValue( parentStyle.width );
};

TextInput.prototype.addCSS = function(){
	var style = gadgetui.util.getStyle( this.selector );
	this.selector
		.addClass( "gadgetui-textinput" );
	
	this.label
		.css( "background", "none" )
		.css( "padding-left", "4px" )
		.css( "border", " 1px solid transparent" )
		.css( "width", this.width )
		.css( "font-family", style.fontFamily )
		.css( "font-size", style.fontSize )
		.css( "font-weight", style.fontWeight )
		.css( "font-variant", style.fontVariant )
		
		.css( "max-width", "" )
		.css( "min-width", this.minWidth );
	
	if( this.lineHeight > 20 ){
		// add min height to label div as well so label/input isn't offset vertically
		this.wrapper
			.css( "min-height", this.lineHeight );
		this.labelDiv
		 	.css( "min-height", this.lineHeight );
		this.inputDiv
			.css( "min-height", this.lineHeight );
	}	
	
	this.labelDiv
		.css( "height", this.lineHeight )
		.css( "font-size", style.fontSize )
		.css( "display", "block" );
	
	this.inputDiv
		.css( "height", this.lineHeight )
		.css( "font-size", style.fontSize )
		.css( "display", "block" );	
	this.selector
		.css( "padding-left", "4px" )
		.css( "border", "1px solid " + this.borderColor )
		.css( "font-family", style.fontFamily )
		.css( "font-size", style.fontSize )
		.css( "font-weight", style.fontWeight )
		.css( "font-variant", style.fontVariant )
		
		.css( "width", this.width )
		.css( "min-width", this.minWidth );	

	this.selector.attr( "placeholder", this.value );
	this.inputDiv
		.css( "display", 'none' );

	if( this.maxWidth > 10 && this.enforceMaxWidth === true ){
		this.label
			.css( "max-width", this.maxWidth );
		this.selector
			.css( "max-width", this.maxWidth );

		if( this.maxWidth < this.width ){
			this.label.val( $.gadgetui.fitText( this.value, this.font, this.maxWidth ) );
		}
	}
};

TextInput.prototype.setControlWidth = function( text ){
	var textWidth = parseInt( $.gadgetui.textWidth( text, this.font ), 10 );
	if( textWidth < this.minWidth ){
		textWidth = this.minWidth;
	}
	this.selector.css( "width", ( textWidth + 30 ) );
	this.label.css( "width", ( textWidth + 30 ) );	
};

TextInput.prototype.addBindings = function(){
	var _this = this;

	this.label
		//.off( _this.activate )
		.on( _this.activate, function( event ) {
			if( _this.useActive && ( _this.label.attr( "data-active" ) === "false" || _this.label.attr( "data-active" ) === undefined ) ){
				_this.label.attr( "data-active", "true" );
			}else{
				setTimeout( 
					function(){
					var css = gadgetui.util.setStyle;
					//if( gadgetui.util.mouseWithin( _this.labelDiv, gadgetui.mousePosition ) ){
						// both input and label
						_this.labelDiv.css( "display", 'none' );
						_this.inputDiv.css( "display", 'block' );
						_this.setControlWidth( _this.selector.val() );

						// if we are only showing the input on click, focus on the element immediately
						if( _this.activate === "click" ){
							_this.selector.focus();
						}
						if( _this.emitEvents === true ){
							// raise an event _this the input is active
							
							//_this.selector.trigger( "gadgetui-input-show" );
							_this.selector.trigger( "gadgetui-input-show", _this.selector );
						}
					//}
					}, _this.delay );
			}
		});

	this.selector
		.on( "focus", function(e){
			e.preventDefault();
		});

	this.selector
		.on( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				this.blur();
			}
			_this.setControlWidth( this.value );
		});

	this.selector
		.on( "change", function( event ) {
			setTimeout( function( ) {
				var value = event.target.value, style, txtWidth;
				if( value.length === 0 && _this.selector.attr( "placeholder" ) !== undefined ){
					value = _this.selector.attr( "placeholder" );
				}

				txtWidth = $.gadgetui.textWidth( value, _this.font );

				if( _this.maxWidth < txtWidth ){
					value = $.gadgetui.fitText( value, _this.font, _this.maxWidth );
				}
				_this.label.val( value );
				if( _this.model !== undefined && _this.selector.attr( "gadgetui-bind" ) === undefined ){	
					// if we have specified a model but no data binding, change the model value
					_this.model.set( _this.selector.name, event.target.value );
				}

				if( _this.emitEvents === true ){
					_this.selector.trigger( "gadgetui-input-change", { text: event.target.value } );
				}

				if( _this.func !== undefined ){
					_this.func( { text: event.target.value } );
				}				
			}, 200 );
		});
	
	this.selector
		//.removeEventListener( "mouseleave" )
		.on( "mouseleave", function( ) {
			if( this !== document.activeElement ){
				_this.labelDiv.css( "display", "block" );
				_this.inputDiv.css( "display", "none" );
				_this.label.css( "maxWidth", _this.maxWidth );				
			}
		});

	this.selector
		.on( "blur", function( ) {
			_this.inputDiv.css( "display", 'none' );
			_this.labelDiv.css( "display", 'block' );
			_this.label.attr( "data-active", "false" );
			_this.selector.css( "maxWidth", _this.maxWidth );
			_this.label.css( "maxWidth", _this.maxWidth );
		});

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