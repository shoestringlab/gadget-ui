function Lightbox( selector, options ){
    this.selector = selector;
    this.config( options );
    this.addControl();
    this.updateImage();
}

Lightbox.prototype.events = ['showPrevious','showNext'];

Lightbox.prototype.config = function( options ){
    this.images = options.images;
    this.currentIndex = 0;
    this.featherPath = options.featherPath || "/node_modules/feather-icons";
};

Lightbox.prototype.addControl = function(){
    this.selector.setAttribute( "class", "gadgetui-lightbox" );
    let lb = document.createElement( "div" );
    lb.setAttribute( "class", "gadgetui-lightbox-image-container" );
	

    this.spanPrevious = document.createElement("span");
    this.spanNext = document.createElement("span");
	gadgetui.util.addClass(this.spanPrevious, "gadgetui-lightbox-previousControl");
	gadgetui.util.addClass(this.spanNext, "gadgetui-lightbox-nextControl");

	this.spanPrevious.innerHTML = `<svg class="feather" name="chevron">
      <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#chevron-left"/>
    </svg>`;
    this.spanNext.innerHTML = `<svg class="feather" name="chevron">
      <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#chevron-right"/>
    </svg>`;
    this.selector.appendChild( this.spanPrevious );
    this.selector.appendChild( lb );
    this.selector.appendChild( this.spanNext );
    this.imageContainer = lb;

    this.spanPrevious.addEventListener( "click", function( event ){
        this.prevImage();
    }.bind(this));

    this.spanNext.addEventListener( "click", function( event ){
        this.nextImage();
    }.bind(this));
};

// Function to show the next image
Lightbox.prototype.nextImage = function() {
    this.currentIndex = ( this.currentIndex + 1 ) %  this.images.length;
    this.updateImage();
};

// Function to show the previous image
Lightbox.prototype.prevImage = function() {
    this.currentIndex = ( this.currentIndex - 1 + this.images.length ) %  this.images.length;
    this.updateImage();
};

// Function to update the current image
Lightbox.prototype.updateImage = function() {
    this.imageContainer.innerHTML = `<img style="height:100%;width:100%;" src="${this.images[this.currentIndex]}" alt="Image ${this.currentIndex + 1}">`;
};
