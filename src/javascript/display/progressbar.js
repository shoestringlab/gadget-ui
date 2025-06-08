function ProgressBar(element, options = {}) {
	this.element = element;
	this.configure(options);
}

ProgressBar.prototype.configure = function (options) {
	this.id = options.id;
	this.label = options.label || "";
	this.width = options.width;
};

ProgressBar.prototype.events = ["start", "updatePercent", "update"];

ProgressBar.prototype.render = function () {
	const css = gadgetui.util.setStyle;

	const pbDiv = document.createElement("div");
	pbDiv.setAttribute("name", `progressbox_${this.id}`);
	gadgetui.util.addClass(pbDiv, "gadgetui-progressbar-progressbox");

	const fileDiv = document.createElement("div");
	fileDiv.setAttribute("name", "label");
	gadgetui.util.addClass(fileDiv, "gadgetui-progressbar-label");
	fileDiv.innerText = ` ${this.label} `;

	const pbarDiv = document.createElement("div");
	gadgetui.util.addClass(pbarDiv, "gadget-ui-progressbar");
	pbarDiv.setAttribute("name", `progressbar_${this.id}`);

	const statusDiv = document.createElement("div");
	statusDiv.setAttribute("name", "statustxt");
	gadgetui.util.addClass(statusDiv, "statustxt");
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
	this.statustxt = this.element.querySelector(
		`div[name='progressbox_${this.id}'] div[name='statustxt']`,
	);
};

ProgressBar.prototype.start = function () {
	const css = gadgetui.util.setStyle;
	css(this.progressbar, "width", "0");
	this.statustxt.innerHTML = "0%";
};

ProgressBar.prototype.updatePercent = function (percent) {
	const css = gadgetui.util.setStyle;
	const percentage = `${percent}%`;
	this.percent = percent;
	css(this.progressbar, "width", percentage);
	this.statustxt.innerHTML = percentage;
};

ProgressBar.prototype.update = function (text) {
	this.statustxt.innerHTML = text;
};

ProgressBar.prototype.destroy = function () {
	this.progressbox.parentNode.removeChild(this.progressbox);
};
