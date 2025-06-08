class Lightbox extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.setImage();
	}

	events = ["showPrevious", "showNext"];

	config(options = {}) {
		this.images = options.images || [
			"https://via.placeholder.com/300x200?text=Image+1",
			"https://via.placeholder.com/300x200/0000FF/FFFFFF?text=Image+2",
			"https://via.placeholder.com/300x200/FF0000/FFFFFF?text=Image+3",
		];
		this.currentIndex = 0;
		this.time = options.time || 3000;
		this.enableModal = options.enableModal ?? true;
		this.leftIcon =
			options.leftIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-left.svg";
		this.rightIcon =
			options.rightIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-right.svg";
		this.iconClass = options.iconClass || "feather";
		this.iconType = options.iconType || "img";
	}

	addControl() {
		this.element.classList.add("gadgetui-lightbox");

		this.imageContainer = document.createElement("div");
		gadgetui.util.addClass(
			this.imageContainer,
			"gadgetui-lightbox-image-container",
		);
		this.imageTag = document.createElement("img");
		this.imageTag.setAttribute("name", "image");
		this.imageTag.classList.add("gadgetui-lightbox-image");
		this.imageContainer.appendChild(this.imageTag);

		this.transitionImageTag = document.createElement("img");
		this.transitionImageTag.setAttribute("name", "transitionImage");
		this.transitionImageTag.classList.add("gadgetui-lightbox-image");
		gadgetui.util.addClass(
			this.transitionImageTag,
			"gadgetui-lightbox-transitionimage",
		);
		this.transitionImageTag.classList.add("gadgetui-hidden");
		this.imageContainer.appendChild(this.transitionImageTag);

		this.spanPrevious = document.createElement("span");
		this.spanNext = document.createElement("span");
		gadgetui.util.addClass(
			this.spanPrevious,
			"gadgetui-lightbox-previousControl",
		);
		this.spanNext.classList.add("gadgetui-lightbox-nextControl");
		this.spanPrevious.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.leftIcon}">`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.leftIcon}"/></svg>`;

		this.spanNext.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.rightIcon}">`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.rightIcon}"/></svg>`;

		this.element.appendChild(this.spanPrevious);
		this.element.appendChild(this.imageContainer);
		this.element.appendChild(this.spanNext);

		this.spanPrevious.addEventListener("click", () => this.prevImage());
		this.spanNext.addEventListener("click", () => this.nextImage());

		if (this.enableModal) {
			this.modal = document.createElement("div");
			this.modal.classList.add("gadgetui-lightbox-modal");
			this.modal.classList.add("gadgetui-hidden");

			this.modalImageContainer = document.createElement("div");
			gadgetui.util.addClass(
				this.modalImageContainer,
				"gadgetui-lightbox-modal-imagecontainer",
			);
			this.modalImageTag = document.createElement("img");
			this.modalImageTag.classList.add("gadgetui-lightbox-image"); // Fixed typo: this.imageTab -> this.modalImageTag
			this.modalImageContainer.appendChild(this.modalImageTag);

			this.modal.appendChild(this.modalImageContainer);

			document.body.appendChild(this.modal);

			this.imageContainer.addEventListener("click", () => {
				this.setModalImage();
				this.element.classList.add("gadgetui-hidden");
				gadgetui.util.removeClass(this.modal, "gadgetui-hidden");
				this.stopAnimation();
			});

			this.modal.addEventListener("click", () => {
				this.modal.classList.add("gadgetui-hidden");
				gadgetui.util.removeClass(this.element, "gadgetui-hidden");
				this.animate();
			});
		}
	}

	nextImage() {
		this.currentIndex = (this.currentIndex + 1) % this.images.length;
		this.updateImage(true);
		this.fireEvent("showNext", { currentIndex: this.currentIndex });
	}

	prevImage() {
		this.currentIndex =
			(this.currentIndex - 1 + this.images.length) % this.images.length;
		this.updateImage(false);
		this.fireEvent("showPrevious", { currentIndex: this.currentIndex });
	}

	setImage() {
		this.imageTag.src = `${this.images[this.currentIndex]}`;
		this.imageTag.alt = `Image ${this.currentIndex + 1}`;
	}

	updateImage(isNext = true) {
		const newSrc = this.images[this.currentIndex];
		const newAlt = `Image ${this.currentIndex + 1}`;

		// Set up transition image
		this.transitionImageTag.src = newSrc;
		this.transitionImageTag.alt = newAlt;

		// Remove hidden class to make transition image visible
		gadgetui.util.removeClass(this.transitionImageTag, "gadgetui-hidden");

		// Apply slide direction
		const directionClass = isNext
			? "gadgetui-slide-left"
			: "gadgetui-slide-right";
		this.transitionImageTag.classList.add(directionClass);

		// After transition ends, update main image and reset transition image
		const handleTransitionEnd = () => {
			// Update main image
			this.imageTag.src = newSrc;
			this.imageTag.alt = newAlt;

			// Reset transition image
			this.transitionImageTag.classList.add("gadgetui-hidden");
			gadgetui.util.removeClass(this.transitionImageTag, "gadgetui-slide-left");
			gadgetui.util.removeClass(
				this.transitionImageTag,
				"gadgetui-slide-right",
			);

			// Remove event listener to avoid multiple triggers
			this.transitionImageTag.removeEventListener(
				"transitionend",
				handleTransitionEnd,
			);
		};

		this.transitionImageTag.addEventListener(
			"transitionend",
			handleTransitionEnd,
		);

		// Trigger reflow to ensure animation plays
		this.transitionImageTag.offsetWidth; // Force reflow
		this.transitionImageTag.classList.add("gadgetui-slide-in");
	}

	animate() {
		this.interval = setInterval(() => this.nextImage(), this.time);
	}

	stopAnimation() {
		clearInterval(this.interval);
	}

	setModalImage() {
		this.modalImageTag.src = `${this.images[this.currentIndex]}`;
		this.modalImageTag.alt = `Image ${this.currentIndex + 1}`;
	}
}
