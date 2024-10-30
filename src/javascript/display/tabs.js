function Tabs(element, options) {
	this.element = element;
	this.tabsDiv = this.element.querySelector( "div" );
	this.config(options);
	this.addControl();
}

Tabs.prototype.config = function (options) {
	this.direction = (options.direction === undefined ? "horizontal" : options.direction);
	this.tabContentDivIds = [];
	this.tabs = [];
	this.activeTab;
};

Tabs.prototype.events = ["tabSelected"];

Tabs.prototype.addControl = function () {
	let dir = (this.direction === "vertical" ? "v" : "h");
	this.tabsDiv.classList.add("gadget-ui-tabs-" + dir);
	this.tabs = this.tabsDiv.querySelectorAll("div");
	let activeSet = false;
	this.tabs.forEach(function (tab) {
		tab.classList.add("gadget-ui-tab-" + dir);
		// set the first tab active
		if (!activeSet) {
			activeSet = true;
			this.setActiveTab(tab.attributes['data-tab'].value);
			//tab.classList.add( "gadget-ui-tab-" + dir + "-active" );

			//this.activeTab = tab.id;
		}
		this.tabContentDivIds.push(tab.attributes['data-tab'].value);
		this.element.querySelector("div[name='" + tab.attributes['data-tab'].value + "']").style.display = 'none';
		tab.addEventListener("click", function () {
			this.setActiveTab(tab.attributes['data-tab'].value);
		}.bind(this));
	}.bind(this));
	this.element.querySelector("div[name='" + this.tabContentDivIds[0] + "']").style.display = 'block';
};

Tabs.prototype.setActiveTab = function (activeTab) {
	let dir = (this.direction === "vertical" ? "v" : "h");
	this.tabContentDivIds.forEach(function (tab) {
		let dsp = (tab === activeTab ? "block" : "none");
		this.element.querySelector("div[name='" + tab + "']").style.display = dsp;
	}.bind(this));

	this.tabs.forEach(function (tab) {
		if (tab.attributes['data-tab'].value === activeTab) {
			tab.classList.add("gadget-ui-tab-" + dir + "-active");
		} else {
			tab.classList.remove("gadget-ui-tab-" + dir + "-active");
		}
	}.bind(this));
	this.activeTab = activeTab;
	// if events were called for
	if (this.events['tabSelected'] !== undefined) {
		this.fireEvent("tabSelected", activeTab);
	}
};
