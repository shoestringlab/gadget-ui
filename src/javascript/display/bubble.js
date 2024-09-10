function Bubble( options ){
	this.canvas = document.createElement( 'canvas');
	this.ctx = this.canvas.getContext('2d');
	this.config( options );
	this.bubble = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		arrowPosition: 'topleft',
		arrowAngle: 315,
		text: '',
		padding: 10,
		fontSize: this.fontSize,
		fontStyle: this.fontStyle,
		fontWeight: this.fontWeight,
		fontVariant: this.fontVariant,
		font: this.font,
		color: this.color,
		borderWidth: this.borderWidth,
		borderColor: this.borderColor,
		backgroundColor: this.backgroundColor,
		justifyText: this.justifyText,
		lineHeight: this.lineHeight,
		align: this.align,
		vAlign: this.vAlign
	};
}

Bubble.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	this.color = ((options.color === undefined) ? "#000" : options.color);
	this.borderWidth = ((options.borderWidth === undefined) ? 1 : options.borderWidth);
	this.borderColor = ((options.borderColor === undefined ? "#000" : options.borderColor));
	this.backgroundColor = (options.backgroundColor === undefined ? "#f0f0f0" : options.backgroundColor);
	this.fontSize = ((options.fontSize === undefined) ? 14 : options.fontSize);
	this.font = ((options.font === undefined) ? "Arial" : options.font);
	this.fontStyle = ((options.fontStyle === undefined) ? "" : options.fontStyle);
	this.fontWeight = ((options.fontWeight === undefined) ? 100 : options.fontWeight);
	this.fontVariant = ((options.fontVariant === undefined) ? "" : options.fontVariant);
	this.lineHeight = ((options.lineHeight === undefined) ? null : options.lineHeight);
	this.align = ((options.align === undefined) ? "center" : options.align); //center, left, right
	this.vAlign = ((options.vAlign === undefined) ? "middle" : options.vAlign);// middle, top, bottom
	this.justifyText = ((options.justifyText === undefined) ? false : options.justifyText);
};

Bubble.prototype.events = ['rendered'];

Bubble.prototype.setBubble = function(x, y, width, height, arrowPosition, length, angle ){
	this.bubble.x = x;
	this.bubble.y = y;
	this.bubble.width = width;
	this.bubble.height = height;
	this.setArrow( arrowPosition, length, angle );
	this.calculateBoundingRect();
	const rect = this.getBoundingClientRect();
	this.canvas.height = rect.height;
	this.canvas.width = rect.width;
	const body = document.querySelector( "body" );
	body.appendChild( this.canvas );
};

Bubble.prototype.setText = function( text ){
	this.bubble.text = text;
};

Bubble.prototype.setPosition = function(x, y) {
	this.bubble.x = x;
	this.bubble.y = y;
};

Bubble.prototype.setArrow = function( position, length, angle ){
	// get the dX and dY of the arrow so we can figure out where it needs to be
	this.setArrowLength( length );
	this.setArrowPosition( position );
	this.setArrowAngle( angle );
	this.setArrowComponents();
	this.setArrowVector();
};

Bubble.prototype.setArrowPosition = function( position ) {
	this.bubble.arrowPosition = position;
	switch( this.bubble.arrowPosition ){
		case "top":
			this.bubble.arrowX = this.bubble.x + ( this.bubble.width / 2 );
			this.bubble.arrowY = this.bubble.y;
			break;
		case "topright":
			this.bubble.arrowX = this.bubble.x + this.bubble.width;
			this.bubble.arrowY = this.bubble.y;
			break;
		case "right":
			this.bubble.arrowX = this.bubble.x + this.bubble.width;
			this.bubble.arrowY = this.bubble.y + this.bubble.height / 2;
			break;
		case "bottomright":
			this.bubble.arrowX = this.bubble.x + this.bubble.width;
			this.bubble.arrowY = this.bubble.y + this.bubble.height;
			break;
		case "bottom":
			this.bubble.arrowX = this.bubble.x + ( this.bubble.width / 2 );
			this.bubble.arrowY = this.bubble.y + this.bubble.height;
			break;
		case "bottomleft":
			this.bubble.arrowX = this.bubble.x;
			this.bubble.arrowY = this.bubble.y + this.bubble.height;
			break;
		case "left":
			this.bubble.arrowX = this.bubble.x;
			this.bubble.arrowY = this.bubble.y + this.bubble.height / 2;
			break;
		case "topleft":
			this.bubble.arrowX = this.bubble.x;
			this.bubble.arrowY = this.bubble.y;
			break;
		default:
			this.bubble.arrowX = this.bubble.x;
			this.bubble.arrowY = this.bubble.y;
			break;
	}
};

Bubble.prototype.setArrowAngle = function(angle) {
	this.bubble.arrowAngle = angle;
	switch( this.bubble.arrowPosition ){
		case "top":
			if( angle < 280 && angle > 80 ){
				console.error( "Angle must be 280-360 or 0-80 degrees." );
				this.bubble.arrowAngle = 0;
			}
			break;
		case "topright":
			if( angle < 10 && angle > 80 ){
				console.error( "Angle must be between 10 and 80 degrees." );
				this.bubble.arrowAngle = 45;
			}
			break;
		case "right":
			if( angle < 10 && angle > 170 ){
				console.error( "Angle must be between 10 and 170 degrees." );
				this.bubble.arrowAngle = 90;
			}
			break;
		case "bottomright":
			if( angle < 100 && angle > 170 ){
				console.error( "Angle must be between 100 and 170 degrees." );
				this.bubble.arrowAngle = 180;
			}
			break;
		case "bottom":
			if( angle < 100 && angle > 260 ){
				console.error( "Angle must be between 100 and 260 degrees." );
				this.bubble.arrowAngle = 180;
			}
			break;
		case "bottomleft":
			if( angle < 190 && angle > 260 ){
				console.error( "Angle must be between 190 and 260 degrees." );
				this.bubble.arrowAngle = 225;
			}
			break;
		case "left":
			if( angle < 190 && angle > 350 ){
				console.error( "Angle must be between 190 and 350 degrees." );
				this.bubble.arrowAngle = 270;
			}
			break;
		case "topleft":
			if( angle < 280 && angle > 80 ){
				console.error( "Angle must be between 280 and 80 degrees." );
				this.bubble.arrowAngle = 315;
			}
			break;
		default:
			this.bubble.arrowAngle = 315;
			break;
	}
};

Bubble.prototype.setArrowLength = function(length) {
	this.bubble.arrowLength = length;
};

Bubble.prototype.setArrowComponents = function(){
	const angleInRadians = Math.abs(this.bubble.arrowAngle - 90) * Math.PI / 180;
	// calculate the change in x and y for the vector
	this.bubble.arrowDx = Math.round(this.bubble.arrowLength * Math.cos( angleInRadians ));
	this.bubble.arrowDy = Math.round(this.bubble.arrowLength * Math.sin( angleInRadians ));
};

Bubble.prototype.setArrowVector = function() {

	// arrowEndX and arrowEndY based on quandrant of arrow position and direction
	if( this.bubble.arrowAngle >= 0 && this.bubble.arrowAngle <= 90 ){
		this.bubble.arrowEndX = this.bubble.arrowX + this.bubble.arrowDx;
		this.bubble.arrowEndY = this.bubble.arrowY - this.bubble.arrowDy;
	}else if(this.bubble.arrowAngle >= 90 && this.bubble.arrowAngle <= 180 ){
		this.bubble.arrowEndX = this.bubble.arrowX + this.bubble.arrowDx;
		this.bubble.arrowEndY = this.bubble.arrowY + this.bubble.arrowDy;
	}else if(this.bubble.arrowAngle >= 180 && this.bubble.arrowAngle <= 270 ){
		this.bubble.arrowEndX = this.bubble.arrowX + this.bubble.arrowDx;
		this.bubble.arrowEndY = this.bubble.arrowY + this.bubble.arrowDy;
	}else if(this.bubble.arrowAngle >= 270 && this.bubble.arrowAngle <= 360 ){
		this.bubble.arrowEndX = this.bubble.arrowX + this.bubble.arrowDx;
		this.bubble.arrowEndY = this.bubble.arrowY + this.bubble.arrowDy;
	}
};

Bubble.prototype.calculateBoundingRect = function(){
	this.bubble.top = Math.min( this.bubble.y, this.bubble.arrowEndY ) - Math.floor( this.bubble.borderWidth / 2 );
	this.bubble.left = Math.min( this.bubble.x, this.bubble.arrowEndX ) - Math.floor( this.bubble.borderWidth / 2 );
	this.bubble.right = Math.max( this.bubble.x + this.bubble.width, this.bubble.arrowEndX ) + Math.floor( this.bubble.borderWidth / 2 );
	this.bubble.bottom = Math.max( this.bubble.y + this.bubble.height, this.bubble.arrowEndY ) + Math.floor( this.bubble.borderWidth / 2 );
};

Bubble.prototype.getBoundingClientRect = function(){
	return{
		top: this.bubble.top,
		left: this.bubble.left,
		bottom: this.bubble.bottom,
		right: this.bubble.right,
		height: this.bubble.bottom - this.bubble.top,
		width: this.bubble.right - this.bubble.left
	};
};

Bubble.prototype.render = function(){
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	// Draw bubble body
	this.ctx.fillStyle = this.bubble.backgroundColor;
	this.ctx.strokeStyle = this.bubble.borderColor;
	this.ctx.lineWidth = this.bubble.borderWidth;
	
	// Adjust bubble position based on arrow location
	let bubbleX = this.bubble.x;
	let bubbleY = this.bubble.y;

	// Draw bubble
	this.ctx.beginPath();
	this.ctx.moveTo(bubbleX, bubbleY);

	// bottom left corner
	this.ctx.lineTo(bubbleX, bubbleY + this.bubble.height);
	// bottom right corner
	this.ctx.lineTo(bubbleX + this.bubble.width, bubbleY + this.bubble.height);
	// top right corner
	this.ctx.lineTo(bubbleX + this.bubble.width, bubbleY);
	
	this.ctx.lineTo(bubbleX, bubbleY);
	
	this.ctx.closePath();

	//this.ctx.fill();
	//this.ctx.stroke();


	this.ctx.moveTo(this.bubble.arrowX, this.bubble.arrowY);
	this.ctx.lineTo(this.bubble.arrowEndX, this.bubble.arrowEndY);
	this.ctx.fill();
	this.ctx.stroke();

	this.ctx.fillStyle = this.bubble.color;
	const config = {
		x: bubbleX + this.bubble.padding,
		y: bubbleY + this.bubble.padding,
		width: this.bubble.width - this.bubble.padding * 2 - this.bubble.borderWidth * 2,
		height: this.bubble.height - this.bubble.padding * 2 - this.bubble.borderWidth * 2, 
		fontSize: this.bubble.fontSize,
		justify: this.bubble.justifyText,
		align: this.bubble.align,
		vAlign: this.bubble.vAlign,
		font: this.bubble.font,
		fontStyle: this.bubble.fontStyle,
		fontWeight: this.bubble.fontWeight,
		fontVariant: this.bubble.fontVariant,
		font: this.bubble.font,
		lineHeight: this.bubble.lineHeight
	  };
	gadgetui.util.drawText( this.ctx, this.bubble.text, config );
};

Bubble.prototype.attachToElement = function( selector, position ) {
	const element = selector;
	if (!element) return;

	const rect = element.getBoundingClientRect();
	const canvasRect = this.canvas.getBoundingClientRect();
	var render = this.canvas.getContext("2d");
	switch( position ){
		case "top":
			this.canvas.style.left = rect.left + (rect.right - rect.left) / 2 + "px";
			this.canvas.style.top = rect.top + "px";
			break;
		case "topright":
			this.canvas.style.left = rect.right + "px";
			this.canvas.style.top = -( this.bubble.padding ) + "px";
			break;
		case "right":
			this.canvas.style.left = rect.right + "px";
			this.canvas.style.top = rect.top / 2 + ( rect.bottom - rect.top ) / 2 + "px";
			break;	
		case "bottomright":
			this.canvas.style.left = rect.right + "px";
			this.canvas.style.top = rect.bottom + "px";
			break;
		case "bottom":
			this.canvas.style.left = rect.left + (rect.right - rect.left) / 2 + "px";
			this.canvas.style.top = rect.bottom + "px";
			break;
		case "bottomleft":
			this.canvas.style.left = rect.left - canvasRect.width + "px";
			this.canvas.style.top = rect.bottom + "px";
			break;
		case "left":
			this.canvas.style.left = rect.left - canvasRect.width + "px";
			this.canvas.style.top = rect.top - ((rect.bottom - rect.top ) / 2) + "px";
			break;
		case "topleft":
			this.canvas.style.left = rect.left - canvasRect.width + "px";
			this.canvas.style.top = rect.top - canvasRect.height + "px";
			break;
		}
		this.canvas.style.position = "absolute";

};

Bubble.prototype.destroy = function(){
	document.querySelector("body").removeChild( this.canvas );
};
