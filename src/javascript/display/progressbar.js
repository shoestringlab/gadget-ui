import { Component } from '../../objects/component.js';
import { setStyle } from '../gadget-ui.util.js';

export class ProgressBar extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.configure(options);
		this.render();
		this._observeForRemoval();
	}

	// Events fired (call .on(name, handler) to subscribe):
	//   "start"         — start() called; bar reset to 0%
	//   "updatePercent" — updatePercent(p) called; args: { percent }
	//   "update"        — update(text) called; args: { text }
	//   "removed"       — destroy() ran (manual destroy(), or
	//                     MutationObserver auto-destroy on progressbox
	//                     removal from the DOM)

	configure(options) {
		this.id = options.id;
		this.label = options.label || "";
		this.width = options.width;
		this.percent = 0;
	}

	render() {
		const css = setStyle;

		const pbDiv = document.createElement("div");
		pbDiv.setAttribute("name", `progressbox_${this.id}`);
		pbDiv.classList.add("gadgetui-progressbar-progressbox");

		const fileDiv = document.createElement("div");
		fileDiv.setAttribute("name", "label");
		fileDiv.classList.add("gadgetui-progressbar-label");
		fileDiv.innerText = ` ${this.label} `;

		// Create bar container (track background)
		const barContainer = document.createElement("div");
		barContainer.classList.add("gadgetui-progressbar-container");

		// Create progress bar fill
		const pbarDiv = document.createElement("div");
		pbarDiv.classList.add("gadget-ui-progressbar");
		pbarDiv.setAttribute("name", `progressbar_${this.id}`);

		// Create status text (overlaid on bar)
		const statusDiv = document.createElement("div");
		statusDiv.setAttribute("name", "statustxt");
		statusDiv.classList.add("gadgetui-progressbar-statustxt");
		statusDiv.innerHTML = "0%";

		// Assemble the structure
		barContainer.appendChild(pbarDiv);
		barContainer.appendChild(statusDiv);

		pbDiv.appendChild(fileDiv);
		pbDiv.appendChild(barContainer);
		this.element.appendChild(pbDiv);

		this.progressbox = this.element.querySelector(
			`div[name='progressbox_${this.id}']`,
		);
		this.progressbar = this.element.querySelector(
			`div[name='progressbar_${this.id}']`,
		);
		this.statustxt = this.element.querySelector(`div[name='statustxt']`);

		css(pbarDiv, "width", "0%");
	}

	start() {
		const css = setStyle;
		css(this.progressbar, "width", "0%");
		this.statustxt.innerHTML = "0%";
		this.fireEvent("start");
	}

	updatePercent(percent) {
		const css = setStyle;
		this.percent = percent;
		const percentage = `${percent}%`;
		css(this.progressbar, "width", percentage);
		this.statustxt.innerHTML = percentage;
		this.fireEvent("updatePercent", { percent });
	}

	update(text) {
		this.statustxt.innerHTML = text;
		this.fireEvent("update", { text });
	}

	// Auto-destroy when the progressbox is detached from the DOM (e.g.
	// the consumer's view unmounts without calling destroy()). Cheap
	// safety net so the JS instance + observer don't keep the detached
	// subtree alive. Same pattern as Modal / Popover / FloatingPane.
	_observeForRemoval() {
		this._observer = new MutationObserver(() => {
			if (!document.contains(this.progressbox)) this.destroy();
		});
		this._observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	destroy() {
		if (this._destroyed) return;
		this._destroyed = true;

		if (this._observer) {
			this._observer.disconnect();
			this._observer = null;
		}
		if (this.progressbox && this.progressbox.parentNode) {
			this.progressbox.parentNode.removeChild(this.progressbox);
		}
		this.fireEvent("removed");
	}
}
