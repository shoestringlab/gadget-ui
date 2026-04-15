import { Component } from "../../objects/component.js";
import {
  setStyle,
  getStyle,
  getNumberValue,
  bind,
  trigger,
} from "../gadget-ui.util.js";

export class SelectInput extends Component {
  constructor(selector, options = {}) {
    super();
    this.selector = selector;
    this.config(options);
    this.setSelectOptions();
    this.setInitialValue(options);
    this.addControl();
    this.addCSS();

    const css = setStyle;
    if (this.hideable) {
      css(this.selector, "display", "none");
    } else {
      css(this.label, "display", "none");
      css(this.selector, "display", "inline-block");
    }

    bind(this.selector, this.model);
    bind(this.label, this.model);
    this.addBindings();
  }

  //events = ["change", "focus", "mouseenter", "mouseleave", "blur"];

  setInitialValue(options) {
    const selectedIndex = this.selector.selectedIndex || 0;
    this.value = options.value || {
      id: this.selector.options[selectedIndex].value,
      text: this.selector.options[selectedIndex].innerHTML,
    };
    this.selector.value = this.value.id;
  }

  addControl() {
    this.wrapper = document.createElement("div");
    this.label = document.createElement("div");

    this.wrapper.classList.add("gadgetui-selectinput-div");
    this.label.classList.add("gadgetui-selectinput-label");
    this.label.setAttribute(
      "gadgetui-bind",
      this.selector.getAttribute("gadgetui-bind") || "",
    );
    this.label.innerHTML = this.value.text;

    this.selector.parentNode.insertBefore(this.wrapper, this.selector);
    this.selector.parentNode.removeChild(this.selector);
    this.wrapper.appendChild(this.selector);
    this.wrapper.insertBefore(this.label, this.selector);
  }

  setSelectOptions() {
    const bindOptions = this.selector.getAttribute("gadgetui-bind-options");
    if (!bindOptions && !this.dataProvider) return;

    while (this.selector.options.length > 0) this.selector.remove(0);

    const addOption = (value, text) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.text = text;
      this.selector.add(opt);
    };

    if (bindOptions) {
      const optionsArray = this.model.get(bindOptions);
      optionsArray.forEach((item) => {
        const isObject = typeof item === "object";
        addOption(isObject ? item.id : item, isObject ? item.text : item);
      });
    } else if (this.dataProvider) {
      this.dataProvider.data.forEach((obj) =>
        addOption(obj.id, obj.text || obj.id),
      );
    }
  }

  addCSS() {
    const css = setStyle;
    const style = getStyle(this.selector);
    const parentHeight =
      getNumberValue(getStyle(this.selector.parentNode).height) - 2;

    css(this.selector, "min-width", this.minWidth);
    css(this.label, "padding-top", this.labelPaddingTop);
    css(this.label, "height", `${parentHeight}px`);
    css(this.label, "margin-left", this.labelMarginLeft);

    const ua = navigator.userAgent;
    if (ua.match(/Edge/))
      css(this.selector, "margin-left", this.selectorMarginLeft);
    else if (ua.match(/MSIE/)) {
      css(this.selector, "margin-top", this.selectorMarginTop);
      css(this.selector, "margin-left", this.selectorMarginLeft);
    }
  }

  addBindings() {
    const css = setStyle;

    if (this.hideable) {
      this.label.addEventListener(this.activate, (event) => {
        event.preventDefault();
        css(this.label, "display", "none");
        css(this.selector, "display", "inline-block");
        this.fireEvent(this.activate, event);
      });

      this.selector.addEventListener("blur", () => {
        css(this.label, "display", "inline-block");
        css(this.selector, "display", "none");
        this.fireEvent("blur");
      });

      this.selector.addEventListener("mouseleave", () => {
        if (this.selector !== document.activeElement) {
          css(this.label, "display", "inline-block");
          css(this.selector, "display", "none");
        }
        this.fireEvent("mouseleave");
      });
    }

    this.selector.addEventListener("change", (ev) => {
      setTimeout(() => {
        const value = ev.target.value || "0";
        const text = ev.target[ev.target.selectedIndex].innerHTML;
        this.label.innerText = text;
        const data = { id: value, text };

        if (this.model && !this.selector.getAttribute("gadgetui-bind")) {
          this.model.set(this.selector.name, data);
        }
        if (this.emitEvents)
          trigger(this.selector, "gadgetui-input-change", data);
        if (this.func) this.func(data);
        this.value = data;
      }, 100);

      this.fireEvent("change", ev);
    });
  }

  config(options) {
    this.model = options.model;
    this.dataProvider = options.dataProvider;
    this.func = options.func;
    this.emitEvents = options.emitEvents ?? true;
    this.activate = options.activate || "mouseenter";
    this.hideable = options.hideable || false;
    // CSS options with defaults
    this.minWidth = options.minWidth || "100px";
    this.labelPaddingTop = options.labelPaddingTop || "2px";
    this.labelMarginLeft = options.labelMarginLeft || "9px";
    this.selectorMarginLeft = options.selectorMarginLeft || "5px";
    this.selectorMarginTop = options.selectorMarginTop || "0px";
  }
}
