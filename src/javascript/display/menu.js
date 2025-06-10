class Menu extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.elements = [];
		this.config(options);

		if (this.datasource) {
			this.retrieveData();
		} else if (this.data) {
			this.addControl();
			this.addBindings();
		}
	}

	//events = ["clicked"];

	retrieveData() {
		this.datasource().then((data) => {
			this.data = data;
			this.addControl();
		});
	}

	addControl() {
		const processItem = (item, parent) => {
			const element = document.createElement("div");
			element.classList.add("gadget-ui-menu-item");
			element.innerText = item.label || "";
			if (item.dataId?.length) {
				element.setAttribute("data-id", item.dataId);
			}

			if (item.image?.length) {
				const imgEl = document.createElement("img");
				imgEl.src = item.image;
				imgEl.classList.add("gadget-ui-menu-icon");
				element.appendChild(imgEl);
			}

			if (
				item.link &&
				(item.link.length > 0 || typeof item.link === "function")
			) {
				element.style.cursor = "pointer";
				element.addEventListener("click", (evt) => {
					this.fireEvent("clicked", item);

					typeof item.link === "function"
						? item.link(evt)
						: window.open(item.link);
				});
			}

			if (item.menuItem) {
				element.appendChild(processMenuItem(item.menuItem, element));
			}
			return element;
		};

		const processMenuItem = (menuItemData, parent) => {
			const element = document.createElement("div");
			element.classList.add("gadget-ui-menu-menuItem");
			menuItemData.items.forEach((item) =>
				element.appendChild(processItem(item, element)),
			);
			return element;
		};

		const generateMenu = (menuData) => {
			const element = document.createElement("div");
			element.classList.add("gadget-ui-menu");
			element.innerText = menuData.label || "";

			if (menuData.image?.length) {
				const imgEl = document.createElement("img");
				imgEl.src = menuData.image;
				imgEl.classList.add("gadget-ui-menu-icon");
				element.appendChild(imgEl);
			}

			element.appendChild(processMenuItem(menuData.menuItem, element));
			return element;
		};

		this.data.forEach((menu) => {
			const element = generateMenu(menu);
			this.element.appendChild(element);
			this.elements.push(element);
		});
	}

	addBindings() {
		const menus = this.element.querySelectorAll(".gadget-ui-menu");
		const activateEvent = this.options.menuActivate || "mouseenter";
		const deactivateEvent = activateEvent === "click" ? "click" : "mouseleave";

		document.addEventListener("click", (evt) => {
			if (!this.element.contains(evt.target)) {
				this.close();
			}
		});

		menus.forEach((mu) => {
			const menuItem = mu.querySelector(".gadget-ui-menu-menuItem");
			const items = menuItem.querySelectorAll(".gadget-ui-menu-item");
			const menuItems = menuItem.querySelectorAll(".gadget-ui-menu-menuItem");

			items.forEach((item) => {
				const mItem = item.querySelector(".gadget-ui-menu-menuItem");

				item.addEventListener(activateEvent, (evt) => {
					evt.stopPropagation();
					if (mItem) mItem.classList.add("gadget-ui-menu-hovering");
					item.classList.add("gadget-ui-menu-selected");
					Array.from(item.parentNode.children).forEach((child) => {
						if (child !== item)
							child.classList.remove("gadget-ui-menu-selected");
					});
					evt.preventDefault();
				});

				if (activateEvent === "mouseenter") {
					item.addEventListener("mouseleave", (evt) => {
						evt.stopPropagation();
						if (mItem) mItem.classList.remove("gadget-ui-menu-hovering");
					});
				}
			});

			mu.addEventListener(activateEvent, (evt) => {
				evt.stopPropagation();
				menuItem.classList.add("gadget-ui-menu-hovering");
				this.fireEvent("menuOpened", this);
			});

			if (activateEvent === "mouseenter") {
				mu.addEventListener("mouseleave", (evt) => {
					evt.stopPropagation();
					menuItem.classList.remove("gadget-ui-menu-hovering");
					this.fireEvent("menuClosed", this);
				});
			}

			menuItems.forEach((mItem) => {
				mItem.addEventListener(activateEvent, (evt) => {
					evt.stopPropagation();
					mItem.classList.add("gadget-ui-menu-hovering");
				});
				if (activateEvent === "mouseenter") {
					mItem.addEventListener("mouseleave", (evt) => {
						evt.stopPropagation();
						if (!mItem.parentNode.classList.contains("selected")) {
							mItem.classList.remove("gadget-ui-menu-hovering");
						}
					});
				}
			});
		});
	}

	close() {
		this.elements.forEach((menu) => {
			const menuItem = menu.querySelector(".gadget-ui-menu-menuItem");
			if (menuItem) {
				menuItem.classList.remove("gadget-ui-menu-hovering");
				this.fireEvent("menuClosed", this);
			}
		});
	}

	destroy() {
		this.element.querySelectorAll(".gadget-ui-menu").forEach((menu) => {
			this.element.removeChild(menu);
		});
		this.fireEvent("menuRemoved", this);
	}

	config(options) {
		this.datasource = options.datasource;
		this.data = options.data || [];
		this.options = options;
	}
}
