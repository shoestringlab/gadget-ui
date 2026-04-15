import { gadgetui } from "/dist/gadget-ui.es.js";

const toggler = new gadgetui.input.Toggle({ selector: "#toggler", shape: "round" });

const toggler2 = new gadgetui.input.Toggle({ parentSelector: "#parentDiv", shape: "square" });
