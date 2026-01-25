class Lightbox extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.setImage();
	}

	events = ["showPrevious", "showNext", "close", "destroy"];

	config(options = {}) {
		this.images = options.images || [];
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
		this.imageContainer.classList.add("gadgetui-lightbox-image-container");
		this.imageTag = document.createElement("img");
		this.imageTag.setAttribute("name", "image");
		this.imageTag.classList.add("gadgetui-lightbox-image");
		this.imageContainer.appendChild(this.imageTag);

		this.transitionImageTag = document.createElement("img");
		this.transitionImageTag.setAttribute("name", "transitionImage");
		this.transitionImageTag.classList.add("gadgetui-lightbox-image");
		this.transitionImageTag.classList.add("gadgetui-lightbox-transitionimage");
		this.transitionImageTag.classList.add("gadgetui-hidden");
		this.imageContainer.appendChild(this.transitionImageTag);

		this.spanPrevious = document.createElement("span");
		this.spanNext = document.createElement("span");
		this.spanPrevious.classList.add("gadgetui-lightbox-previousControl");
		this.spanNext.classList.add("gadgetui-lightbox-nextControl");
		this.spanPrevious.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.leftIcon}" alt="Previous">`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.leftIcon}"/></svg>`;
		this.spanNext.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.rightIcon}" alt="Next">`
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
			this.modalImageContainer.classList.add(
				"gadgetui-lightbox-modal-imagecontainer",
			);
			this.modalImageTag = document.createElement("img");
			this.modalImageTag.classList.add("gadgetui-lightbox-image");
			this.modalImageContainer.appendChild(this.modalImageTag);

			this.modal.appendChild(this.modalImageContainer);
			document.body.appendChild(this.modal);

			this.imageContainer.addEventListener("click", () => {
				this.setModalImage();
				this.element.classList.add("gadgetui-hidden");
				this.modal.classList.remove("gadgetui-hidden");
				this.stopAnimation();
			});

			this.modal.addEventListener("click", () => {
				this.modal.classList.add("gadgetui-hidden");
				this.element.classList.remove("gadgetui-hidden");
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
		this.imageTag.src = this.images[this.currentIndex];
		this.imageTag.alt = `Image ${this.currentIndex + 1}`;
	}

	updateImage(isNext = true) {
		const newSrc = this.images[this.currentIndex];
		const newAlt = `Image ${this.currentIndex + 1}`;

		// Set up transition image
		this.transitionImageTag.src = newSrc;
		this.transitionImageTag.alt = newAlt;

		// Remove hidden class and reset any previous animation classes
		this.transitionImageTag.classList.remove("gadgetui-hidden");
		this.transitionImageTag.classList.remove(
			"gadgetui-slide-left",
			"gadgetui-slide-right",
			"gadgetui-slide-in",
		);

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
			this.transitionImageTag.classList.remove(
				"gadgetui-slide-left",
				"gadgetui-slide-right",
				"gadgetui-slide-in",
			);

			// Remove event listener
			this.transitionImageTag.removeEventListener(
				"transitionend",
				handleTransitionEnd,
			);
		};

		this.transitionImageTag.addEventListener(
			"transitionend",
			handleTransitionEnd,
		);

		// Trigger animation
		requestAnimationFrame(() => {
			this.transitionImageTag.offsetWidth; // Force reflow
			this.transitionImageTag.classList.add("gadgetui-slide-in");
		});
	}

	animate() {
		this.interval = setInterval(() => this.nextImage(), this.time);
	}

	stopAnimation() {
		clearInterval(this.interval);
	}

	setModalImage() {
		this.modalImageTag.src = this.images[this.currentIndex];
		this.modalImageTag.alt = `Image ${this.currentIndex + 1}`;
	}

	destroy() {
		// Remove all event listeners
		this.spanPrevious.removeEventListener("click", () => this.prevImage());
		this.spanNext.removeEventListener("click", () => this.nextImage());

		if (this.enableModal) {
			this.imageContainer.removeEventListener("click", () => {
				this.setModalImage();
				this.element.classList.add("gadgetui-hidden");
				this.modal.classList.remove("gadgetui-hidden");
				this.stopAnimation();
			});

			this.modal.removeEventListener("click", () => {
				this.modal.classList.add("gadgetui-hidden");
				this.element.classList.remove("gadgetui-hidden");
				this.animate();
			});
		}

		// Stop any ongoing animation
		this.stopAnimation();

		// Remove DOM elements
		if (this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}

		// Remove modal if it exists
		if (this.modal && this.modal.parentNode) {
			this.modal.parentNode.removeChild(this.modal);
		}
	}
}
