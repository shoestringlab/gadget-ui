function Bubble( selector, message, options ){
	this.selector = selector;
	this.message = message;
	this.config( options );
	this.render();
	this.setStyles();
	this.setBehaviors();
	this.show();
}

Bubble.prototype.render = function(){
	var span,
		arrowOutside,
		arrowInside,
		bubbleDiv = document.createElement( "div" );
	gadgetui.util.addClass( bubbleDiv, "gadgetui-bubble" );
	gadgetui.util.addClass( bubbleDiv, "gadgetui-bubble-" + this.bubbleType );
	bubbleDiv.setAttribute( "id", this.id );
	bubbleDiv.innerHTML = this.message;
	
	if( this.closable ){
		span = document.createElement( "span" );
		gadgetui.util.addClass( span, "oi" );
		span.setAttribute( 'data-glyph', "circle-x" );
		
	}
	arrowOutside = document.createElement( "div" );
	gadgetui.util.addClass( arrowOutside, "gadgetui-bubble-arrow-outside" );

	this.selector.parentNode.insertBefore( bubbleDiv, this.selector.nextSibling );
	this.bubbleSelector = document.getElementById( this.id );
	if( this.closable ){
		this.bubbleSelector.appendChild( span );
	}
	this.bubbleSelector.appendChild( arrowOutside );
	arrowInside = document.createElement( "div" );
	gadgetui.util.addClass( arrowInside, "gadgetui-bubble-arrow-inside" );	
	this.bubbleSelector.appendChild( arrowInside );
};

Bubble.prototype.show = function(){
	this.bubbleSelector.style.display = "block";
};

Bubble.prototype.setStyles = function(){

	//console.log( "top: " + this.top + ", left: " + this.left );
	this.setBubbleStyles();
	//console.log( "this.setBubbleStyles();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.calculateArrowPosition();
	//console.log( "this.calculateArrowPosition();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.calculateArrowStyle();
	//console.log( "this.calculateArrowStyle();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.setBeforeRules();
	//console.log( "this.setBeforeRules();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.setAfterRules();
	//console.log( "this.setAfterRules();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.calculatePosition();
	//console.log( "this.calculatePosition();" );
	//console.log( "top: " + this.top + ", left: " + this.left );

	this.bubbleSelector.style.top = this.top + "px";
	this.bubbleSelector.style.left = this.left + "px";

	this.spanElement = this.bubbleSelector.getElementsByTagName( "span" );
	var spanLeft = this.bubbleWidth - 6 - this.closeIconSize - this.borderWidth * 2;
	this.spanElement[0].setAttribute( "style", "left: " + spanLeft + "px; position: absolute; cursor: pointer; top: 6px; color: " + this.borderColor + ";" );
/*		this.spanElement[0].style.left = this.bubbleWidth - 6 - this.closeIconSize - this.borderWidth * 2;
	this.spanElement[0].style.position = "absolute";
	this.spanElement[0].style.cursor = "pointer" ;
	this.spanElement[0].style.top = 6;	*/
};

Bubble.prototype.setBubbleStyles = function(){
	
	this.bubbleSelector.setAttribute( "style", "margin : 0; width:" + this.width + "px; height:" + this.height + "px; padding:" + this.padding + "px; line-height:" + this.lineHeight + "px; border-radius:" + this.borderRadius + "px; -moz-border-radius:" + this.borderRadius + "px; -webkit-border-radius:" + this.borderRadius + ";-webkit-box-shadow: " + this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor + "; -moz-box-shadow: " + this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor+ "; box-shadow:" + this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor + "; border: " +  this.borderWidth + "px solid " + this.borderColor + "; background-color: " + this.backgroundColor + "; position: absolute; text-align: left; opacity:" + this.opacity + "; font: " + this.font + "; z-index: " + this.zIndex + ";" );
	//this.bubbleSelector.style.margin = 0;
	//this.bubbleSelector.style.padding = this.padding;
	//this.bubbleSelector.style.width = this.width;
	//this.bubbleSelector.style.height = this.height;
	//this.bubbleSelector.style.lineHeight = this.lineHeight + "px";
	//this.bubbleSelector.style.borderRadius = this.borderRadius;
	
	//this.bubbleSelector.style.-moz-border-radius = this.borderRadius;
	//this.bubbleSelector.style.-webkit-border-radius = this.borderRadius;

	//this.bubbleSelector.style.-webkit-box-shadow = this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor;
	//this.bubbleSelector.style.-moz-box-shadow = this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor;
	//this.bubbleSelector.style.boxShadow = this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor;

	//this.bubbleSelector.style.border = this.borderWidth + "px solid " + this.borderColor;
	/*	this.bubbleSelector.style.backgroundColor = this.backgroundColor;
	this.bubbleSelector.style.position = "absolute";
	this.bubbleSelector.style.textAlign = "left";
	this.bubbleSelector.style.opacity = this.opacity;
	this.bubbleSelector.style.font = this.font;
	this.bubbleSelector.style.zIndex = this.zIndex;	*/
};

Bubble.prototype.setBeforeRules = function(){
	// set rules on paragraph :before pseudo-selector
	//var rules = {
	var outside = this.bubbleSelector.getElementsByClassName( "gadgetui-bubble-arrow-outside" );
	outside[0].setAttribute( "style", "content: ''; position: absolute; width: 0; height: 0; left: " + this.beforeArrowLeft + "px; top : " + this.arrowTop + "px; border: " + this.arrowSize + "px solid; border-color :" + this.beforeBorderColor + ";" );
/*		outside[0].style.content = " ";
	outside[0].style.position = "absolute";
	outside[0].style.width = 0;
	outside[0].style.height = 0;
	outside[0].style.left = this.beforeArrowLeft + "px";
	outside[0].style.top = this.arrowTop + "px";
	outside[0].style.border = this.arrowSize + "px solid";
	outside[0].style.borderColor = this.beforeBorderColor;	*/
	//}; 
	
	//outside.addRule( rules, 0 );

};

Bubble.prototype.setAfterRules = function(){
		var inside = this.bubbleSelector.getElementsByClassName( "gadgetui-bubble-arrow-inside" );
	//var rules = {
		inside[0].setAttribute( "style", "content: ''; position: absolute; width: 0; height: 0; left: " + this.afterArrowLeft + "px; top : " + this.afterArrowTop + "px; border: " + this.afterArrowSize + "px solid; border-color :" + this.afterBorderColor + ";" );
/*			inside[0].style.content = " ";
		inside[0].style.position = "absolute";
		inside[0].style.width = 0;
		inside[0].style.height = 0;
		inside[0].style.left = this.afterArrowLeft + "px";
		inside[0].style.top = this.afterArrowTop + "px";
		inside[0].style.border = this.afterArrowSize + "px solid";
		inside[0].style.borderColor = this.afterBorderColor;	*/
	//},
	
	//inside.addRule( rules, 0 );
};

Bubble.prototype.calculatePosition = function(){
	var self = this;
	// Here we must walk up the DOM to the ancestors of the selector to see whether they are set to position: relative. If that is the case,
	// we must add the offset values of the ancestor to the position values for the control or it will not be correctly placed.
	this.relativeOffset = gadgetui.util.getRelativeParentOffset( this.selector );

	//$.each(  this.position.split( " " ), function( ix, ele ){
	this.position.split( " " ).forEach( function( ele ){
		switch( ele ){
			case "top":
				self.top =  self.top - self.relativeOffset.top;
				break;
			case "bottom":
				self.top =  self.top + self.selector.offsetHeight - self.relativeOffset.top;
				//console.log( "self.top + self.selector.outerHeight() " + self.selector.outerHeight() );
				break;
			case "left":

				break;
			case "right":
				self.left = self.left + self.selector.offsetWidth - self.relativeOffset.left;
				//console.log( "self.left + self.selector.outerWidth() - self.relativeOffset.left " + self.selector.outerWidth() );
				break;
			case "center":
				self.left = self.left + self.selector.offsetWidth / 2  - self.relativeOffset.left;
				//console.log( "self.left + self.selector.outerWidth() / 2 - self.relativeOffset.left  " + self.selector.outerWidth() / 2);
				break;
			}
	});	
};

Bubble.prototype.calculateArrowPosition = function(){
	var doubleArrow = this.arrowSize * 2, 
		afterArrowCenter,
		doublePadding = this.padding * 2,
		arrowOffset = this.borderWidth + this.borderRadius + this.arrowSize,
		afterArrowOffset =  Math.floor( Math.sqrt( Math.pow( this.borderWidth, 2 ) + Math.pow( this.borderWidth, 2 ) ) ) - 1;
		
		this.afterArrowSize = this.arrowSize - afterArrowOffset;
		afterArrowCenter = ( doubleArrow - this.afterArrowSize * 2) / 2;
	switch( this.arrowPositionArray[0] ){
		case "left":
			this.beforeArrowLeft = -doubleArrow;
			this.afterArrowLeft = -this.afterArrowSize * 2;
			this.left = this.left + this.arrowSize - this.borderWidth;
			//console.log( "this.left + this.arrowSize - this.borderWidth" );
			break;
		case "right":
			this.beforeArrowLeft = this.width + doublePadding;
			this.afterArrowLeft = this.beforeArrowLeft;
			this.left = this.left - this.bubbleWidth - this.arrowSize + this.borderWidth;
			//console.log( "this.left - this.bubbleWidth - this.arrowSize + this.borderWidth" );
			break;
		case "top":
			this.arrowTop = -( doubleArrow );
			this.afterArrowTop = -( this.afterArrowSize * 2 );			
			this.top = this.top + this.arrowSize - this.borderWidth;
			//console.log( "this.top + this.arrowSize - this.borderWidth" );
			break;
		case "bottom":

			this.arrowTop = this.height + doublePadding;
			this.afterArrowTop = this.arrowTop;
			this.top = this.top - this.bubbleHeight - this.arrowSize + this.borderWidth;
			//console.log( "this.top - this.bubbleHeight - this.arrowSize + this.borderWidth" );
			break;
	}

	switch( this.arrowPositionArray[1] ){
		case "top":
			this.arrowTop = this.borderRadius;
			this.afterArrowTop = this.arrowTop + afterArrowCenter;
			this.top = this.top - arrowOffset;
			//console.log( "this.top - arrowOffset" );
			break;
		case "bottom":

			this.arrowTop = this.bubbleHeight - this.borderWidth * 2 - doubleArrow - this.borderRadius;
			this.afterArrowTop = this.arrowTop + afterArrowCenter;
			this.top = this.top - this.bubbleHeight + arrowOffset;
			//console.log( "this.top - this.bubbleHeight + arrowOffset" );
			break;
		case "right":
			this.beforeArrowLeft = this.bubbleWidth - this.borderWidth * 2 - doubleArrow - this.borderRadius;
			this.afterArrowLeft = this.beforeArrowLeft + afterArrowOffset;
			this.left = this.left - this.bubbleWidth + arrowOffset;
			//console.log( "this.left - this.bubbleWidth + arrowOffset" );
			break;
		case "left":
			this.beforeArrowLeft = this.borderRadius;
			this.afterArrowLeft = this.beforeArrowLeft + afterArrowOffset;
			this.left = this.left - arrowOffset;
			//console.log( "this.left - arrowOffset" );
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
		//console.log( this.beforeBorderColor );
		//console.log( this.afterBorderColor );
	}
	
};

Bubble.prototype.setBehaviors = function(){
	var self = this;
	//$( "span", this.bubbleSelector )
	this.spanElement[0]
	.addEventListener( "click", function(){
			self.bubbleSelector.style.display= 'none';
			self.bubbleSelector.parentNode.removeChild( self.bubbleSelector );
		});

	if( this.autoClose ){
		closeBubble = function(){
			self.bubbleSelector.style.display= 'none';
			self.bubbleSelector.parentNode.removeChild( self.bubbleSelector );
		};
		setTimeout( closeBubble, this.autoCloseDelay );
	}
};

Bubble.prototype.config = function( options ){
	//var baseUIColor = getStyleRuleValue( "color", ".ui-state-active" );
	var baseUIColor = "silver";
	this.bubbleType = ( options.bubbleType === undefined ? "speech" : options.bubbleType );
	this.id = "gadgetui-bubble-" + gadgetui.util.Id();
	this.height = ( options.height === undefined ? 100 : options.height );
	this.position = ( options.position === undefined ? "top right" : options.position ); // position of arrow tip on selector - top right | bottom right | top center | bottom center | top left | bottom left
	this.width = ( options.width === undefined ? 200 : options.width ); // width of bubble
	this.padding = ( options.padding === undefined ? 20 : options.padding ); // interior padding of bubble
	this.opacity = ( options.opacity === undefined ? 1 : options.opacity ); // interior padding of bubble
	// baseline position
	this.top = gadgetui.util.getOffset( this.selector ).top;
	//console.log( "initial top: " + this.top );
	this.left = gadgetui.util.getOffset( this.selector ).left;
	//console.log( "initial left: " + this.left );
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

	this.closeIconSize = 13; // ui-icon css
	this.arrowSize = ( options.arrowSize === undefined ? 25 : options.arrowSize ); // half size of arrow 
	this.backgroundColor = ( options.backgroundColor === undefined ? "#FFFFFF" : options.backgroundColor );
	this.lineHeight = ( options.lineHeight === undefined ? "1.2em" : options.lineHeight ); // line height of text in bubble
	this.borderRadius = ( options.borderRadius === undefined ? 30 : options.borderRadius );	//border-radius
	this.boxShadowColor = ( options.boxShadowColor === undefined ? baseUIColor : options.boxShadowColor );
	this.font = ( options.font === undefined ? "1em Arial sans" : options.font );
	this.zIndex = ( options.zIndex === undefined ? 100 : options.zIndex );
	this.closable = ( options.closable === undefined ? false : options.closable );
	this.autoClose = ( options.autoClose === undefined ? false : options.autoClose );
	this.autoCloseDelay = ( options.autoCloseDelay === undefined ? 5000 : options.autoCloseDelay );
	this.relativeOffset = { left: 0, top: 0 };
};