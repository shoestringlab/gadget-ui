import { Component } from '../../objects/component.js';

export class Modal extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.addBindings();
		this._observeForRemoval();

		if (this.autoOpen) {
			this.open();
		}
	}

	// Events fired (call .on(name, handler) to subscribe):
	//   "opened"  — open() was called (or autoOpen at construction)
	//   "closed"  — close() was called
	//   "removed" — destroy() ran (manual destroy() or MutationObserver
	//               auto-destroy on wrapper / original-parent removal)
	// (Previous `events = ["opened","closed"]` class field overwrote
	//  Component's `this.events` listener dict with an array — removed.)

	addControl() {
		this.wrapper = document.createElement("div");
		if (this.class) {
			this.wrapper.classList.add(this.class);
		}
		this.wrapper.classList.add("gadgetui-modal");

		// Remember the element's original location so destroy() can put
		// it (sans injected close button) back where it came from.
		this._originalParent = this.element.parentNode;
		this._originalNextSibling = this.element.nextSibling;

		// portal: true mounts the wrapper on document.body so the modal
		// escapes any transformed / `overflow:hidden` ancestor that would
		// otherwise constrain its `position:fixed` containing block or
		// clip its visual coverage. Element is moved into the wrapper
		// either way; the difference is where the wrapper lives.
		if (this.portal) {
			document.body.appendChild(this.wrapper);
		} else {
			this.element.parentNode.insertBefore(this.wrapper, this.element);
		}
		this.element.parentNode.removeChild(this.element);
		this.wrapper.appendChild(this.element);

		const icon =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.closeIcon}"/>`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.closeIcon}"/></svg>`;

		this.element.classList.add("gadgetui-modalWindow");
		this.element.innerHTML = `
    <span name="close" class="gadgetui-right-align">
      <a name="close">${icon}</a>
    </span>
    ${this.element.innerHTML}
  `.trim();
	}

	addBindings() {
		// Cache the close click handler so destroy() can remove it
		// symmetrically. An inline arrow listener (the previous pattern)
		// can't be removed later because each call creates a fresh ref.
		const close = this.element.querySelector('a[name="close"]');
		this._onCloseClick = (event) => {
			event.stopPropagation();
			event.preventDefault();
			this.close();
		};
		close.addEventListener("click", this._onCloseClick);
	}

	// Auto-destroy when either the wrapper or the element's original
	// parent leaves the DOM — covers framework re-renders that rip the
	// modal (non-portal) or its controlling view (portal) without going
	// through close(). Matches the Menu v12.2.4 / FloatingPane pattern.
	_observeForRemoval() {
		this._observer = new MutationObserver(() => {
			const wrapperGone = !document.contains(this.wrapper);
			const anchorGone =
				this._originalParent &&
				!document.contains(this._originalParent);
			if (wrapperGone || anchorGone) this.destroy();
		});
		this._observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	open() {
		this.wrapper.classList.add("gadgetui-showModal");
		this.fireEvent("opened");
	}

	close() {
		this.wrapper.classList.remove("gadgetui-showModal");
		this.fireEvent("closed");
	}

	destroy() {
		if (this._destroyed) return;
		this._destroyed = true;

		if (this._observer) {
			this._observer.disconnect();
			this._observer = null;
		}

		const closeAnchor = this.element.querySelector('a[name="close"]');
		if (closeAnchor && this._onCloseClick) {
			closeAnchor.removeEventListener("click", this._onCloseClick);
		}

		// Pull element out of the wrapper, strip the injected close
		// button so the consumer's element is clean, then put it back in
		// its original DOM location. If the original parent has since
		// been removed (framework re-render → MutationObserver triggered
		// us), the element ends up orphaned in the detached parent —
		// that's the consumer's reference to manage.
		if (this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
		const closeSpan = this.element.querySelector(".gadgetui-right-align");
		if (closeSpan) this.element.removeChild(closeSpan);
		if (this._originalParent) {
			if (this._originalNextSibling) {
				this._originalParent.insertBefore(
					this.element,
					this._originalNextSibling,
				);
			} else {
				this._originalParent.appendChild(this.element);
			}
		}
		if (this.wrapper && this.wrapper.parentNode) {
			this.wrapper.parentNode.removeChild(this.wrapper);
		}

		this.fireEvent("removed");
	}

	config(options) {
		this.class = options.class || false;
		this.iconClass = options.iconClass || "feather";
		this.closeIcon =
			options.closeIcon ||
			"/node_modules/feather-icons/dist/icons/x-circle.svg";
		this.autoOpen = options.autoOpen !== false; // Default to true unless explicitly false
		this.iconType = options.iconType || "img";
		this.portal = options.portal === true;
	}
}
