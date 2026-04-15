import { toggle } from "/dist/gadget-ui.es.js";

const toggler = new toggle({ selector: "#toggler", shape: "round" });

const toggler2 = new toggle({ parentSelector: "#parentDiv", shape: "square" });
