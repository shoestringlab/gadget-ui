import { Component } from "../../objects/component.js";

export class Menu extends Component {
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

  regenerate(data = null) {
    // Remove existing menu elements
    this.destroy();

    // If data is provided, use it; otherwise, if datasource exists, call it
    if (data !== null) {
      this.data = data;
      this.addControl();
      this.addBindings();
    } else if (this.datasource) {
      this.retrieveData();
    } else {
      // No new data and no datasource - do nothing
      return;
    }
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
          this.close();

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
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const activateEvent =
      this.options.menuActivate || (isTouchDevice ? "click" : "mouseenter");
    const deactivateEvent = activateEvent === "click" ? "click" : "mouseleave";

    document.addEventListener("click", (evt) => {
      if (!this.element.contains(evt.target)) {
        this.close();
      }
    });

    // Track the last clicked item for position updates
    let lastClickedItem = null;

    menus.forEach((mu) => {
      const menuItem = mu.querySelector(".gadget-ui-menu-menuItem");
      const items = menuItem.querySelectorAll(".gadget-ui-menu-item");
      const menuItems = menuItem.querySelectorAll(".gadget-ui-menu-menuItem");

      items.forEach((item) => {
        const mItem = item.querySelector(".gadget-ui-menu-menuItem");

        item.addEventListener(activateEvent, (evt) => {
          evt.stopPropagation();
          if (mItem) {
            mItem.classList.add("gadget-ui-menu-hovering");
            this._alignTopToTrigger(mItem, item);
            lastClickedItem = item;
          }
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
        // Toggle menu on click
        if (
          activateEvent === "click" &&
          menuItem.classList.contains("gadget-ui-menu-hovering")
        ) {
          menuItem.classList.remove("gadget-ui-menu-hovering");
          this.fireEvent("menuClosed", this);
        } else {
          menuItem.classList.add("gadget-ui-menu-hovering");
          this.fireEvent("menuOpened", this);
        }
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

    // Reposition the open submenu (if any) to follow its parent item as the
    // page scrolls. Looks the submenu up from lastClickedItem rather than
    // closing over `menuItem`, which was scoped to the menus.forEach callback
    // above and not visible here — referencing it threw at runtime.
    window.addEventListener("scroll", () => {
      if (!lastClickedItem) return;
      const submenu = lastClickedItem.querySelector(
        ":scope > .gadget-ui-menu-menuItem",
      );
      if (!submenu || !submenu.classList.contains("gadget-ui-menu-hovering")) return;
      this._alignTopToTrigger(submenu, lastClickedItem);
    }, { passive: true });
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
    this.elements = [];
    this.fireEvent("menuRemoved", this);
  }

  config(options) {
    this.datasource = options.datasource;
    this.data = options.data || [];
    this.options = options;
    // Portal mode: render the dropdown(s) on document.body instead of
    // nested inside the anchor. Avoids stacking-context and overflow-clip
    // problems caused by ancestors. Default off — opt-in to preserve
    // existing consumer DOM and CSS expectations.
    this.portal = !!options.portal;
    this.dropdownClass = options.dropdownClass || "";
    this.portaledDropdowns = [];
    this.observer = null;
  }

  // Find the dropdown element associated with a top-level toggle, regardless
  // of whether it lives inside the toggle or on document.body.
  _dropdownFor(menuToggle) {
    return this.portal
      ? menuToggle._dropdownEl
      : menuToggle.querySelector(".gadget-ui-menu-menuItem");
  }

  // Position a portaled dropdown to its trigger's bounding rect. position:fixed
  // is set inline so the dropdown follows the trigger across scroll without
  // requiring CSS coordination from the consumer.
  _positionPortaled(menuToggle, dropdownEl) {
    const rect = menuToggle.getBoundingClientRect();
    dropdownEl.style.position = "fixed";
    dropdownEl.style.top = rect.bottom + "px";
    dropdownEl.style.left = rect.left + "px";
  }

  // Position an absolutely-positioned target so its first menu item visually
  // aligns with the trigger. Four things to handle:
  //   1. style.top is interpreted relative to the offsetParent's padding
  //      edge, not the viewport — subtract the offsetParent's viewport top
  //      to convert.
  //   2. getBoundingClientRect returns the border edge, not the padding edge,
  //      so further subtract the offsetParent's border-top width (clientTop).
  //      Without this, each level of nesting drifts down by one border width.
  //   3. The target's border + first-child padding push the first item below
  //      the target's outer top by some pixels. Compensate so the first item
  //      lines up with the trigger rather than the outer border. Without this,
  //      every level of nesting compounds the offset and submenus stagger.
  //   4. The CSS rule `.gadget-ui-menu-item > .gadget-ui-menu-menuItem` sets
  //      `margin-top: -1.3em`, intended as a layout hint for the original
  //      static positioning. Now that JS owns the position, neutralize the
  //      margin so it doesn't fight us.
  _alignTopToTrigger(target, trigger) {
    target.style.marginTop = "0";
    const triggerRect = trigger.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const first = target.firstElementChild;
    const firstChildOffset = first
      ? first.getBoundingClientRect().top - targetRect.top
      : 0;
    const op = target.offsetParent;
    const opTop = op ? op.getBoundingClientRect().top : 0;
    const opBorderTop = op ? op.clientTop : 0;
    target.style.top =
      triggerRect.top - opTop - opBorderTop - firstChildOffset + "px";
  }

  // In portal mode, the dropdown outlives the anchor's normal DOM lifecycle.
  // Watch for the anchor leaving the DOM (e.g. parent re-render in a
  // framework-driven UI) and self-destruct so portaled dropdowns and listeners
  // don't leak.
  _observeAnchor() {
    this.observer = new MutationObserver(() => {
      if (!document.contains(this.element)) this.destroy();
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }
}
