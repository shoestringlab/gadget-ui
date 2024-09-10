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
    this.time = options.time || 3000;
    this.enableModal = ( options.enableModal === undefined ? true : options.enableModal );
};

Lightbox.prototype.addControl = function(){
    gadgetui.util.addClass( this.selector, "gadgetui-lightbox" );
    this.imageContainer  = document.createElement( "div" );
    gadgetui.util.addClass(  this.imageContainer, "gadgetui-lightbox-image-container" );
	
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
    this.selector.appendChild( this.imageContainer );
    this.selector.appendChild( this.spanNext );

    this.spanPrevious.addEventListener( "click", function( event ){
        this.prevImage();
    }.bind(this));

    this.spanNext.addEventListener( "click", function( event ){
        this.nextImage();
    }.bind(this));

    if( this.enableModal ){
        this.modal = document.createElement("div");
        gadgetui.util.addClass( this.modal, "gadgetui-lightbox-modal");
        gadgetui.util.addClass( this.modal, "gadgetui-hidden");
        this.modalImageContainer = document.createElement("div");
        this.modal.appendChild( this.modalImageContainer );
        gadgetui.util.addClass( this.modalImageContainer, "gadgetui-lightbox-modal-imagecontainer");

        document.querySelector("body").appendChild( this.modal );

        this.imageContainer.addEventListener( "click", function(event){
            this.setModalImage();
            gadgetui.util.addClass( this.selector, "gadgetui-hidden");
            gadgetui.util.removeClass( this.modal, "gadgetui-hidden");
            this.stopAnimation();
        }.bind(this));

        this.modal.addEventListener( "click", function(event){
            gadgetui.util.addClass( this.modal, "gadgetui-hidden");
            gadgetui.util.removeClass( this.selector, "gadgetui-hidden");
            this.animate();
        }.bind(this));
    }
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

Lightbox.prototype.animate = function() {
    this.interval = setInterval(function () {
        this.nextImage();
        }.bind(this), this.time );
};

Lightbox.prototype.stopAnimation = function() {
    clearInterval(this.interval);
};

Lightbox.prototype.setModalImage = function() {
    this.modalImageContainer.innerHTML = `<img style="height:100%;width:100%;" src="${this.images[this.currentIndex]}" alt="Image ${this.currentIndex + 1}">`;
};




