function Bubble( selector, message, options ){
	this.selector = selector;
	this.message = message;
	this.config( options );
	this.render();
	this.setStyles();
	this.setBehaviors();
	this.show();
}

Bubble.prototype.config = function( options ){
	var baseUIColor = getStyleRuleValue( "color", ".ui-state-active" );
	this.bubbleType = ( options.bubbleType === undefined ? "speech" : options.bubbleType );
	this.name = ( options.name === undefined ? "bubble" : options.name );
	this.height = ( options.height === undefined ? 100 : options.height );
	this.position = ( options.position === undefined ? "top right" : options.position ); // position of arrow tip on selector - top right | bottom right | top center | bottom center | top left | bottom left
	this.width = ( options.width === undefined ? 200 : options.width ); // width of bubble
	this.padding = ( options.padding === undefined ? 20 : options.padding ); // interior padding of bubble
	this.opacity = ( options.opacity === undefined ? 1 : options.opacity ); // interior padding of bubble
	// baseline position
	this.top = this.selector.offset().top;
	this.left = this.selector.offset().left;

	this.shadowColor = ( options.shadowColor === undefined ? baseUIColor : options.shadowColor );
	this.shadowSize = 2; // shadow 
	this.borderColor = ( options.borderColor === undefined ? baseUIColor : options.borderColor );
	this.borderWidth = ( options.borderWidth === undefined ? 8 : options.borderWidth ); //	border: 8px solid #CC4B4B; // width of bubble border
	this.arrowPosition = ( options.arrowPosition === undefined ? "bottom left" : options.arrowPosition ); // location of arrow on bubble - top left | top right | top center | right top | right center | right bottom | bottom right | bottom center | bottom right | left bottom | left center | left top 
	this.arrowDirection =  ( options.arrowDirection === undefined ? "middle" : options.arrowDirection ); // direction arrow points - center | corner | middle
	this.arrowPositionArray = this.arrowPosition.split( " " );
	this.bubbleWidth = this.width + (this.padding * 2) + (this.borderWidth * 2); // full width of visible bubble
	this.bubbleHeight = this.height + (this.padding * 2) + (this.borderWidth * 2); // full height of visible bubble
	//this.setArrowDirection();

	this.closeIconSize = 16; // ui-icon css
	this.arrowSize = ( options.arrowSize === undefined ? 25 : options.arrowSize ); // half size of arrow 
	this.backgroundColor = ( options.backgroundColor === undefined ? "#FFFFFF" : options.backgroundColor );
	this.lineHeight = ( options.lineHeight === undefined ? 20 : options.lineHeight ); // line height of text in bubble
	this.borderRadius = ( options.borderRadius === undefined ? 30 : options.borderRadius );	//border-radius
	this.boxShadowColor = ( options.boxShadowColor === undefined ? baseUIColor : options.boxShadowColor );
	this.font = ( options.font === undefined ? "Arial sans" : options.font );
	this.zIndex = ( options.zIndex === undefined ? 100 : options.zIndex );
	this.closable = ( options.closable === undefined ? false : options.closable );
	this.autoClose = ( options.autoClose === undefined ? false : options.autoClose );
	this.autoCloseDelay = ( options.autoCloseDelay === undefined ? 5000 : options.autoCloseDelay );
};

Bubble.prototype.render = function(){
	var str =  '<p class="gadgetui_bubble_' + this.bubbleType + '" name="' + this.name + '">' + this.message;
	if( this.closable ){
		str = str + '<span class="ui-icon ui-icon-close"></span>';
	}
	str = str + '</p>';

	this.selector
		.before( str );
};

Bubble.prototype.show = function(){
	this.bubbleSelector.show( "fade", 500 );
};

Bubble.prototype.setStyles = function(){

	this.setBubbleStyles();
	
	this.calculateArrowPosition();

	this.calculateArrowStyle();

	this.setBeforeRules();
	
	this.setAfterRules();
	
	this.calculatePosition();
	
	this.bubbleSelector
		.css( "top", this.top )
		.css( "left", this.left );

	$( "span", this.bubbleSelector )
		.css( "left", this.bubbleWidth - 6 - this.closeIconSize - this.borderWidth * 2 )
		.css( "position", "absolute" )
		.css( "cursor", "pointer" )
		.css( "top", 6 );
};

Bubble.prototype.setBubbleStyles = function(){
	this.bubbleSelector = $( "p[name='" + this.name + "']", this.selector.parent() );

	this.bubbleSelector
		.css( "margin", 0 )
		.css( "padding", this.padding )
		.css( "width", this.width )
		.css( "height", this.height )
		.css( "line-height", this.lineHeight + "px" )
		.css( "border-radius", this.borderRadius )
		.css( "-moz-border-radius", this.borderRadius )
		.css( "-webkit-border-radius", this.borderRadius )

		.css( "-webkit-box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor )
		.css( "-moz-box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor )
		.css( "box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor )

		.css( "border", this.borderWidth + "px solid " + this.borderColor )
		.css( "background-color", this.backgroundColor )
		.css( "position", "absolute" )
		.css( "text-align", "left" )
		.css( "opacity", this.opacity )
		.css( "font", this.font )
		.css( "z-index", this.zIndex );
};

Bubble.prototype.setBeforeRules = function(){
	// set rules on paragraph :before pseudo-selector
	var rules = {
		content: " ",
		position: "absolute",
		width: 0,
		height: 0,
		left: this.beforeArrowLeft + "px",
		top: this.arrowTop + "px",
		border: this.arrowSize + "px solid",
		borderColor: this.beforeBorderColor
	};

	addRule( "p[name='" + this.name + "']:before", rules );	
};

Bubble.prototype.setAfterRules = function(){

	var rules = {
		content: " ",
		position: "absolute",
		width: 0,
		height: 0,
		left: this.afterArrowLeft + "px",
		top: this.afterArrowTop + "px",
		border: this.afterArrowSize + "px solid",
		borderColor: this.afterBorderColor
	};

	addRule( "p[name='" + this.name + "']:after", rules );

};

Bubble.prototype.calculatePosition = function(){
	var self = this;

	$.each(  this.position.split( " " ), function( ix, ele ){
			switch( ele ){
			case "top":
				//self.top =  self.top - self.selector.outerHeight();
				break;
			case "bottom":
				self.top =  self.top + self.selector.outerHeight();
				break;
			case "left":

				break;
			case "right":
				self.left = self.left + self.selector.outerWidth();
				break;
			case "center":
				self.left = self.left + self.selector.outerWidth() / 2;
				break;
			}
	});
};

Bubble.prototype.calculateArrowPosition = function(){
	var doubleArrow = this.arrowSize * 2, 
		afterArrowCenter,
		doublePadding = this.padding * 2,
		arrowOffset = this.borderWidth + this.borderRadius + this.arrowSize;
		afterArrowOffset =  Math.floor( Math.sqrt( Math.pow( this.borderWidth, 2 ) + Math.pow( this.borderWidth, 2 ) ) ) - 1;
		
		this.afterArrowSize = this.arrowSize - afterArrowOffset;
		afterArrowCenter = ( doubleArrow - this.afterArrowSize * 2) / 2;
	switch( this.arrowPositionArray[0] ){
		case "left":
			this.beforeArrowLeft = -doubleArrow;
			this.afterArrowLeft = -this.afterArrowSize * 2;
			this.left = this.left + this.arrowSize - this.borderWidth;
			break;
		case "right":
			this.beforeArrowLeft = this.width + doublePadding;
			this.afterArrowLeft = this.beforeArrowLeft;
			this.left = this.left - this.bubbleWidth - this.arrowSize + this.borderWidth;
			break;
		case "top":
			this.arrowTop = -( doubleArrow );
			this.afterArrowTop = -( this.afterArrowSize * 2 );			
			this.top = this.top + this.arrowSize - this.borderWidth;
			break;
		case "bottom":

			this.arrowTop = this.height + doublePadding;
			this.afterArrowTop = this.arrowTop;
			this.top = this.top - this.bubbleHeight - this.arrowSize + this.borderWidth;
			break;
	}

	switch( this.arrowPositionArray[1] ){
		case "top":
			this.arrowTop = this.borderRadius;
			this.afterArrowTop = this.arrowTop + afterArrowCenter;
			this.top = this.top - arrowOffset;
			break;
		case "bottom":

			this.arrowTop = this.bubbleHeight - this.borderWidth * 2 - doubleArrow - this.borderRadius;
			this.afterArrowTop = this.arrowTop + afterArrowCenter;
			this.top = this.top - this.bubbleHeight + arrowOffset;
			break;
		case "right":
			this.beforeArrowLeft = this.bubbleWidth - this.borderWidth * 2 - doubleArrow - this.borderRadius;
			this.afterArrowLeft = this.beforeArrowLeft + afterArrowOffset;
			this.left = this.left - this.bubbleWidth + arrowOffset;
			break;
		case "left":
			this.beforeArrowLeft = this.borderRadius;
			this.afterArrowLeft = this.beforeArrowLeft + afterArrowOffset;
			this.left = this.left - arrowOffset;
			break;
	}

};

Bubble.prototype.calculateArrowStyle = function(){
	var colorArray = [], arrowStart = this.arrowPositionArray[0], arrowEnd = this.arrowPositionArray[1] + " " + this.arrowDirection;

	
	if( this.arrowDirection === 'middle' ){
		switch( this.arrowPositionArray[0] ){
		case "top":
			this.beforeBorderColor = "transparent transparent " + this.borderColor + " transparent";
			this.afterBorderColor = "transparent transparent #fff transparent";	
			break;
		case "bottom":
			this.beforeBorderColor = this.borderColor + " transparent transparent transparent";
			this.afterBorderColor = "#fff transparent transparent transparent";
			break;
		case "right":
			this.beforeBorderColor = "transparent transparent transparent " + this.borderColor;
			this.afterBorderColor = "transparent transparent transparent #fff";			
			break;
		case "left":
			this.beforeBorderColor = "transparent " + this.borderColor + " transparent transparent";
			this.afterBorderColor = "transparent #fff transparent transparent";			
			break;
		}
	}else{
		if( arrowStart === 'top' || arrowEnd === 'bottom corner' || arrowEnd === 'top center' ){
			colorArray[0] = 'transparent';
			colorArray[2] =  this.borderColor;
		}else if( arrowStart === 'bottom' || arrowEnd === 'bottom center' || arrowEnd === 'top corner' ){
			colorArray[0] = this.borderColor;
			colorArray[2] =  'transparent';
		}
	
		if( arrowStart === 'right' || arrowEnd === 'left corner' || arrowEnd === 'right center' ){
			colorArray[1] = 'transparent';
			colorArray[3] =  this.borderColor;
		}else if( arrowStart === 'left' || arrowEnd === 'left center' || arrowEnd === 'right corner' ){
			colorArray[1] =  this.borderColor;
			colorArray[3] = 'transparent';
		}

		this.beforeBorderColor = colorArray.toString().replace( /\),/gi, ") " ).replace( /,transparent/gi, " transparent" ).replace( /transparent,/gi, "transparent " );
		this.afterBorderColor = this.beforeBorderColor.replace( this.borderColor, "#fff", "g" );
		console.log( this.beforeBorderColor );
		console.log( this.afterBorderColor );
	}
		


	/*	
	 right *, * right center, * left corner - colorArray[1] = 'transparent', colorArray[3] = this.borderColor
	 left *, * right corner, * left center - colorArray[1] = this.borderColor, colorArray[3] = 'transparent'
	 top *, * bottom corner, * top center - colorArray[0] = 'transparent', colorArray[2] =  this.borderColor
	 bottom *, * bottom center, * top corner - colorArray[0] =  this.borderColor, colorArray[2] = 'transparent'
	 	
	 	
	 */
	
	// switch-based decision tree - working and re-factored
	
	/*	switch( this.arrowPosition + " " + this.arrowDirection ){
		case "right top center":
		case "right bottom corner":
		case "top right center":
		case "top left corner":
			this.beforeBorderColor = " transparent transparent " + this.borderColor + " " + this.borderColor;
			this.afterBorderColor = "transparent transparent #fff #fff";			
			break;
		case "left top center":
		case "left bottom corner":			
		case "top left center":
		case "top right corner":
			this.beforeBorderColor = " transparent " + this.borderColor + " " + this.borderColor + " transparent";
			this.afterBorderColor = "transparent #fff #fff" + " transparent";			
			break;

		case "right bottom center":			
		case "right top corner":
		case "bottom right center":
		case "bottom left corner":
			this.beforeBorderColor = this.borderColor + " transparent transparent " + this.borderColor;
			this.afterBorderColor = "#fff transparent transparent #fff";			
			break;
		case "bottom left center":
		case "bottom right corner":
		case "left bottom center":			
		case "left top corner":
			//working
			this.beforeBorderColor = this.borderColor + this.borderColor + " transparent transparent";
			this.afterBorderColor = "#fff #fff transparent transparent ";			
			break;
	}		*/
};

Bubble.prototype.setBehaviors = function(){
	var self = this;
	$( "span", this.bubbleSelector )
		.on( "click", function(){
			self.bubbleSelector.hide( "fade", 500 ).remove();
		});

	if( this.autoClose ){
		closeBubble = function(){
			self.bubbleSelector.hide( 'fade', 500 ).remove();
		};
		setTimeout( "closeBubble()", this.autoCloseDelay );
	}
};

