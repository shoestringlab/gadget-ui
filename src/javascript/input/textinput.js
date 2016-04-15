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
	//var fontSize = gadgetui.util.getStyle( this.selector, "font-size" );
	var style = gadgetui.util.getStyle( this.selector );
		//font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
	// add CSS classes
	gadgetui.util.addClass( this.selector, "gadgetui-textinput" );
	gadgetui.util.addClass( this.wrapper, "gadgetui-textinput-div" );
	gadgetui.util.addClass( this.labelDiv, "gadgetui-inputlabel" );
	gadgetui.util.addClass( this.label, "gadgetui-inputlabelinput" );
	gadgetui.util.addClass( this.inputDiv, "gadgetui-inputdiv" );
	this.label.setAttribute( "style", "background:none; padding-left: 4px; border: 1px solid transparent; width: " + this.width + "px; font-family: " + style.fontFamily + "; font-size: " + style.fontSize + "; font-weight: " +  style.fontWeight + "; font-variant: " + style.fontVariant );

	this.label.style.maxWidth = "";
	this.label.style.minWidth = this.minWidth + "px";
	
	if( this.lineHeight > 20 ){
		// add min height to label div as well so label/input isn't offset vertically
		this.wrapper.setAttribute( "style", "min-height: " + this.lineHeight + "px;" );
		this.labelDiv.setAttribute( "style", "min-height: " + this.lineHeight + "px;" );
		this.inputDiv.setAttribute( "style", "min-height: " + this.lineHeight + "px;" );
	}	
	
	this.labelDiv.setAttribute( "style", "height: " + this.lineHeight + "px; font-size: " + style.fontSize + "; display: block" );
	this.inputDiv.setAttribute( "style", "height: " + this.lineHeight + "px; font-size: " + style.fontSize + "; display: block" );
	if( this.selector.getAttribute( "style" ) === undefined ){
		this.selector.setAttribute( "style", "" );
	}
	this.selector.style.paddingLeft = "4px";
	this.selector.style.border = "1px solid " + this.borderColor;
	this.selector.style.fontFamily = style.fontFamily;
	this.selector.style.fontSize = style.fontSize;
	this.selector.style.fontWeight = style.fontWeight;
	this.selector.style.fontVariant = style.fontVariant;
	
	this.selector.style.width = this.width + "px";
	this.selector.style.minWidth = this.minWidth + "px";	

	this.selector.setAttribute( "placeholder", this.value );
	this.inputDiv.style.display = 'none';

	if( this.maxWidth > 10 && this.enforceMaxWidth === true ){
		this.label.style.maxWidth = this.maxWidth;
		this.selector.style.maxWidth = this.maxWidth;

		if( this.maxWidth < this.width ){
			this.label.value = gadgetui.util.fitText( this.value, this.font, this.maxWidth );
		}
	}
};

TextInput.prototype.setControlWidth = function( text ){
	var style = gadgetui.util.getStyle( this.selector ),
		textWidth = parseInt( gadgetui.util.textWidth(text, style ), 10 );
	if( textWidth < this.minWidth ){
		textWidth = this.minWidth;
	}
	this.selector.style.width = ( textWidth + 30 ) + "px";
	this.label.style.width = ( textWidth + 30 ) + "px";	
};

TextInput.prototype.addBindings = function(){
	var self = this, oVar, 
		//obj = this.selector.parentNode,
		//label = labeldiv.querySelector( "input" ),
		//font = gadgetui.util.getStyle( this.wrapper, "font-size" ) + " " + gadgetui.util.getStyle( this.wrapper, "font-family" );
	oVar = ( (this.object === undefined) ? {} : this.object );

	// setup mousePosition
	if( gadgetui.mousePosition === undefined ){
		document
			.addEventListener( "mousemove", function(ev){ 
				ev = ev || window.event; 
				gadgetui.mousePosition = gadgetui.util.mouseCoords(ev); 
			});
	}
	
	this.selector
		//.removeEventListener( "mouseleave" )
		.addEventListener( "mouseleave", function( ) {
			if( this !== document.activeElement ){
				self.labelDiv.style.display = "block";
				self.inputDiv.style.display = 'none';
				self.label.style.maxWidth = self.maxWidth;				
			}
		});
	this.selector
		.addEventListener( "focus", function(e){
			e.preventDefault();
		});
	this.selector
		.addEventListener( "blur", function( ) {
			var newVal, txtWidth, labelText;
			setTimeout( function( ) {
				newVal = self.selector.value;
				if ( oVar.isDirty === true ) {
					if( newVal.length === 0 && self.selector.getAttribute( "placeholder" ) !== undefined ){
						newVal = self.selector.getAttribute( "placeholder" );
					}
					oVar[ self.selector.name ] = self.selector.value;
					var style = gadgetui.util.getStyle( self.selector );
					txtWidth = gadgetui.util.textWidth( newVal, style );
					if( self.maxWidth < txtWidth ){
						labelText = gadgetui.util.fitText( newVal, self.font, self.maxWidth );
					}else{
						labelText = newVal;
					}
					self.label.value = labelText;
					if( self.model !== undefined && self.selector.getAttribute( "gadgetui-bind" ) === undefined ){	
						// if we have specified a model but no data binding, change the model value
						self.model.set( self.selector.name, oVar[ self.selector.name ] );
					}
	
					oVar.isDirty = false;
					if( self.emitEvents === true ){
						self.selector.dispatchEvent( "gadgetui-input-change", [ oVar ] );
					}
					if( self.func !== undefined ){
						self.func( oVar );
					}
				}
				self.inputDiv.style.display = 'none';
				self.labelDiv.style.display = 'block';
				self.label.setAttribute( "data-active", "false" );
				//input = self.wrapper.parentNode.querySelector( "input" );
				self.selector.style.maxWidth = self.maxWidth;
				self.label.style.maxWidth = self.maxWidth;
				
				if( self.emitEvents === true ){
					self.selector.dispatchEvent( new Event( "gadgetui-input-hide" ), self.selector );
				}	
			}, 200 );
		});
	this.selector
		.addEventListener( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				this.blur();
			}
			self.setControlWidth( this.value );
			//console.log( "width: " + gadgetui.util.textWidth( this.value, font ) + 10 );
		});
	this.selector
		.addEventListener( "change", function( e ) {
			var value = e.target.value;
			if( value.trim().length === 0 ){
				value = " ... ";
			}
			oVar.isDirty = true;
			self.label.value = value;
		});

	this.label
		//.off( self.activate )
		.addEventListener( self.activate, function( ) {
			if( self.useActive && ( self.label.getAttribute( "data-active" ) === "false" || self.label.getAttribute( "data-active" ) === undefined ) ){
				self.label.setAttribute( "data-active", "true" );
			}else{
				setTimeout( 
					function(){
					var event;
					if( gadgetui.util.mouseWithin( self.label, gadgetui.mousePosition ) === true ){
						// both input and label
						self.labelDiv.style.display = 'none';
						self.inputDiv.style.display = 'block';
						//input = self.wrapper.getElementsByTagName( "input" )[0];

						
						//self.label.style.width = gadgetui.util.textWidth( self.selector.value, self.font ) + 10;
						self.setControlWidth( self.selector.value );

						// if we are only showing the input on click, focus on the element immediately
						if( self.activate === "click" ){
							self.selector.focus();
						}
						if( self.emitEvents === true ){
							// raise an event that the input is active
							event = new Event( "gadgetui-input-show" );
							self.selector.dispatchEvent( event, self.selector );
						}
					}}, self.delay );
			}
		});

};

TextInput.prototype.config = function( args ){
	this.borderColor =  (( args.borderColor === undefined) ? "#d0d0d0" : args.borderColor );
	this.useActive =  (( args.useActive === undefined) ? false : args.useActive );
	this.model =  (( args.model === undefined) ? this.model : args.model );
	this.object = (( args.object === undefined) ? undefined : args.object );
	this.func = (( args.func === undefined) ? undefined : args.func );
	this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	this.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
	this.delay = (( args.delay === undefined) ? 10 : args.delay );
	this.minWidth = (( args.minWidth === undefined) ? 100 : args.minWidth );
	this.enforceMaxWidth = ( args.enforceMaxWidth === undefined ? false : args.enforceMaxWidth );
};