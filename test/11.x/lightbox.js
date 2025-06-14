import { gadgetui } from "/dist/gadget-ui.es.js";

const imageArray = [
	"/test/img/1.jpg",
	"/test/img/2.jpg",
	"/test/img/3.jpg",
	"/test/img/4.jpg",
	"/test/img/5.jpg",
];

const lb = new gadgetui.display.Lightbox(document.getElementById("lightbox"), {
	images: imageArray,
	time: 3000,
	enableModal: false,
});

document.getElementById("animate").addEventListener("click", function (event) {
	lb.animate();
});

document
	.getElementById("stopAnimation")
	.addEventListener("click", function (event) {
		lb.stopAnimation();
	});
