
function ComboBox( selector, options ){

	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	if( options !== undefined ){
		this.config( options );
	}

	this.setSaveFunc();
	this.setDataProviderRefresh();
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	this.addControl();
	if( this.dataProvider.data === undefined ){
		this.dataProvider.refresh();
	}

	var it = this,

	promise = new Promise(
		function( resolve, reject ){
			it.getArrowWidth( resolve, reject );
		});
	promise
		.then( function(){
			it.addCSS();
		})
		.catch( function( message ){
			// use width of default icon
			it.arrowWidth = 22;
			console.log( message );
			it.addCSS();
		});

	this.addBehaviors();
	this.setValue( this.value );
}

ComboBox.prototype.addControl = function(){
	$( this.selector )
		.wrap( "<div class='gadgetui-combobox'></div>")
		.wrap( "<div class='gadgetui-combobox-selectwrapper'></div>")
		.parent().parent()
		.append( "<div class='gadgetui-combobox-inputwrapper'><input class='gadgetui-combobox-input' value='' name='custom' type='text' placeholder='" + this.newOption.key + "'/></div>" )
		.prepend( "<div class='gadgetui-combobox-label' data-id='" + this.id +  "'>" + this.text + "</div>");

	this.comboBox = $( this.selector ).parent().parent();
	this.input = $( "input[class='gadgetui-combobox-input']", this.combobox );
	this.label = $( "div[class='gadgetui-combobox-label']", this.comboBox );
	this.inputWrapper = $( "div[class='gadgetui-combobox-inputwrapper']", this.comboBox );
	this.selectWrapper = $( "div[class='gadgetui-combobox-selectwrapper']", this.comboBox );
	this.comboBox.css( "opacity", ".0" );
};

ComboBox.prototype.getArrowWidth = function( resolve, reject ){
	var self = this, 
		img = new Image();
		img.onload = function() {
			self.arrowWidth = this.width;
			resolve();
		};
		img.onerror = function(){
			reject( "Icon was not loaded." );
		};
		img.src = this.arrowIcon;
};

ComboBox.prototype.addCSS = function(){

	this.selector
		.addClass( "gadgetui-combobox-select" )
		.css( "width", this.width )
		.css( "border-radius", this.borderRadius )
		.css( "display", "inline" );
	
	this.comboBox
		.css( "position", "relative" );
	
	var rules,
		selectLeftPadding = 0,
		widthOffset = this.borderWidth + this.borderRadius, 
		leftOffset = this.borderWidth,
		styles = window.getComputedStyle(this.selector[0] ),
		wrapperStyles = window.getComputedStyle(this.selectWrapper[0] ),
		inputLeftOffset = 0,
		inputWidth = this.selector[0].clientWidth,
		selectMarginTop = 0,
		borderLeftWidth = Math.round( gadgetui.util.getNumberValue( wrapperStyles['border-left-width'] ) );
		//borderTopWidth = Math.round( gadgetui.util.getNumberValue( wrapperStyles['border-top-width'] ) ),
		//borderBottomWidth = Math.round( gadgetui.util.getNumberValue( wrapperStyles['border-bottom-width'] ) );

	console.log( "icon width: " + this.arrowWidth );
	widthOffset = leftOffset + this.arrowWidth;

	if( navigator.userAgent.match( /Chrome/ ) ){
		selectLeftPadding = this.borderRadius - this.borderWidth;
		leftOffset = this.borderRadius;
		widthOffset = this.borderRadius + this.arrowWidth;
		inputWidth = inputWidth + borderLeftWidth - widthOffset;
		selectMarginTop =  this.borderWidth;
	}else if( navigator.userAgent.match( /Firefox/) ){
		inputLeftOffset = this.borderRadius - this.borderWidth;
		inputWidth = inputWidth - widthOffset - inputLeftOffset;
	}

	this.comboBox
		.css( "font-size", styles.fontSize );
	//inputHeight = Math.floor( this.selector[0].clientHeight - borderTopWidth - borderBottomWidth ) - this.borderWidth;
	this.selector
		.css( "margin-top", selectMarginTop )
		.css( "border", 0 )
		//.css( "background-color", "none transparent" )
		.css( "margin-left", selectLeftPadding );
	
	this.selectWrapper
		.css( "background-color", this.backgroundColor )
		.css( "border", this.border )
		.css( "position", "absolute" )
		.css( "padding-bottom", "1px" )
		.css( "display", "inline" );

	this.inputWrapper
		.css( "position", "absolute" )
		.css( "top", this.borderWidth )
		.css( "left", leftOffset );	

	this.input
		.css( "display", "inline" )
		.css( "padding-left", inputLeftOffset )
		.css( "border", "0" )
		.css( "font-size", styles.fontSize )
		.css( "background-color", this.inputBackground )
		.css( "width", inputWidth );
		//.css( "height",  inputHeight );

	this.label
		.css( "position", "absolute" )
		.css( "left", this.borderRadius )
		.css( "top", this.borderWidth + this.borderWidth )
		.css( "font-family", styles.fontFamily )
		.css( "font-size", styles.fontSize )
		.css( "font-weight", styles.fontWeight );

	// add rules for arrow Icon
	//we're doing this programmatically so we can skin our arrow icon

	
	if( navigator.userAgent.match( /Firefox/) ){
		rules = {
				'background-image': 'url(' + this.arrowIcon + ')',
				'background-repeat': 'no-repeat',
				'background-position': 'right center'
				};
		
		if( this.scaleIconeHeight === true ){
			rules['background-size'] = this.arrowWidth + "px " + inputHeight + "px";
		}
		this.selectWrapper
			.addRule( rules, 0 );
	}

	rules = {
		'-webkit-appearance': 'none',
		'-moz-appearance': 'window',
		'background-image': 'url(' + this.arrowIcon + ')',
		'background-repeat': 'no-repeat',
		'background-position': 'right center'
	};
	
	if( this.scaleIconeHeight === true ){
		rules['background-size'] = this.arrowWidth + "px " + inputHeight + "px";
	}
	this.selector
		.addRule( rules, 0 );
	
	this.inputWrapper.hide();
	this.selectWrapper.hide();
	this.comboBox.css( "opacity", "1" );
};

ComboBox.prototype.setSelectOptions = function(){
	var self = this, key, value;

	$( self.selector )
		.empty();
	console.log( "append new option" );
	$( self.selector )
		.append( "<option value='" + self.newOption.value + "'>" + self.newOption.key + "</option>" );

	$.each( this.dataProvider.data, function( ix, obj ){
		key = obj.key;
		value = obj.value;
		if( value === undefined ){ 
			value = key; 
		}
		console.log( "append " + key );
		$( self.selector )
			.append( "<option value=" + value + ">" + key );
	});
};

ComboBox.prototype.find = function( text ){
	var ix;
	for( ix = 0; ix < this.dataProvider.data.length; ix++ ){
		if( this.dataProvider.data[ix].key === text ){
			return this.dataProvider.data[ix].value;
		}
	}
	return;
};

ComboBox.prototype.getText = function( value ){
	var ix, 
		compValue = parseInt( value, 10 );
	if( isNaN( compValue ) === true ){
		compValue = value;
	}
	for( ix = 0; ix < this.dataProvider.data.length; ix++ ){
		if( this.dataProvider.data[ix].value === compValue ){
			return this.dataProvider.data[ix].key;
		}
	}
	return;
};
ComboBox.prototype.showLabel = function(){
	this.label.css( "display", "inline-block" );
	this.selectWrapper.hide();
	this.inputWrapper.hide();
};

ComboBox.prototype.addBehaviors = function( obj ) {
	var self = this;
	// setup mousePosition
	if( gadgetui.mousePosition === undefined ){
		$( document )
			.on( "mousemove", function(ev){ 
				ev = ev || window.event; 
				gadgetui.mousePosition = gadgetui.util.mouseCoords(ev); 
			});
	}
	//if binding is enabled, bind the label to the model
	/*	if(  this.selector.attr( "gadgetui-bind" ) !== undefined ){
		gadgetui.model.bind( this.selector.attr( "gadgetui-bind" ), this.label );
	}	*/

	$( this.comboBox )
		.on( this.activate, function( ) {
			setTimeout( function( ) {
				if( self.label.css( "display" ) != "none" ){
					console.log( "combo mouseenter ");
					self.label.hide();
					self.selectWrapper.css( "display", "inline" );
		
					if( self.selector.prop('selectedIndex') <= 0 ) {
						self.inputWrapper.css( "display", "inline" );
					}
					self.selector
						.css( "display", "inline" );
				}
			}, self.delay );
		})
		.on( "mouseleave", function( ) {
			console.log( "combo mouseleave ");
			if ( self.selector.is( ":focus" ) === false && self.input.is( ":focus" ) === false ) {
				self.showLabel();
			}
		});

	self.input
		.on( "click", function( e ){
			console.log( "input click ");
		})
		.on( "keyup", function( event ) {
			console.log( "input keyup");
			if ( event.keyCode === 13 ) {
				var inputText =  gadgetui.util.encode( self.input.val() );
				self.handleInput( inputText );
			}
		})
		.on( "blur", function( ) {
			console.log( "input blur" );

			if( gadgetui.util.mouseWithin( self.selector, gadgetui.mousePosition ) === true ){
				self.inputWrapper.hide();
				self.selector.focus();
			}else{
				self.showLabel();
			}
		});

	this.selector
		.on( "mouseenter", function( ev ){
			self.selector.css( "display", "inline" );
		})
		.on( "click", function( ev ){
			console.log( "select click");
			ev.stopPropagation();
		})
		.on( "change", function( event ) {
			console.log( "select change");

			if( event.target.selectedIndex > 0 ){
				self.inputWrapper.hide();
				self.setValue( event.target[ event.target.selectedIndex ].value );
				/*	self.text = event.target[ event.target.selectedIndex ].label;
				self.value = event.target[ event.target.selectedIndex ].value;
				self.label.text( self.text );	*/
			}else{
				//var inputText =  gadgetui.util.encode( self.input.val() );
				self.inputWrapper.show();
				self.setValue( self.newOption.value );
				self.input.focus();

				/*	var text = inputText.length === 0 ? "..." : inputText;
				self.text = inputText;
				self.value = self.newOption.value;
				self.label.text( text  );	*/
				
			}
			
			console.log( "label:" + self.label.text() );
		})

		.on( "blur", function( event ) {
			console.log( "select blur ");
			event.stopPropagation();
			setTimeout( function( ) {
				if( self.input.is( ":focus" ) === false ){
					self.showLabel();
				}
			}, 200 );

		} );
	
	$( "option", this.selector )
		.on( "mouseenter", function( ev ){
			console.log( "option mouseenter" );
			if( self.selector.css( "display" ) !== "inline" ){
				self.selector.css( "display", "inline" );
			}
		});
};

ComboBox.prototype.handleInput = function( inputText ){
	var value = this.find( inputText );
	if( value !== undefined ){
		this.selector.val( value );
		this.label.text( inputText );
		this.selector.focus();
		this.input.val('');
		this.inputWrapper.hide();
	}
	else if ( value === undefined && inputText.length > 0 ) {
		this.save( inputText );
	}
};

ComboBox.prototype.setSaveFunc = function(){
	var self = this;

	if( $.isFunction( this.save ) === true ){
		var save = this.save;
		this.save = function( text ) {
			var that = this,
				func,  
				promise, 
				args = [ text ],
				value = this.find( text );
			if( value === undefined ){	
				console.log( "save: " + text );
				// trigger save event if we're triggering events 
				if( this.emitEvents === true ){
					this.selector.trigger( "save", text );
				}
				promise = new Promise(
						function( resolve, reject ){
							args.push( resolve );
							args.push( reject );
							func = save.apply(that, args);
							console.log( func );
						});
				promise.then(
						function( value ){
							var ev = new Event( "change", {
							    view: window,
							    bubbles: true,
							    cancelable: true
							  });
							self.input.val( "" );
							self.inputWrapper.hide();
							self.dataProvider.refresh();
							self.setValue( value );	
							self.selector[0].dispatchEvent( ev );
						});
			}
		    return func;
		};
	}
};

ComboBox.prototype.setValue = function( value ){
	var text = this.getText( value );
	console.log( "text:" + text );
	// value and text can only be set to current values in this.dataProvider.data, or to "New" value
	this.value = ( text === undefined ? this.newOption.value : value );
	text = ( text === undefined ? this.newOption.key : text );

	this.text = text;
	this.label.text( this.text );
	this.selector.val( this.value );
};

ComboBox.prototype.setDataProviderRefresh = function(){
	var self = this,
		refresh = this.dataProvider.refresh;
	this.dataProvider.refresh = function(){
		if( $.isFunction( refresh ) === true ){
			refresh.apply( this );
		}
		self.setSelectOptions();
	};
};

ComboBox.prototype.config = function( args ){
	this.model =  (( args.model === undefined) ? this.model : args.model );
	this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	this.data = (( args.data === undefined) ? [] : args.data );
	this.dataProvider = (( args.dataProvider === undefined) ? undefined : args.dataProvider );
	this.save = (( args.save === undefined) ? undefined : args.save );
	this.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
	this.delay = (( args.delay === undefined) ? 10 : args.delay );
	this.id = (( args.id === undefined) ? gadgetui.util.Id() : args.id );
	this.inputBackground = (( args.inputBackground === undefined) ? "#ffffff" : args.inputBackground );
	//this.arrowWidth = (( args.arrowWidth === undefined) ? 22 : args.arrowWidth );
	this.borderWidth = (( args.borderWidth === undefined) ? 1 : args.borderWidth );
	this.borderColor = (( args.borderColor === undefined) ? "silver" : args.borderColor );
	this.borderStyle = (( args.borderStyle === undefined) ? "solid" : args.borderStyle );
	this.borderRadius = (( args.borderRadius === undefined) ? 5 : args.borderRadius );
	this.border = this.borderWidth + "px " + this.borderStyle + " " + this.borderColor;
	this.width = (( args.width === undefined) ? 150 : args.width );
	this.newOption = (( args.newOption === undefined) ? { key: "...", value: 0 } : args.newOption );
	this.value = (( args.value === undefined) ? this.newOption.value : args.value );
	this.arrowIcon = (( args.arrowIcon === undefined) ? "/bower_components/gadget-ui/dist/img/icon_arrow.png" : args.arrowIcon );
	this.scaleIconeHeight = (( args.scaleIconeHeight === undefined) ? false : args.scaleIconeHeight );
	
};


