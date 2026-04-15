import { gadgetui } from "/dist/gadget-ui.es.js";

var collapser = new gadgetui.display.CollapsiblePane(
	document.querySelector("div[name='collapser']"),
	{
		title: "Random Text",
		path: "/dist/",
		collapse: true,
		class: "myPane",
		headerClass: "myHeader",
	},
);

var collapser2 = new gadgetui.display.CollapsiblePane(
	document.querySelector("div[name='collapser2']"),
	{
		title: "Random Title",
		path: "/dist/",
		collapse: true,
	},
);

collapser.on("maximized", function (obj) {
	console.log("Custom pane: maximized");
	console.log(obj);
});

collapser.on("minimized", function (obj) {
	console.log("Custom pane: minimized");
	console.log(obj);
});
