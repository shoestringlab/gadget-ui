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
	//this.setMaxWidth();
	this.setWidth();
	this.addCSS();
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	if( this.hideable ){
		// bind to the model if binding is specified
		gadgetui.util.bind( this.label, this.model );
	}
	this.addBindings();
}

TextInput.prototype.addControl = function(){
	this.wrapper = document.createElement( "div" );
	this.inputDiv = document.createElement( "div" );

	if( this.hideable ){
		this.labelDiv = document.createElement( "div" );
		this.label = document.createElement( "input" );
		this.label.setAttribute( "type", "text" );
		this.label.setAttribute( "data-active", "false" );
		this.label.setAttribute( "readonly", "true" );
		this.label.setAttribute( "value", this.value );
		this.label.setAttribute( "gadgetui-bind", this.selector.getAttribute( "gadgetui-bind" ) );
		this.labelDiv.appendChild( this.label );
	}

	this.selector.parentNode.insertBefore( this.wrapper, this.selector );
	this.selector.parentNode.removeChild( this.selector );

	this.inputDiv.appendChild( this.selector );
	this.wrapper.appendChild( this.inputDiv );
	if( this.hideable ){
		this.selector.parentNode.parentNode.insertBefore( this.labelDiv, this.inputDiv );
		this.labelDiv = this.wrapper.childNodes[0];
		this.label = this.labelDiv.childNodes[0];
		this.inputDiv = this.wrapper.childNodes[1];
	}else{
		this.inputDiv = this.wrapper.childNodes[0];
	}
	this.wrapper = this.selector.parentNode.parentNode;
};

TextInput.prototype.setInitialValue = function(){
	var val = this.selector.value,
		ph = this.selector.getAttribute( "placeholder" );

	if( val.length === 0 ){
		if( ph !== null && ph!== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}
	this.value = val;
};

TextInput.prototype.setLineHeight = function(){
	var lineHeight = this.selector.offsetHeight;
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function(){
	var style = gadgetui.util.getStyle( this.selector ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		this.font = font;
};

TextInput.prototype.setWidth = function(){
	this.width = gadgetui.util.textWidth( this.selector.value, this.font ) + 10;
	if( this.width === 10 ){
		this.width = this.maxWidth;
	}
};

/* TextInput.prototype.setMaxWidth = function(){
	var parentStyle = gadgetui.util.getStyle( this.selector.parentNode.parentNode );
	this.maxWidth = gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector.parentNode.parentNode ).width );
}; */

TextInput.prototype.addCSS = function(){
	var style = gadgetui.util.getStyle( this.selector ),
		css = gadgetui.util.setStyle;
	// add CSS classes
	gadgetui.util.addClass( this.selector, "gadgetui-textinput" );
	gadgetui.util.addClass( this.wrapper, "gadgetui-textinput-div" );
	gadgetui.util.addClass( this.inputDiv, "gadgetui-inputdiv" );

	if( this.hideable ){
		gadgetui.util.addClass( this.labelDiv, "gadgetui-inputlabel" );
		gadgetui.util.addClass( this.label, "gadgetui-inputlabelinput" );

		css( this.label, "width", this.width + "px" );
		css( this.label, "font-family", style.fontFamily );
		css( this.label, "font-size", style.fontSize );
		css( this.label, "font-weight", style.fontWeight );
		css( this.label, "font-variant", style.fontVariant );

		css( this.label, "max-width", "" );
		css( this.label, "min-width", this.minWidth + "px" );
	}

	if( this.lineHeight > 20 ){
		// add min height to label div as well so label/input isn't offset vertically
		css( this.wrapper, "min-height", this.lineHeight + "px" );
		if( this.hideable ) css( this.labelDiv, "min-height", this.lineHeight + "px" );
		css( this.inputDiv, "min-height", this.lineHeight + "px" );
	}
	if( this.hideable ){
		css( this.labelDiv, "height", this.lineHeight + "px" );
		css( this.labelDiv, "font-size", style.fontSize );
	}
	css( this.inputDiv, "height", this.lineHeight + "px" );
	css( this.inputDiv, "font-size", style.fontSize );

	css( this.selector, "padding-left", "4px" );
	css( this.selector, "border", "1px solid " + this.borderColor );
	css( this.selector, "font-family", style.fontFamily );
	css( this.selector, "font-size", style.fontSize );
	css( this.selector, "font-weight", style.fontWeight );
	css( this.selector, "font-variant", style.fontVariant );

	css( this.selector, "width", this.width + "px" );
	css( this.selector, "min-width", this.minWidth + "px" );

	this.selector.setAttribute( "placeholder", this.value );

	if( this.hideable ){
		css( this.labelDiv, "display", "block" );
		css( this.inputDiv, "display", "none" );
	}else{
		//css( this.labelDiv, "display", 'none' );
		css( this.inputDiv, "display", 'block' );
	}


	if( this.maxWidth > 10 && this.enforceMaxWidth === true ){
		if( this.hideable ) css( this.label, "max-width", this.maxWidth );
		css( this.selector, "max-width", this.maxWidth );

		if( this.maxWidth < this.width ){
			if( this.hideable ) this.label.value = gadgetui.util.fitText( this.value, this.font, this.maxWidth );
		}
	}
};

TextInput.prototype.setControlWidth = function( text ){
	var textWidth = parseInt( gadgetui.util.textWidth(text, this.font ), 10 ),
		css = gadgetui.util.setStyle;
	if( textWidth < this.minWidth ){
		textWidth = this.minWidth;
	}
	css( this.selector, "width", ( textWidth + 30 ) + "px" );
	if( this.hideable ) css( this.label, "width", ( textWidth + 30 ) + "px" );
};

TextInput.prototype.addBindings = function(){
	var _this = this;

	if( this.hideable ){
		this.label
			//.off( _this.activate )
			.addEventListener( _this.activate, function( ) {
				if( _this.useActive && ( _this.label.getAttribute( "data-active" ) === "false" || _this.label.getAttribute( "data-active" ) === undefined ) ){
					_this.label.setAttribute( "data-active", "true" );
				}else{
					setTimeout(
						function(){
						var event, css = gadgetui.util.setStyle;
						if( gadgetui.util.mouseWithin( _this.label, gadgetui.mousePosition ) === true ){
							// both input and label
							css( _this.labelDiv, "display", 'none' );
							css( _this.inputDiv, "display", 'block' );
							_this.setControlWidth( _this.selector.value );

							// if we are only showing the input on click, focus on the element immediately
							if( _this.activate === "click" ){
								_this.selector.focus();
							}
							if( _this.emitEvents === true ){
								// raise an event _this the input is active

								event = new Event( "gadgetui-input-show" );
								_this.selector.dispatchEvent( event );
							}
						}}, _this.delay );
				}
			});
	}

	this.selector
		.addEventListener( "focus", function(e){
			e.preventDefault();
		});

	this.selector
		.addEventListener( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				this.blur();
			}
			_this.setControlWidth( this.value );
		});

	this.selector
		.addEventListener( "change", function( event ) {
			setTimeout( function( ) {
				var value = event.target.value, style, txtWidth;
				if( value.length === 0 && _this.selector.getAttribute( "placeholder" ) !== undefined ){
					value = _this.selector.getAttribute( "placeholder" );
				}

				txtWidth = gadgetui.util.textWidth( value, _this.font );

				if( _this.maxWidth < txtWidth ){
					value = gadgetui.util.fitText( value, _this.font, _this.maxWidth );
				}
				if( this.hideable ) _this.label.value = value;
				if( _this.model !== undefined && _this.selector.getAttribute( "gadgetui-bind" ) === undefined ){
					// if we have specified a model but no data binding, change the model value
					_this.model.set( _this.selector.name, event.target.value );
				}

				if( _this.emitEvents === true ){
					gadgetui.util.trigger( _this.selector, "gadgetui-input-change", { text: event.target.value } );
				}

				if( _this.func !== undefined ){
					_this.func( { text: event.target.value } );
				}
			}, 200 );
		});

	if( this.hideable ){
		this.selector
			//.removeEventListener( "mouseleave" )
			.addEventListener( "mouseleave", function( ) {
				var css = gadgetui.util.setStyle;
				if( this !== document.activeElement ){
					css( _this.labelDiv, "display", "block" );
					css( _this.inputDiv, "display", "none" );
					css( _this.label, "maxWidth", _this.maxWidth );
				}
			});

		this.selector
			.addEventListener( "blur", function( ) {
				var css = gadgetui.util.setStyle;
				css( _this.inputDiv, "display", 'none' );
				css( _this.labelDiv, "display", 'block' );
				_this.label.setAttribute( "data-active", "false" );
				css( _this.selector, "maxWidth", _this.maxWidth );
				css( _this.label, "maxWidth", _this.maxWidth );
			});
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
	this.minWidth = (( options.minWidth === undefined) ? 100 : options.minWidth );
	this.enforceMaxWidth = ( options.enforceMaxWidth === undefined ? false : options.enforceMaxWidth );
	this.hideable = options.hideable || false;
	this.maxWidth = options.maxWidth || gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector.parentNode ).width );
};
