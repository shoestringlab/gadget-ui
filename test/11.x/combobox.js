import { gadgetui, combobox, model } from "/dist/gadget-ui.es.js";

var user = { food: "" };
var foods = [
	{ text: "cereal", id: 1 },
	{ text: "eggs", id: 2 },
	{ text: "danish", id: 3 },
];

// set the model first if we're using auto data-binding
model.set("user", user);

const cb = new combobox(document.querySelector("select[name='food']"), {
	animate: true,
	glowColor: "gold",
	save: function (text, resolve, reject) {
		console.log("saving new value");
		if (foods.constructor === Array) {
			var newId = foods.length + 1;
			foods.push({ text: text, id: newId });
			resolve(newId);
		} else {
			reject("Value was not saved.");
		}
	},
	dataProvider: {
		// you can pre-populate 'data' or the refresh() function will be called when you instantiate the ComboBox
		//data : undefined,
		refresh: function (dataProvider, resolve, reject) {
			if (foods.constructor === Array) {
				dataProvider.data = foods;
				resolve();
			} else {
				reject("Data set is not an array.");
			}
		},
	},
});

cb.on("keyup", function (obj) {
	console.log("keyup: ");
	console.dir(obj);
});

document
	.querySelector("select[name='food']")
	.addEventListener("gadgetui-combobox-change", function (event) {
		console.log(event.detail);
	});
