class Overlay extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.addBindings();
		
		// Show overlay by default after initialization
		this.show();
	}

	events = ["shown", "hidden", "destroyed", "contentChanged"];

	config(options = {}) {
		this.backgroundColor = options.backgroundColor || "rgba(0, 0, 0, 0.5)";
		this.class = options.class || false;
		this.autoShow = options.autoShow !== false; // Default to true unless explicitly false
		this.clickThrough = options.clickThrough || false;
		this.zIndexOffset = options.zIndexOffset || 1;
		this.content = options.content || "";
	}

	addControl() {
		// Get the element's position and dimensions
		const rect = this.element.getBoundingClientRect();
		const computedStyle = window.getComputedStyle(this.element);
		
		// Create overlay element
		this.overlayElement = document.createElement("div");
		this.overlayElement.classList.add("gadgetui-overlay");
		
		// Add custom class if specified
		if (this.class) {
			this.overlayElement.classList.add(this.class);
		}

		// Position overlay exactly over the target element
		this.overlayElement.style.position = "absolute";
		this.overlayElement.style.top = `${rect.top + window.scrollY}px`;
		this.overlayElement.style.left = `${rect.left + window.scrollX}px`;
		this.overlayElement.style.width = `${rect.width}px`;
		this.overlayElement.style.height = `${rect.height}px`;
		this.overlayElement.style.backgroundColor = this.backgroundColor;
		this.overlayElement.style.zIndex = this.getMaxZIndex() + this.zIndexOffset;
		
		// Handle pointer events based on clickThrough option
		this.overlayElement.style.pointerEvents = this.clickThrough ? "none" : "auto";
		
		// Add content if specified
		if (this.content) {
			this.overlayElement.innerHTML = this.content;
		}

		// Start hidden if autoShow is false
		if (!this.autoShow) {
			this.overlayElement.classList.add("gadgetui-hidden");
		}

		// Add to document body
		document.body.appendChild(this.overlayElement);

		// Store original position and dimensions for resize handling
		this.lastRect = rect;
		
		// Set up resize observer to handle element size changes
		this.setupResizeObserver();
		
		// Set up scroll listener to handle position changes
		this.setupScrollListener();
	}

	setupResizeObserver() {
		if (typeof ResizeObserver !== "undefined") {
			this.resizeObserver = new ResizeObserver((entries) => {
				for (let entry of entries) {
					const rect = entry.target.getBoundingClientRect();
					this.updateOverlayPosition(rect);
				}
			});
			this.resizeObserver.observe(this.element);
		}
	}

	setupScrollListener() {
		this.scrollHandler = () => {
			const rect = this.element.getBoundingClientRect();
			this.updateOverlayPosition(rect);
		};
		window.addEventListener("scroll", this.scrollHandler, true);
	}

	updateOverlayPosition(rect) {
		if (this.overlayElement && 
			(rect.top !== this.lastRect.top || 
			 rect.left !== this.lastRect.left || 
			 rect.width !== this.lastRect.width || 
			 rect.height !== this.lastRect.height)) {
			
			this.overlayElement.style.top = `${rect.top + window.scrollY}px`;
			this.overlayElement.style.left = `${rect.left + window.scrollX}px`;
			this.overlayElement.style.width = `${rect.width}px`;
			this.overlayElement.style.height = `${rect.height}px`;
			
			this.lastRect = rect;
		}
	}

	getMaxZIndex() {
		const elements = document.querySelectorAll("*");
		let maxZIndex = 0;
		
		for (let element of elements) {
			const zIndex = parseInt(window.getComputedStyle(element).zIndex);
			if (!isNaN(zIndex) && zIndex > maxZIndex) {
				maxZIndex = zIndex;
			}
		}
		
		return maxZIndex;
	}

	addBindings() {
		// Handle click events on overlay (if not clickThrough)
		if (!this.clickThrough) {
			this.overlayElement.addEventListener("click", (event) => {
				this.fireEvent("click", { originalEvent: event });
			});
		}

		// Handle mouse events
		this.overlayElement.addEventListener("mouseenter", (event) => {
			this.fireEvent("mouseenter", { originalEvent: event });
		});

		this.overlayElement.addEventListener("mouseleave", (event) => {
			this.fireEvent("mouseleave", { originalEvent: event });
		});
	}

	show() {
		if (this.overlayElement) {
			this.overlayElement.classList.remove("gadgetui-hidden");
			this.fireEvent("shown");
		}
	}

	hide() {
		if (this.overlayElement) {
			this.overlayElement.classList.add("gadgetui-hidden");
			this.fireEvent("hidden");
		}
	}

	destroy() {
		// Remove resize observer
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}

		// Remove scroll listener
		if (this.scrollHandler) {
			window.removeEventListener("scroll", this.scrollHandler, true);
		}

		// Remove overlay element from DOM
		if (this.overlayElement && this.overlayElement.parentNode) {
			this.overlayElement.parentNode.removeChild(this.overlayElement);
		}

		// Clear references
		this.overlayElement = null;
		this.lastRect = null;
		this.resizeObserver = null;
		this.scrollHandler = null;

		// Fire destroyed event
		this.fireEvent("destroyed");
	}

	// Utility method to check if overlay is currently visible
	isVisible() {
		return this.overlayElement && !this.overlayElement.classList.contains("gadgetui-hidden");
	}

	// Utility method to update overlay style
	updateStyle(styles) {
		if (this.overlayElement) {
			Object.assign(this.overlayElement.style, styles);
		}
	}

	// Set the content of the overlay
	setContent(htmlContent) {
		this.content = htmlContent;
		if (this.overlayElement) {
			this.overlayElement.innerHTML = this.content;
			this.fireEvent("contentChanged", { content: this.content });
		}
	}

	// Get the current content of the overlay
	getContent() {
		return this.content;
	}
}