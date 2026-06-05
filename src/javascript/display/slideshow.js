import { Component } from '../../objects/component.js';

// Slideshow — a rotating slide carousel.
//
// Slide sources (pick one):
//   1. Existing markup: pass a target element that already contains a set of
//      child elements; each becomes a slide.
//   2. Template + data: pass a `template` function (an ES template literal
//      function `(item, index) => htmlString`) plus a `data` array, or a
//      `datasource` function returning a Promise of an array. Each item is
//      rendered through the template into a slide.
//
// Transitions: "slide" (default, a moving track), "fade", or "none".
//
// Events (subscribe with .on(name, handler)):
//   "rendered"     — slides built and laid out; args: {}
//   "slideChanged" — the active slide changed; args: { index }
//   "removed"      — destroy() ran (manual, or auto on element removal)
export class Slideshow extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);

		if (this.datasource) {
			this._retrieveData();
		} else {
			this.addControl();
		}

		this._observeForRemoval();
	}

	config(options = {}) {
		this.template =
			typeof options.template === "function" ? options.template : null;
		this.data = Array.isArray(options.data) ? options.data : null;
		this.datasource =
			typeof options.datasource === "function" ? options.datasource : null;

		// Transition style and (for "slide") the axis it travels on.
		this.transition = ["slide", "fade", "none"].includes(options.transition)
			? options.transition
			: "slide";
		this.direction =
			options.direction === "vertical" ? "vertical" : "horizontal";

		// Timing, in milliseconds.
		this.interval =
			typeof options.interval === "number" && options.interval > 0
				? options.interval
				: 5000;
		this.transitionDuration =
			typeof options.transitionDuration === "number" &&
			options.transitionDuration >= 0
				? options.transitionDuration
				: 600;

		this.autoplay = options.autoplay ?? true;
		this.loop = options.loop ?? true;
		this.pauseOnHover = options.pauseOnHover ?? true;
		this.showControls = options.showControls ?? true;
		this.showIndicators = options.showIndicators ?? true;
		this.startIndex =
			typeof options.startIndex === "number" ? options.startIndex : 0;

		// Explicit dimensions. A number is treated as pixels; a string passes
		// through verbatim (e.g. "600px", "80%"). When omitted the component
		// fills its host element.
		this.width = options.width;
		this.height = options.height;

		this.currentIndex = 0;
		this._slides = [];
	}

	// Normalize a width/height option to a CSS length. Numbers become px;
	// strings pass through verbatim.
	_cssSize(value) {
		return typeof value === "number" ? `${value}px` : value;
	}

	_retrieveData() {
		this.datasource().then((data) => {
			this.data = Array.isArray(data) ? data : [];
			this.addControl();
		});
	}

	_isHorizontal() {
		return this.direction === "horizontal";
	}

	// Whether the seamless clone-based loop applies (slide transition only —
	// fade/none loop trivially by toggling the active slide).
	_usesLoopClones() {
		return (
			this.transition === "slide" && this.loop && this._slides.length > 1
		);
	}

	addControl() {
		this.element.classList.add("gadgetui-slideshow");

		if (this.width != null) {
			this.element.style.width = this._cssSize(this.width);
		}
		if (this.height != null) {
			this.element.style.height = this._cssSize(this.height);
		}

		// Gather the slide nodes before we restructure the element.
		let slideNodes;
		if (this.template && this.data) {
			slideNodes = this.data.map((item, i) => {
				const slide = document.createElement("div");
				slide.innerHTML = this.template(item, i);
				return slide;
			});
		} else {
			// Use the element's existing children as slides, moving each into
			// its own slide wrapper.
			slideNodes = Array.from(this.element.children).map((child) => {
				const slide = document.createElement("div");
				slide.appendChild(child);
				return slide;
			});
		}

		slideNodes.forEach((node) =>
			node.classList.add("gadgetui-slideshow-slide"),
		);
		this._slides = slideNodes;

		this.viewport = document.createElement("div");
		this.viewport.classList.add("gadgetui-slideshow-viewport");

		this.track = document.createElement("div");
		this.track.classList.add("gadgetui-slideshow-track");
		this.track.classList.add(`gadgetui-slideshow-mode-${this.transition}`);
		if (this.transition === "slide") {
			this.track.classList.add(
				this._isHorizontal()
					? "gadgetui-slideshow-horizontal"
					: "gadgetui-slideshow-vertical",
			);
		}

		// For the slide transition with looping, frame the real slides with a
		// clone of the last slide (at the start) and the first slide (at the
		// end). Advancing onto a clone animates seamlessly, then we snap back
		// to the matching real slide with no transition. Track positions are
		// therefore offset by one from real-slide indices.
		const n = this._slides.length;
		if (this._usesLoopClones()) {
			const headClone = this._slides[n - 1].cloneNode(true);
			const tailClone = this._slides[0].cloneNode(true);
			headClone.classList.add("gadgetui-slideshow-clone");
			tailClone.classList.add("gadgetui-slideshow-clone");
			this.track.appendChild(headClone);
			this._slides.forEach((s) => this.track.appendChild(s));
			this.track.appendChild(tailClone);
		} else {
			this._slides.forEach((s) => this.track.appendChild(s));
		}

		this.viewport.appendChild(this.track);
		this.element.appendChild(this.viewport);

		// Clamp the requested start index and set initial positions.
		this.currentIndex = Math.min(Math.max(this.startIndex, 0), Math.max(n - 1, 0));
		this._pos = this._usesLoopClones()
			? this.currentIndex + 1
			: this.currentIndex;

		if (this.showControls && n > 1) this._addControls();
		if (this.showIndicators && n > 1) this._addIndicators();

		this._layout();
		this._render(false);

		// Slide-mode transforms are px-based, so track the viewport size.
		this._resizeObserver = new ResizeObserver(() => {
			this._layout();
			this._render(false);
		});
		this._resizeObserver.observe(this.viewport);

		// Snap back from a clone to its real slide once the wrap animation ends.
		if (this._usesLoopClones()) {
			this._onTrackTransitionEnd = (e) => {
				if (e.target !== this.track || e.propertyName !== "transform") {
					return;
				}
				if (this._pos === n + 1) {
					this._pos = 1;
					this._render(false);
				} else if (this._pos === 0) {
					this._pos = n;
					this._render(false);
				}
			};
			this.track.addEventListener(
				"transitionend",
				this._onTrackTransitionEnd,
			);
		}

		if (this.pauseOnHover) {
			this._onEnter = () => this._pauseTimer();
			this._onLeave = () => {
				if (this.autoplay) this._startTimer();
			};
			this.element.addEventListener("mouseenter", this._onEnter);
			this.element.addEventListener("mouseleave", this._onLeave);
		}

		if (this.autoplay && n > 1) this._startTimer();

		this.fireEvent("rendered", {});
	}

	_addControls() {
		const horizontal = this._isHorizontal();
		this.prevControl = document.createElement("button");
		this.prevControl.type = "button";
		this.prevControl.classList.add(
			"gadgetui-slideshow-control",
			"gadgetui-slideshow-control-prev",
		);
		this.prevControl.setAttribute("aria-label", "Previous slide");
		this.prevControl.innerHTML = this._chevron(horizontal ? "left" : "up");

		this.nextControl = document.createElement("button");
		this.nextControl.type = "button";
		this.nextControl.classList.add(
			"gadgetui-slideshow-control",
			"gadgetui-slideshow-control-next",
		);
		this.nextControl.setAttribute("aria-label", "Next slide");
		this.nextControl.innerHTML = this._chevron(horizontal ? "right" : "down");

		this._onPrevClick = () => this.prev();
		this._onNextClick = () => this.next();
		this.prevControl.addEventListener("click", this._onPrevClick);
		this.nextControl.addEventListener("click", this._onNextClick);

		this.element.appendChild(this.prevControl);
		this.element.appendChild(this.nextControl);
	}

	_chevron(dir) {
		const paths = {
			left: "M15 18l-6-6 6-6",
			right: "M9 18l6-6-6-6",
			up: "M18 15l-6-6-6 6",
			down: "M6 9l6 6 6-6",
		};
		return (
			`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
			`stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
			`<path d="${paths[dir]}"/></svg>`
		);
	}

	_addIndicators() {
		this.indicators = document.createElement("div");
		this.indicators.classList.add("gadgetui-slideshow-indicators");
		this._indicatorButtons = this._slides.map((_, i) => {
			const dot = document.createElement("button");
			dot.type = "button";
			dot.classList.add("gadgetui-slideshow-indicator");
			dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
			dot.addEventListener("click", () => this.goTo(i));
			this.indicators.appendChild(dot);
			return dot;
		});
		this.element.appendChild(this.indicators);
		this._updateIndicators();
	}

	_updateIndicators() {
		if (!this._indicatorButtons) return;
		this._indicatorButtons.forEach((dot, i) =>
			dot.classList.toggle(
				"gadgetui-slideshow-active",
				i === this.currentIndex,
			),
		);
	}

	// Size each slide to the viewport (slide transition only — fade/none
	// slides fill the viewport via CSS) and cache the per-slide travel
	// distance used by the transform.
	_layout() {
		if (this.transition !== "slide") return;
		const w = this.viewport.clientWidth;
		const h = this.viewport.clientHeight;
		this._slideSize = this._isHorizontal() ? w : h;
		Array.from(this.track.children).forEach((slide) => {
			slide.style.width = `${w}px`;
			slide.style.height = `${h}px`;
		});
	}

	// Apply the current position to the DOM. `animate` toggles the transition.
	_render(animate = true) {
		if (this.transition === "slide") {
			const dur = animate ? this.transitionDuration : 0;
			this.track.style.transition = `transform ${dur}ms ease`;
			const offset = -this._pos * (this._slideSize || 0);
			this.track.style.transform = this._isHorizontal()
				? `translate3d(${offset}px, 0, 0)`
				: `translate3d(0, ${offset}px, 0)`;
			if (!animate) {
				// Force the reflow so a subsequent animated move starts from
				// this position rather than transitioning from the old one.
				this.track.offsetWidth;
			}
		} else {
			const dur =
				animate && this.transition === "fade" ? this.transitionDuration : 0;
			this._slides.forEach((slide, i) => {
				slide.style.transition = `opacity ${dur}ms ease`;
				slide.classList.toggle(
					"gadgetui-slideshow-active",
					i === this.currentIndex,
				);
			});
		}
		this._updateIndicators();
	}

	_emitChange() {
		this.fireEvent("slideChanged", { index: this.currentIndex });
	}

	next() {
		const n = this._slides.length;
		if (n <= 1) return;

		if (this.transition === "slide") {
			if (this._usesLoopClones()) {
				this._pos += 1;
				this.currentIndex = (this._pos - 1 + n) % n;
				this._render(true);
			} else {
				if (this.currentIndex >= n - 1) return; // non-looping slide stops
				this.currentIndex += 1;
				this._pos = this.currentIndex;
				this._render(true);
			}
		} else {
			if (this.currentIndex >= n - 1 && !this.loop) return;
			this.currentIndex = (this.currentIndex + 1) % n;
			this._render(true);
		}
		this._emitChange();
	}

	prev() {
		const n = this._slides.length;
		if (n <= 1) return;

		if (this.transition === "slide") {
			if (this._usesLoopClones()) {
				this._pos -= 1;
				this.currentIndex = (this._pos - 1 + n) % n;
				this._render(true);
			} else {
				if (this.currentIndex <= 0) return; // non-looping slide stops
				this.currentIndex -= 1;
				this._pos = this.currentIndex;
				this._render(true);
			}
		} else {
			if (this.currentIndex <= 0 && !this.loop) return;
			this.currentIndex = (this.currentIndex - 1 + n) % n;
			this._render(true);
		}
		this._emitChange();
	}

	goTo(index, animate = true) {
		const n = this._slides.length;
		const target = Math.min(Math.max(index, 0), n - 1);
		if (target === this.currentIndex) return;
		this.currentIndex = target;
		this._pos = this._usesLoopClones() ? target + 1 : target;
		this._render(animate);
		this._emitChange();
	}

	_startTimer() {
		this._pauseTimer();
		if (this._slides.length <= 1) return;
		this._timer = setInterval(() => this.next(), this.interval);
	}

	_pauseTimer() {
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
		}
	}

	// Public play/pause for consumers that want manual control.
	play() {
		this.autoplay = true;
		this._startTimer();
	}

	pause() {
		this.autoplay = false;
		this._pauseTimer();
	}

	// Rebuild the slideshow from new data (template mode). Tears down the
	// current structure and listeners, then re-renders.
	regenerate(data = null) {
		this._teardown();
		if (data !== null) this.data = data;
		this.currentIndex = 0;
		this.startIndex = 0;
		this._slides = [];
		this.addControl();
	}

	// Auto-destroy when the element leaves the DOM (e.g. the consumer's view
	// unmounts), so the interval and observers don't keep running. Same
	// pattern as Lightbox / Modal / FloatingPane.
	_observeForRemoval() {
		this._observer = new MutationObserver(() => {
			if (!document.contains(this.element)) this.destroy();
		});
		this._observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	// Stop timers/observers and remove the structure and listeners this
	// component added, without removing the host element.
	_teardown() {
		this._pauseTimer();

		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = null;
		}

		if (this._onTrackTransitionEnd && this.track) {
			this.track.removeEventListener(
				"transitionend",
				this._onTrackTransitionEnd,
			);
			this._onTrackTransitionEnd = null;
		}
		if (this._onPrevClick && this.prevControl) {
			this.prevControl.removeEventListener("click", this._onPrevClick);
		}
		if (this._onNextClick && this.nextControl) {
			this.nextControl.removeEventListener("click", this._onNextClick);
		}
		if (this._onEnter) {
			this.element.removeEventListener("mouseenter", this._onEnter);
			this.element.removeEventListener("mouseleave", this._onLeave);
		}

		if (this.viewport && this.viewport.parentNode) {
			this.viewport.parentNode.removeChild(this.viewport);
		}
		if (this.prevControl && this.prevControl.parentNode) {
			this.prevControl.parentNode.removeChild(this.prevControl);
		}
		if (this.nextControl && this.nextControl.parentNode) {
			this.nextControl.parentNode.removeChild(this.nextControl);
		}
		if (this.indicators && this.indicators.parentNode) {
			this.indicators.parentNode.removeChild(this.indicators);
		}

		this.viewport = null;
		this.track = null;
		this.prevControl = null;
		this.nextControl = null;
		this.indicators = null;
		this._indicatorButtons = null;
	}

	destroy() {
		if (this._destroyed) return;
		this._destroyed = true;

		if (this._observer) {
			this._observer.disconnect();
			this._observer = null;
		}

		this._teardown();

		this.fireEvent("removed");
	}
}
