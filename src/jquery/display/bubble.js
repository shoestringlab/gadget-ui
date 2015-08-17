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
	this.bubbleType = ( options.bubbleType === undefined ? "speech" : options.bubbleType );
	this.name = ( options.name === undefined ? "bubble" : options.name );
	this.height = ( options.height === undefined ? 100 : options.height );
	this.position = ( options.position === undefined ? "top right" : options.position );
	this.width = ( options.width === undefined ? 200 : options.width );
	this.padding = ( options.padding === undefined ? 20 : options.padding );
	// baseline position
	this.top = this.selector.offset().top;
	this.left = this.selector.offset().left;
	
	this.shadowColor = ( options.shadowColor === undefined ? "#F49090" : options.shadowColor );
	this.shadowSize = 2;
	this.borderColor = ( options.borderColor === undefined ? "#CC4B4B" : options.borderColor );
	this.borderWidth = ( options.borderWidth === undefined ? 8 : options.borderWidth ); //	border: 8px solid #CC4B4B;
	this.arrowPosition = ( options.arrowPosition === undefined ? "bottom left" : options.arrowPosition ); //top left | top right | top center | right top | right center | right bottom | bottom right | bottom center | bottom right | left bottom | left center | left top 
	this.arrowDirection =  ( options.arrowDirection === undefined ? "corner" : options.arrowDirection ); // bottom left | bottom right | top left | top right
	this.arrowPositionArray = this.arrowPosition.split( " " );

	//this.setArrowDirection();

	this.arrowSize = ( options.arrowSize === undefined ? 25 : options.arrowSize ); //top | left | bottom | right
	this.backgroundColor = ( options.backgroundColor === undefined ? "#FFFFFF" : options.backgroundColor );
	this.lineHeight = ( options.lineHeight === undefined ? 20 : options.lineHeight );
	this.borderRadius = ( options.borderRadius === undefined ? 30 : options.borderRadius );	//border-radius
	this.boxShadowColor = ( options.boxShadowColor === undefined ? "#F49090" : options.boxShadowColor );
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
		.css( "left", this.left - this.borderRadius - this.borderWidth );

	$( "span", this.bubbleSelector )
		.css( "left", this.width + ( this.borderWidth * 2 ) )
		.css( "position", "absolute" )
		.css( "cursor", "pointer" )
		.css( "top", this.borderWidth );
};

Bubble.prototype.setBubbleStyles = function(){
	this.bubbleSelector = $( "p[name='" + this.name + "']", this.selector.parent() );

	this.bubbleSelector
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
		//.css( "float", "left" )
		.css( "font", this.font )
		.css( "z-index", this.zIndex );
		//.css( "top", this.selector.position().top - this.offsetY )
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
		left: this.afterArrowLeft + "px", // 2 is shadow size
		top: this.afterArrowTop + "px",
		border: ( this.arrowSize - this.borderWidth - this.shadowSize ) + "px solid",
		borderColor: this.afterBorderColor
	};

	addRule( "p[name='" + this.name + "']:after", rules );

};

Bubble.prototype.calculatePosition = function(){
	var self = this;

	$.each(  this.position.split( " " ), function( ix, ele ){
			switch( ele ){
			case "top":
				self.top =  self.top - self.selector.outerHeight() - self.shadowSize * 2;
				break;
			case "bottom":
				//self.top =  self.top 
				break;
			case "left":
				
				break;
			case "right":
				self.left = self.left + self.selector.outerWidth();
				break;
			case "center":
				//console.log( "outer " + self.selector.outerWidth() );
				self.left = self.left + self.selector.outerWidth() / 2;
				break;
			}
	});
};

Bubble.prototype.calculateArrowPosition = function(){
	
	
	switch( this.arrowPositionArray[0] ){
		case "left":
			this.beforeArrowLeft = -( this.arrowSize * 2 );
			this.afterArrowLeft = -( ( this.arrowSize - this.borderWidth ) * 2 ) + this.shadowSize * 2;
			this.left = this.left + this.borderRadius + this.arrowSize * 2;
			break;
		case "right":
			this.left = this.left - this.width - this.padding - this.borderWidth * 2 - this.arrowSize + this.shadowSize;
			this.beforeArrowLeft = this.width + this.padding * 2;
			this.afterArrowLeft = this.width + this.padding * 2;
			break;			
		case "top":
			this.top = this.top + this.arrowSize * 2 - this.borderWidth - this.height + this.selector.outerHeight();
			this.arrowTop = -( this.arrowSize * 2 );
			this.afterArrowTop = this.arrowTop + this.borderWidth * 2 + this.shadowSize * 2; // 2 is shadow size			
			
			break;
		case "bottom":
			this.top = this.top - this.height - this.shadowSize;
			
			this.arrowTop = this.height + this.padding * 2;
			this.afterArrowTop = this.arrowTop;
			break;
	}

	switch( this.arrowPositionArray[1] ){
		case "top":
			this.top = this.top + this.arrowSize * 2 - this.borderWidth - this.height + this.selector.outerHeight();
			this.arrowTop = this.borderRadius;
			this.afterArrowTop = this.arrowTop + this.borderWidth + 1;
			break;
		case "bottom":
			this.top = this.top - this.height - this.shadowSize * 2;
			this.arrowTop = this.height - this.borderRadius;
			this.afterArrowTop = this.arrowTop + this.borderWidth + this.shadowSize + 1;
			break;
		case "right":
			
			this.beforeArrowLeft = this.width - this.borderRadius;
			this.afterArrowLeft = this.width - this.borderRadius + this.borderWidth + this.shadowSize;
			break;
			
		case "left":
			this.beforeArrowLeft = this.borderRadius;
			this.afterArrowLeft = this.beforeArrowLeft + this.shadowSize * 2;
			this.left = this.left + this.borderRadius + this.arrowSize * 2;
			break;

	}	
	// arrowPositionArray is x,y position of arrow 
	switch( this.arrowPosition + " " + this.arrowDirection ){
		case "top left corner":
			break;
		case "top left center":

			this.beforeArrowLeft = this.borderRadius;
			this.afterArrowLeft = ( this.borderRadius + this.borderWidth ) + 1;			
			//break;			
		case "top right corner":
			//this.left = 300;
			//this.left = this.left - this.width + this.borderWidth + this.shadowSize;
/*				this.beforeArrowLeft = this.width - this.borderRadius;
			this.afterArrowLeft = this.width - this.borderRadius + this.borderWidth;
				*/
			break;
		case "top right center":
			this.left = this.left - this.width + this.borderWidth + this.shadowSize;
			this.beforeArrowLeft = this.width - this.borderRadius;
			this.afterArrowLeft = this.width - this.borderRadius + this.borderWidth;
			
			this.top = this.top + this.selector.outerHeight() + this.borderWidth + this.arrowSize - this.shadowSize; 
			this.arrowTop = -( this.arrowSize * 2 );
			this.afterArrowTop = this.arrowTop + this.borderWidth * 2 + this.shadowSize * 2; // 2 is shadow size			
			break;	
		case "bottom left corner":

			this.beforeArrowLeft = this.borderRadius;
			this.afterArrowLeft = ( this.borderRadius + this.borderWidth ) + 1;			
			break;
		case "bottom left center":

			this.beforeArrowLeft = this.borderRadius;
			this.afterArrowLeft = ( this.borderRadius + this.borderWidth ) + 1;			
			break;
		case "bottom right corner":
			break;
		case "bottom right center":
			this.left = this.left - this.width + this.borderWidth + this.shadowSize;
			this.beforeArrowLeft = this.width - this.borderRadius;
			this.afterArrowLeft = this.width - this.borderRadius + this.borderWidth;			

			this.top = this.top - this.bubbleSelector.outerHeight() - this.arrowSize - this.selector.outerHeight() - this.shadowSize;
			break;

	}

	switch( this.arrowPositionArray[1] + " " + this.arrowDirection ){
		case "top center":
			this.top = this.top - this.borderWidth - this.arrowSize * 2 + this.shadowSize * 2;		
			this.afterArrowTop = this.arrowTop + this.borderWidth + this.shadowSize + 1;			
			break;
		case "bottom center":
			this.top = this.top + this.arrowSize * 2 - 1;
			this.afterArrowTop = this.afterArrowTop - this.shadowSize;
			break;
	}
	/*	switch( this.arrowPositionArray[0] + " " + this.arrowDirection ){
	case "top center":
		this.top = this.top - this.borderWidth - this.arrowSize * 2 + this.shadowSize * 2;		
		this.afterArrowTop = this.arrowTop + this.borderWidth + this.shadowSize + 1;			
		break;
	case "bottom center":
		this.top = this.top - this.arrowSize * 2 - 1;
		this.afterArrowTop = this.afterArrowTop - this.shadowSize;
		break;
	}	*/
};

Bubble.prototype.calculateArrowStyle = function(){
	// working and re-factored
	switch( this.arrowPosition + " " + this.arrowDirection ){
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
	}	
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

