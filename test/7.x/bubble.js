import { gadgetui } from "/dist/gadget-ui.es.js";

const bubble = gadgetui.objects.Constructor(
	gadgetui.display.Bubble,
	[
		{
			color: "black",
			borderColor: "red",
			backgroundColor: "white",
			borderWidth: 1,
			font: "Nimbus Roman Bold",
			fontSize: 20,
			justifyText: false,
		},
	],
	true,
);

bubble.setText(
	`Pick your preferred food. Add a choice if you prefer something else.`,
);

bubble.setBubble(6, 40, 280, 100, "topright", 70, 45);

bubble.render();

bubble.attachToElement(document.getElementById("food"), "bottomleft");

document.querySelector("#food").addEventListener("change", function (event) {
	bubble.destroy();
});
