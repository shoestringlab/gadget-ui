function Lightbox(element, options = {}) {
	this.element = element;
	this.config(options);
	this.addControl();
	this.updateImage();
}

Lightbox.prototype.events = ["showPrevious", "showNext"];

Lightbox.prototype.config = function (options) {
	this.images = options.images || [];
	this.currentIndex = 0;
	this.featherPath = options.featherPath || "/node_modules/feather-icons";
	this.time = options.time || 3000;
	this.enableModal = options.enableModal ?? true;
};

Lightbox.prototype.addControl = function () {
	gadgetui.util.addClass(this.element, "gadgetui-lightbox");

	this.imageContainer = document.createElement("div");
	gadgetui.util.addClass(
		this.imageContainer,
		"gadgetui-lightbox-image-container",
	);

	this.spanPrevious = document.createElement("span");
	this.spanNext = document.createElement("span");
	gadgetui.util.addClass(
		this.spanPrevious,
		"gadgetui-lightbox-previousControl",
	);
	gadgetui.util.addClass(this.spanNext, "gadgetui-lightbox-nextControl");

	this.spanPrevious.innerHTML = `<img class="feather" src="${this.featherPath}/dist/icons/chevron-left.svg">`;
	this.spanNext.innerHTML = `<img class="feather" src="${this.featherPath}/dist/icons/chevron-right.svg">`;

	this.element.appendChild(this.spanPrevious);
	this.element.appendChild(this.imageContainer);
	this.element.appendChild(this.spanNext);

	this.spanPrevious.addEventListener("click", () => this.prevImage());
	this.spanNext.addEventListener("click", () => this.nextImage());

	if (this.enableModal) {
		this.modal = document.createElement("div");
		gadgetui.util.addClass(this.modal, "gadgetui-lightbox-modal");
		gadgetui.util.addClass(this.modal, "gadgetui-hidden");

		this.modalImageContainer = document.createElement("div");
		gadgetui.util.addClass(
			this.modalImageContainer,
			"gadgetui-lightbox-modal-imagecontainer",
		);
		this.modal.appendChild(this.modalImageContainer);

		document.body.appendChild(this.modal);

		this.imageContainer.addEventListener("click", () => {
			this.setModalImage();
			gadgetui.util.addClass(this.element, "gadgetui-hidden");
			gadgetui.util.removeClass(this.modal, "gadgetui-hidden");
			this.stopAnimation();
		});

		this.modal.addEventListener("click", () => {
			gadgetui.util.addClass(this.modal, "gadgetui-hidden");
			gadgetui.util.removeClass(this.element, "gadgetui-hidden");
			this.animate();
		});
	}
};

Lightbox.prototype.nextImage = function () {
	this.currentIndex = (this.currentIndex + 1) % this.images.length;
	this.updateImage();
};

Lightbox.prototype.prevImage = function () {
	this.currentIndex =
		(this.currentIndex - 1 + this.images.length) % this.images.length;
	this.updateImage();
};

Lightbox.prototype.updateImage = function () {
	this.imageContainer.innerHTML = `
    <img style="height:100%;width:100%;"
         src="${this.images[this.currentIndex]}"
         alt="Image ${this.currentIndex + 1}">`;
};

Lightbox.prototype.animate = function () {
	this.interval = setInterval(() => this.nextImage(), this.time);
};

Lightbox.prototype.stopAnimation = function () {
	clearInterval(this.interval);
};

Lightbox.prototype.setModalImage = function () {
	this.modalImageContainer.innerHTML = `
    <img style="height:100%;width:100%;"
         src="${this.images[this.currentIndex]}"
         alt="Image ${this.currentIndex + 1}">`;
};
