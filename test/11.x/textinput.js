import { gadgetui } from "/dist/gadget-ui.es.js";

var user = { firstname: "", lastname: "" };

// set the model first if we're using auto data-binding
gadgetui.model.set("user", user);

var fname = new gadgetui.input.TextInput(
	document.querySelector("input[name='firstname']"),
	{
		emitEvents: true,
		enforceMaxWidth: true,
		maxWidth: 200,
	},
);

var lname = new gadgetui.input.TextInput(
	document.querySelector("input[name='lastname']"),
	{
		emitEvents: true,
		enforceMaxWidth: true,
		hideable: true,
	},
);

lname.on("focus", function (event) {
	console.log("Focused on the lname control.");
});

var nick = new gadgetui.input.TextInput(
	document.querySelector("input[name='nickname']"),
	{
		emitEvents: true,
		enforceMaxWidth: true,
		hideable: false,
	},
);

document
	.querySelector("input[name='firstname']")
	.addEventListener("gadgetui-input-change", function (event) {
		console.log(event.detail);
	});

document
	.querySelector("input[name='lastname']")
	.addEventListener("gadgetui-input-change", function (event) {
		console.log(event.detail);
	});

gadgetui.model.bind(
	"user.firstname",
	document.querySelector("span[name='firstname']"),
);
gadgetui.model.bind(
	"user.lastname",
	document.querySelector("span[name='lastname']"),
);
