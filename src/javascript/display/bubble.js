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

	var	css = gadgetui.util.setStyle;
	var span,
		arrowOutside,
		arrowInside;

	this.bubbleElement = document.createElement( "div" );
	gadgetui.util.addClass( this.bubbleElement, "gadgetui-bubble" );
	gadgetui.util.addClass( this.bubbleElement, "gadgetui-bubble-" + this.bubbleType );
	if( this.class ){
		gadgetui.util.addClass( this.bubbleElement, this.class );
	}
	this.bubbleElement.setAttribute( "id", this.id );
	this.bubbleElement.innerHTML = this.message;

	if( this.closable ){
 		span = document.createElement( "span" );
		css( span, "float", "right" );
		var icon = `<svg class="feather">
                <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#x-circle"/>
                </svg>`;
		span.innerHTML = icon;
	}

	this.selector.parentNode.insertBefore( this.bubbleElement, this.selector.nextSibling );
	if( this.closable ){
		this.bubbleElement.appendChild( span );
	}
};

Bubble.prototype.show = function(){
	gadgetui.util.setStyle( this.bubbleElement, "display", "block" );
};

Bubble.prototype.setStyles = function(){
	var	css = gadgetui.util.setStyle;
	this.setBubbleStyles();
	this.calculatePosition();

	css( this.bubbleElement, "position", "absolute" );
	css( this.bubbleElement, "top", this.top );
	css( this.bubbleElement, "left", this.left );

	this.spanElement = this.bubbleElement.querySelector( "span" );
	css( this.spanElement, "right", "3px" );
	css( this.spanElement, "position", "absolute" );
	css( this.spanElement, "cursor", "pointer"  );
	css( this.spanElement, "top", "3px" );
};

Bubble.prototype.setBubbleStyles = function(){
	var css = gadgetui.util.setStyle;
	css( this.bubbleElement, "margin", 0 );

	if( this.boxShadow ){
		css( this.bubbleElement, "-webkit-box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor );
		css( this.bubbleElement, "-moz-box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor );
		css( this.bubbleElement, "box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor );
	}
};

Bubble.prototype.calculatePosition = function(){
	var _this = this;
	var relativeOffset = this.selector.getBoundingClientRect();
	var bubbleCoords = this.bubbleElement.getBoundingClientRect();
	this.position.split( " " ).forEach( function( ele ){
		switch( ele ){
			case "top":
				_this.top =  relativeOffset.top - relativeOffset.height;
				break;
			case "middle":
				_this.top = relativeOffset.top + Math.abs( relativeOffset.height - bubbleCoords.height  ) / 2;
				break;
			case "bottom":
				_this.top = relativeOffset.height + relativeOffset.top;
				break;
			case "left":
				_this.left = relativeOffset.left - relativeOffset.width - bubbleCoords.width;
				break;
			case "right":
				_this.left = relativeOffset.width + relativeOffset.left;
				break;
			case "center":
				_this.left = relativeOffset.width / 2  - relativeOffset.left;
				break;
			}
	});
};

Bubble.prototype.setBehaviors = function(){
	var _this = this;
	var css = gadgetui.util.setStyle;

	let closeBubble = function(){
		if( typeof Velocity != 'undefined' && _this.animate ){
			Velocity( _this.bubbleElement, {
			opacity: 0
			},{ duration: _this.delay, complete: function() {
					css( _this.bubbleElement, "display", "none" );
					_this.bubbleElement.parentNode.removeChild( _this.bubbleElement );
				}
			});
		}else{
			css( _this.bubbleElement, "display", "none" );
			_this.bubbleElement.parentNode.removeChild( _this.bubbleElement );
		}

	};

	this.spanElement
		.addEventListener( "click", function(){
				closeBubble();
			});

	if( this.autoClose ){
		setTimeout( closeBubble, this.autoCloseDelay );
	}
};

Bubble.prototype.config = function( options ){
	options = options || {};

	var baseUIColor = options.baseUIColor || "silver";
	this.bubbleType = options.bubbleType || "speech";
	this.shadowColor = options.shadowColor || baseUIColor;
	this.position = options.position || "top left";
	this.boxShadow = (( options.boxShadow === undefined) ? true : options.boxShadow );
	this.shadowSize = 2; // shadow
	this.arrowPosition = options.arrowPosition || "bottom left"; // location of arrow on bubble - top left | top right | top center | right top | right center | right bottom | bottom right | bottom center | bottom right | left bottom | left center | left top
	this.arrowDirection = options.arrowDirection || "middle"; // direction arrow points - center | corner | middle
	this.arrowPositionArray = this.arrowPosition.split( " " );
	this.featherPath = options.featherPath || "/node_modules/feather-icons";
	this.boxShadowColor = options.boxShadowColor || baseUIColor;
	this.closeIconSize = 13; // ui-icon css
	this.closable = options.closable || false;
	this.autoClose = options.autoClose || false;
	this.autoCloseDelay = options.autoCloseDelay || 5000;
	this.relativeOffset = { left: 0, top: 0 };
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.delay = (( options.delay === undefined) ? 500 : options.delay );
	this.id = "gadgetui-bubble-" + gadgetui.util.Id();
	this.class = options.class;
	};
