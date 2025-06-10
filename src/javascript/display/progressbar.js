class ProgressBar extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.configure(options);
		this.render();
	}

	configure(options) {
		this.id = options.id;
		this.label = options.label || "";
		this.width = options.width;
		this.percent = 0;
	}

	render() {
		const css = gadgetui.util.setStyle;

		const pbDiv = document.createElement("div");
		pbDiv.setAttribute("name", `progressbox_${this.id}`);
		pbDiv.classList.add("gadgetui-progressbar-progressbox");

		const fileDiv = document.createElement("div");
		fileDiv.setAttribute("name", "label");
		fileDiv.classList.add("gadgetui-progressbar-label");
		fileDiv.innerText = ` ${this.label} `;

		const pbarDiv = document.createElement("div");
		pbarDiv.classList.add("gadget-ui-progressbar");
		pbarDiv.setAttribute("name", `progressbar_${this.id}`);

		const statusDiv = document.createElement("div");
		statusDiv.setAttribute("name", "statustxt");
		statusDiv.classList.add("gadgetui-progressbar-statustxt");
		statusDiv.innerHTML = "0%"; // Fixed typo from innertText to innerHTML

		pbDiv.appendChild(fileDiv);
		pbDiv.appendChild(pbarDiv);
		pbDiv.appendChild(statusDiv);
		this.element.appendChild(pbDiv);

		this.progressbox = this.element.querySelector(
			`div[name='progressbox_${this.id}']`,
		);
		this.progressbar = this.element.querySelector(
			`div[name='progressbar_${this.id}']`,
		);
		this.statustxt = this.element.querySelector(`div[name='statustxt']`);

		css(pbarDiv, { width: "0%" });
	}

	start() {
		const css = gadgetui.util.setStyle;
		css(this.progressbar, "width", "0%");
		this.statustxt.innerHTML = "0%";
		this.fireEvent("start");
	}

	updatePercent(percent) {
		const css = gadgetui.util.setStyle;
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

	destroy() {
		if (this.progressbox && this.progressbox.parentNode) {
			this.progressbox.parentNode.removeChild(this.progressbox);
		}
		this.fireEvent("removed");
	}
}
