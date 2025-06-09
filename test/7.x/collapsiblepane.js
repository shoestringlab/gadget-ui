import { gadgetui } from "/dist/gadget-ui.es.js";

var collapser = gadgetui.objects.Constructor(
	gadgetui.display.CollapsiblePane,
	[
		document.querySelector("div[name='collapser']"),
		{
			title: "Random Text",
			path: "/dist/",
			collapse: true,
			class: "myPane",
			headerClass: "myHeader",
		},
	],
	true,
);

var collapser2 = gadgetui.objects.Constructor(
	gadgetui.display.CollapsiblePane,
	[
		document.querySelector("div[name='collapser2']"),
		{
			title: "Random Title",
			path: "/dist/",
			collapse: true,
		},
	],
	true,
);

collapser.on("maximized", function (obj) {
	console.log("Custom pane: maximized");
	console.log(obj);
});

collapser.on("minimized", function (obj) {
	console.log("Custom pane: minimized");
	console.log(obj);
});
