import { Component } from '../../objects/component.js';
import { buildIconMarkup } from '../gadget-ui.util.js';

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

		// Animation behaviour. "slideshow" (default) swaps one image for the
		// next on an interval with a slide transition. "scroll" lays the
		// images out in a continuous track and scrolls them past the viewport
		// at a constant speed.
		this.animateMode =
			options.animateMode === "scroll" ? "scroll" : "slideshow";
		// Scroll speed in pixels per second (scroll mode only).
		this.scrollSpeed =
			typeof options.speed === "number" && options.speed > 0
				? options.speed
				: 40;
		// Scroll direction (scroll mode only): "left" | "right" | "up" | "down".
		this.scrollDirection = ["left", "right", "up", "down"].includes(
			options.direction,
		)
			? options.direction
			: "left";

		this.enableModal = options.enableModal ?? true;
		this.leftIcon =
			options.leftIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-left.svg";
		this.rightIcon =
			options.rightIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-right.svg";
		this.iconClass = options.iconClass || "feather";
		this.iconType = options.iconType || "img";
		// Coordinate space of the referenced icon symbol (for iconType
		// "svg"). Default matches feather-icons. Override for other
		// icon sets — see FloatingPane.config() for examples.
		this.iconViewBox = options.iconViewBox || "0 0 24 24";
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
		this.spanPrevious.innerHTML = buildIconMarkup({
			type: this.iconType,
			iconClass: this.iconClass,
			url: this.leftIcon,
			viewBox: this.iconViewBox,
			alt: "Previous",
		});
		this.spanNext.innerHTML = buildIconMarkup({
			type: this.iconType,
			iconClass: this.iconClass,
			url: this.rightIcon,
			viewBox: this.iconViewBox,
			alt: "Next",
		});

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

		if (this.animateMode === "scroll") {
			this._buildScrollTrack();
		}

		// Modal zoom and the prev/next controls are slideshow affordances;
		// they don't map onto a continuously scrolling track, so skip them
		// in scroll mode.
		if (this.enableModal && this.animateMode !== "scroll") {
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

	// Build the continuous track used by scroll mode. The images are laid
	// out edge-to-edge and duplicated once so the track can wrap seamlessly:
	// once a full set has scrolled past, we shift the offset back by one set
	// width onto the identical copy without a visible jump.
	_buildScrollTrack() {
		const horizontal =
			this.scrollDirection === "left" || this.scrollDirection === "right";

		this.scrollTrack = document.createElement("div");
		this.scrollTrack.classList.add("gadgetui-lightbox-scroll-track");
		this.scrollTrack.classList.add(
			horizontal
				? "gadgetui-lightbox-scroll-horizontal"
				: "gadgetui-lightbox-scroll-vertical",
		);

		const sequence = this.images.concat(this.images);
		this._scrollImgs = sequence.map((src, i) => {
			const img = document.createElement("img");
			img.src = src;
			img.alt = `Image ${(i % this.images.length) + 1}`;
			img.classList.add("gadgetui-lightbox-scroll-image");
			this.scrollTrack.appendChild(img);
			return img;
		});

		this.imageContainer.appendChild(this.scrollTrack);

		// The single-image slideshow elements and the nav controls have no
		// role in scroll mode.
		this.imageTag.classList.add("gadgetui-hidden");
		this.transitionImageTag.classList.add("gadgetui-hidden");
		this.spanPrevious.classList.add("gadgetui-hidden");
		this.spanNext.classList.add("gadgetui-hidden");

		this._sizeScrollTrack();

		// Keep each image matched to the viewport (and the wrap distance
		// correct) as the container resizes.
		this._scrollResizeObserver = new ResizeObserver(() =>
			this._sizeScrollTrack(),
		);
		this._scrollResizeObserver.observe(this.imageContainer);
	}

	// Size each track image to the scroll axis of the container and recompute
	// the per-set wrap distance.
	_sizeScrollTrack() {
		if (!this._scrollImgs || !this.images.length) return;
		const horizontal =
			this.scrollDirection === "left" || this.scrollDirection === "right";
		const size = horizontal
			? this.imageContainer.clientWidth
			: this.imageContainer.clientHeight;
		if (!size) return;

		this._scrollImgs.forEach((img) => {
			if (horizontal) {
				img.style.width = `${size}px`;
			} else {
				img.style.height = `${size}px`;
			}
		});
		this._scrollUnit = size * this.images.length;
	}

	_startScroll() {
		if (!this.images.length || !this.scrollTrack) return;

		const horizontal =
			this.scrollDirection === "left" || this.scrollDirection === "right";
		// "left"/"up" move the track in the negative axis direction.
		const negative =
			this.scrollDirection === "left" || this.scrollDirection === "up";

		if (!this._scrollUnit) this._sizeScrollTrack();

		// Start positioned so there's always a full set ahead in the travel
		// direction: at 0 when moving negative, at -unit when moving positive.
		this._scrollOffset = negative ? 0 : -(this._scrollUnit || 0);
		this._scrollLast = null;

		const step = (timestamp) => {
			if (this._scrollLast === null) this._scrollLast = timestamp;
			const dt = (timestamp - this._scrollLast) / 1000;
			this._scrollLast = timestamp;

			const unit = this._scrollUnit || 0;
			this._scrollOffset += this.scrollSpeed * dt * (negative ? -1 : 1);

			if (unit > 0) {
				if (negative && this._scrollOffset <= -unit) {
					this._scrollOffset += unit;
				} else if (!negative && this._scrollOffset >= 0) {
					this._scrollOffset -= unit;
				}
			}

			this.scrollTrack.style.transform = horizontal
				? `translate3d(${this._scrollOffset}px, 0, 0)`
				: `translate3d(0, ${this._scrollOffset}px, 0)`;

			this._scrollRAF = requestAnimationFrame(step);
		};

		this._scrollRAF = requestAnimationFrame(step);
	}

	_stopScroll() {
		if (this._scrollRAF) {
			cancelAnimationFrame(this._scrollRAF);
			this._scrollRAF = null;
		}
		this._scrollLast = null;
	}

	animate() {
		if (this.animateMode === "scroll") {
			this._stopScroll();
			this._startScroll();
		} else {
			this.interval = setInterval(() => this.nextImage(), this.time);
		}
	}

	stopAnimation() {
		clearInterval(this.interval);
		this._stopScroll();
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

		if (this._scrollResizeObserver) {
			this._scrollResizeObserver.disconnect();
			this._scrollResizeObserver = null;
		}

		// Stop the slideshow interval and any scroll RAF before tearing down
		// listeners so neither can fire into a half-destroyed view.
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
