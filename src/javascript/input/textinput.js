function TextInput( selector, options ){
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	this.config( options );

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );

	this.setInitialValue();
	//this.addClass();
	this.addControl();
	this.setLineHeight();
	this.setFont();
	this.setMaxWidth();
	this.setWidth();
	this.addCSS();

	this.addBindings();
}

TextInput.prototype.addControl = function(){
	this.wrapper = document.createElement( "div" );
	this.labelDiv = document.createElement( "div" );
	this.inputDiv = document.createElement( "div" );
	this.label = document.createElement( "input" );
	
	this.label.setAttribute( "type", "text" );
	this.label.setAttribute( "data-active", "false" );
	this.label.setAttribute( "readonly", "true" );
	this.label.setAttribute( "value", this.value );
	this.labelDiv.appendChild( this.label );
	
	this.selector.parentNode.insertBefore( this.wrapper, this.selector );
	this.selector.parentNode.removeChild( this.selector );
	
	this.inputDiv.appendChild( this.selector );
	this.wrapper.appendChild( this.inputDiv );
	this.selector.parentNode.parentNode.insertBefore( this.labelDiv, this.inputDiv );

	this.wrapper = this.selector.parentNode.parentNode;
	this.labelDiv = this.wrapper.childNodes[0];
	this.label = this.labelDiv.childNodes[0];
	this.inputDiv = this.wrapper.childNodes[1];
	
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
	// minimum height
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function(){
	var style = gadgetui.util.getStyle( this.selector ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		this.font = font;
};

TextInput.prototype.setWidth = function(){
	var style = gadgetui.util.getStyle( this.selector );
	this.width = gadgetui.util.textWidth( this.selector.value, style ) + 10;
	if( this.width === 10 ){
		this.width = this.minWidth;
	}
};

TextInput.prototype.setMaxWidth = function(){
	var parentStyle = gadgetui.util.getStyle( this.selector.parentNode.parentNode );
	this.maxWidth = gadgetui.util.getNumberValue( parentStyle.width );
};

TextInput.prototype.addCSS = function(){
	var style = gadgetui.util.getStyle( this.selector ),
		css = gadgetui.util.setStyle;
	// add CSS classes
	gadgetui.util.addClass( this.selector, "gadgetui-textinput" );
	gadgetui.util.addClass( this.wrapper, "gadgetui-textinput-div" );
	gadgetui.util.addClass( this.labelDiv, "gadgetui-inputlabel" );
	gadgetui.util.addClass( this.label, "gadgetui-inputlabelinput" );
	gadgetui.util.addClass( this.inputDiv, "gadgetui-inputdiv" );
	css( this.label, "background", "none" );
	css( this.label, "padding-left", "4px" );
	css( this.label, "border", " 1px solid transparent" );
	css( this.label, "width", this.width + "px" );
	css( this.label, "font-family", style.fontFamily );
	css( this.label, "font-size", style.fontSize );
	css( this.label, "font-weight", style.fontWeight );
	css( this.label, "font-variant", style.fontVariant );
	
	css( this.label, "max-width", "" );
	css( this.label, "min-width", this.minWidth + "px" );
	
	if( this.lineHeight > 20 ){
		// add min height to label div as well so label/input isn't offset vertically
		css( this.wrapper, "min-height", this.lineHeight + "px" );
		css( this.labelDiv, "min-height", this.lineHeight + "px" );
		css( this.inputDiv, "min-height", this.lineHeight + "px" );
	}	
	
	css( this.labelDiv, "height", this.lineHeight + "px" );
	css( this.labelDiv, "font-size", style.fontSize );
	css( this.labelDiv, "display", "block" );
	
	css( this.inputDiv, "height", this.lineHeight + "px" );
	css( this.inputDiv, "font-size", style.fontSize );
	css( this.inputDiv, "display", "block" );	
	

	css( this.selector, "padding-left", "4px" );
	css( this.selector, "border", "1px solid " + this.borderColor );
	css( this.selector, "font-family", style.fontFamily );
	css( this.selector, "font-size", style.fontSize );
	css( this.selector, "font-weight", style.fontWeight );
	css( this.selector, "font-variant", style.fontVariant );
	
	css( this.selector, "width", this.width + "px" );
	css( this.selector, "min-width", this.minWidth + "px" );	

	this.selector.setAttribute( "placeholder", this.value );
	css( this.inputDiv, "display", 'none' );

	if( this.maxWidth > 10 && this.enforceMaxWidth === true ){
		css( this.label, "max-width", this.maxWidth );
		css( this.selector, "max-width", this.maxWidth );

		if( this.maxWidth < this.width ){
			this.label.value = gadgetui.util.fitText( this.value, this.font, this.maxWidth );
		}
	}
};

TextInput.prototype.setControlWidth = function( text ){
	
	var style = gadgetui.util.getStyle( this.selector ),
		textWidth = parseInt( gadgetui.util.textWidth(text, style ), 10 ),
		css = gadgetui.util.setStyle;
	if( textWidth < this.minWidth ){
		textWidth = this.minWidth;
	}
	css( this.selector, "width", ( textWidth + 30 ) + "px" );
	css( this.label, "width", ( textWidth + 30 ) + "px" );	
};

TextInput.prototype.addBindings = function(){
	var that = this;

	// setup mousePosition
	if( gadgetui.mousePosition === undefined ){
		document
			.addEventListener( "mousemove", function(ev){ 
				ev = ev || window.event; 
				gadgetui.mousePosition = gadgetui.util.mouseCoords(ev); 
			});
	}

	this.label
		//.off( that.activate )
		.addEventListener( that.activate, function( ) {
			if( that.useActive && ( that.label.getAttribute( "data-active" ) === "false" || that.label.getAttribute( "data-active" ) === undefined ) ){
				that.label.setAttribute( "data-active", "true" );
			}else{
				setTimeout( 
					function(){
					var event, css = gadgetui.util.setStyle;
					if( gadgetui.util.mouseWithin( that.label, gadgetui.mousePosition ) === true ){
						// both input and label
						css( that.labelDiv, "display", 'none' );
						css( that.inputDiv, "display", 'block' );
						that.setControlWidth( that.selector.value );

						// if we are only showing the input on click, focus on the element immediately
						if( that.activate === "click" ){
							that.selector.focus();
						}
						if( that.emitEvents === true ){
							// raise an event that the input is active
							
							event = new Event( "gadgetui-input-show" );
							that.selector.dispatchEvent( event );
						}
					}}, that.delay );
			}
		});

	this.selector
		.addEventListener( "focus", function(e){
			e.preventDefault();
		});

	this.selector
		.addEventListener( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				this.blur();
			}
			that.setControlWidth( this.value );
		});

	this.selector
		.addEventListener( "change", function( event ) {
			setTimeout( function( ) {
				var value = event.target.value, style, txtWidth;
				if( value.length === 0 && that.selector.getAttribute( "placeholder" ) !== undefined ){
					value = that.selector.getAttribute( "placeholder" );
				}

				style = gadgetui.util.getStyle( that.selector );
				txtWidth = gadgetui.util.textWidth( value, style );

				if( that.maxWidth < txtWidth ){
					value = gadgetui.util.fitText( value, that.font, that.maxWidth );
				}
				that.label.value = value;
				if( that.model !== undefined && that.selector.getAttribute( "gadgetui-bind" ) === undefined ){	
					// if we have specified a model but no data binding, change the model value
					that.model.set( that.selector.name, event.target.value );
				}

				if( that.emitEvents === true ){
					gadgetui.util.trigger( that.selector, "gadgetui-input-change", { text: event.target.value } );
				}

				if( that.func !== undefined ){
					that.func( { text: event.target.value } );
				}				
			}, 200 );
		});
	
	this.selector
		//.removeEventListener( "mouseleave" )
		.addEventListener( "mouseleave", function( ) {
			var css = gadgetui.util.setStyle;
			if( this !== document.activeElement ){
				css( that.labelDiv, "display", "block" );
				css( that.inputDiv, "display", "none" );
				css( that.label, "maxWidth", that.maxWidth );				
			}
		});

	this.selector
		.addEventListener( "blur", function( ) {
			var css = gadgetui.util.setStyle;
			css( that.inputDiv, "display", 'none' );
			css( that.labelDiv, "display", 'block' );
			that.label.setAttribute( "data-active", "false" );
			css( that.selector, "maxWidth", that.maxWidth );
			css( that.label, "maxWidth", that.maxWidth );
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
	this.minWidth = (( options.minWidth === undefined) ? 100 : options.minWidth );
	this.enforceMaxWidth = ( options.enforceMaxWidth === undefined ? false : options.enforceMaxWidth );
};