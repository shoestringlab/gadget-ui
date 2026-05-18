import { Component } from '../../objects/component.js';

export class Tabs extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.tabsDiv = this.element.querySelector("div");
		this.config(options);
		this.addControl();
		this._observeForRemoval();
	}

	config(options) {
		this.direction = options.direction || "horizontal";
		this.tabContentDivIds = [];
		this.tabs = [];
		this.activeTab = null;
		// { tab: HTMLElement, handler: fn }[] — used by destroy() to
		// detach the click listeners we attached in addControl.
		this._tabClickBindings = [];
	}

	// Events fired (call .on(name, handler) to subscribe):
	//   "tabSelected" — setActiveTab() called; args: { activeTab }
	//   "removed"     — destroy() ran (manual destroy(), or
	//                   MutationObserver auto-destroy on tabsDiv removal)
	// (Previous `events = ["tabSelected"]` class field overwrote
	//  Component's `this.events` listener dict with an array — removed.)

	addControl() {
		const dir = this.direction === "vertical" ? "v" : "h";
		this.tabsDiv.classList.add(`gadget-ui-tabs-${dir}`);
		this.tabs = Array.from(this.tabsDiv.querySelectorAll("div"));

		let activeSet = false;
		this.tabs.forEach((tab) => {
			tab.classList.add(`gadget-ui-tab-${dir}`);
			const tabId = tab.getAttribute("data-tab");
			this.tabContentDivIds.push(tabId);
			this.element.querySelector(`div[name='${tabId}']`).style.display = "none";

			if (!activeSet) {
				activeSet = true;
				this.setActiveTab(tabId);
			}

			// Store the bound handler so destroy() can detach it
			// symmetrically. An inline arrow (the previous pattern)
			// can't be removed later because each call creates a fresh
			// reference.
			const handler = () => this.setActiveTab(tabId);
			tab.addEventListener("click", handler);
			this._tabClickBindings.push({ tab, handler });
		});

		this.element.querySelector(
			`div[name='${this.tabContentDivIds[0]}']`,
		).style.display = "block";
	}

	setActiveTab(activeTab) {
		const dir = this.direction === "vertical" ? "v" : "h";

		this.tabContentDivIds.forEach((tabId) => {
			const display = tabId === activeTab ? "block" : "none";
			this.element.querySelector(`div[name='${tabId}']`).style.display =
				display;
		});

		this.tabs.forEach((tab) => {
			const tabId = tab.getAttribute("data-tab");
			const className = `gadget-ui-tab-${dir}-active`;
			if (tabId === activeTab) {
				tab.classList.add(className);
				tab.classList.remove(`gadget-ui-tab-${dir}`);
			} else {
				tab.classList.add(`gadget-ui-tab-${dir}`);
				tab.classList.remove(className);
			}
		});

		this.activeTab = activeTab;

		this.fireEvent("tabSelected", { activeTab });
	}

	// Auto-destroy when the tabsDiv leaves the DOM (e.g. consumer's
	// framework re-renders the view without calling destroy()). Same
	// pattern as Modal / Popover / FloatingPane / ProgressBar.
	_observeForRemoval() {
		this._observer = new MutationObserver(() => {
			if (!document.contains(this.tabsDiv)) this.destroy();
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

		// Detach the click listeners we attached in addControl.
		this._tabClickBindings.forEach(({ tab, handler }) => {
			tab.removeEventListener("click", handler);
		});
		this._tabClickBindings = [];

		// Reset the inline `display` styles we set on the content divs
		// so the consumer's CSS regains control. tabsDiv stays in the
		// DOM — Tabs doesn't own that element, it just decorates it.
		const dir = this.direction === "vertical" ? "v" : "h";
		this.tabContentDivIds.forEach((tabId) => {
			const contentDiv = this.element.querySelector(
				`div[name='${tabId}']`,
			);
			if (contentDiv) contentDiv.style.display = "";
		});

		// Strip the classes we added so the consumer's element can be
		// reused cleanly (e.g. for a fresh Tabs instance).
		if (this.tabsDiv) {
			this.tabsDiv.classList.remove(`gadget-ui-tabs-${dir}`);
		}
		this.tabs.forEach((tab) => {
			tab.classList.remove(`gadget-ui-tab-${dir}`);
			tab.classList.remove(`gadget-ui-tab-${dir}-active`);
		});

		this.fireEvent("removed");
	}
}
