import { setStyle } from '../gadget-ui.util.js';
import { FloatingPane } from './floatingpane.js';

export class Dialog extends FloatingPane {
	constructor(element, options = {}) {
		const css = setStyle;

		if (element) {
			super(element, options);
		} else {
			const dv = document.createElement("div");
			dv.setAttribute("id", `gadgetui-dialog-${Math.random()}`);
			if (options.width) {
				css(dv, "width", options.width);
			}
			document.body.appendChild(dv);
			super(dv, options);
		}

		this.buttons = options.buttons || [];
		this.addButtons();
	}

	// Events fired (inherited from FloatingPane): "minimized", "maximized",
	// "moved", "closed", "removed". The previous `events = ["showPrevious",
	// "showNext"]` declaration was a stale copy-paste from Lightbox; Dialog
	// has never fired those. Removed to avoid misleading consumers and to
	// stop overwriting Component's `this.events` listener dict.

	addButtons() {
		this.buttonDiv = document.createElement("div");
		this.buttonDiv.classList.add("gadgetui-dialog-buttons");

		this.buttons.forEach((button) => {
			const btn = document.createElement("button");
			btn.classList.add("gadgetui-dialog-button");
			btn.innerHTML = button.label;
			this.buttonDiv.appendChild(btn);

			btn.addEventListener("click", () => {
				if (typeof button.action === "function") {
					button.action();
				}
			});
		});

		this.element.appendChild(this.buttonDiv);
	}

	destroy() {
		// If the caller provided their own element, leave it clean (no
		// residual buttonDiv) so it can be reused after destroy. When
		// Dialog created the element itself the whole subtree is about
		// to be detached anyway — this is a no-op but safe.
		if (this.buttonDiv && this.buttonDiv.parentNode) {
			this.buttonDiv.parentNode.removeChild(this.buttonDiv);
		}
		super.destroy();
	}
}
