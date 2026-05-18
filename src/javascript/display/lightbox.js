import { Component } from '../../objects/component.js';

export class Lightbox extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.setImage();
		this._observeForRemoval();
	}

	// Events fired (call .on(name, handler) to subscribe):
	//   "showPrevious" — prevImage() called; args: { currentIndex }
	//   "showNext"     — nextImage() called; args: { currentIndex }
	//   "removed"      — destroy() ran (manual destroy(), or
	//                    MutationObserver auto-destroy on element removal)
	// (Previous `events = ["showPrevious","showNext","close","destroy"]`
	//  class field overwrote Component's `this.events` listener dict
	//  with an array; "close" and "destroy" were never fired anyway —
	//  destroy now fires "removed" to match the pattern across components.)

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

		// Store each click handler as an instance prop so destroy() can
		// removeEventListener with the same reference. Previously the
		// `destroy()` calls passed fresh arrow functions, which never
		// matched the originally-bound ones — listeners actually leaked
		// every time. This is the real bug fix in the Lightbox pass.
		this._onPrevClick = () => this.prevImage();
		this.spanPrevious.addEventListener("click", this._onPrevClick);
		this._onNextClick = () => this.nextImage();
		this.spanNext.addEventListener("click", this._onNextClick);

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

			this._onContainerClick = () => {
				this.setModalImage();
				this.element.classList.add("gadgetui-hidden");
				this.modal.classList.remove("gadgetui-hidden");
				this.stopAnimation();
			};
			this.imageContainer.addEventListener("click", this._onContainerClick);

			this._onModalClick = () => {
				this.modal.classList.add("gadgetui-hidden");
				this.element.classList.remove("gadgetui-hidden");
				this.animate();
			};
			this.modal.addEventListener("click", this._onModalClick);
		}
	}

	// Auto-destroy when the lightbox element leaves the DOM (e.g. the
	// consumer's view unmounts). Without this, the modal portaled to
	// document.body would orphan plus the setInterval from animate()
	// would keep firing. Same pattern as Modal / Popover / FloatingPane.
	_observeForRemoval() {
		this._observer = new MutationObserver(() => {
			if (!document.contains(this.element)) this.destroy();
		});
		this._observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
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
		if (this._destroyed) return;
		this._destroyed = true;

		if (this._observer) {
			this._observer.disconnect();
			this._observer = null;
		}

		// Stop the slideshow interval before tearing down listeners so
		// it can't fire one more nextImage() into a half-destroyed view.
		this.stopAnimation();

		// Remove listeners using the cached refs so removeEventListener
		// actually matches what was bound (the prior version passed
		// fresh arrows here — silent no-ops).
		if (this._onPrevClick) {
			this.spanPrevious.removeEventListener("click", this._onPrevClick);
		}
		if (this._onNextClick) {
			this.spanNext.removeEventListener("click", this._onNextClick);
		}
		if (this._onContainerClick) {
			this.imageContainer.removeEventListener(
				"click",
				this._onContainerClick,
			);
		}
		if (this._onModalClick && this.modal) {
			this.modal.removeEventListener("click", this._onModalClick);
		}

		if (this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
		if (this.modal && this.modal.parentNode) {
			this.modal.parentNode.removeChild(this.modal);
		}

		this.fireEvent("removed");
	}
}
