import { gadgetui } from "/dist/gadget-ui.es.js";

const { Slideshow } = gadgetui.display;

// Shared data set for the template-driven demos.
const slides = [
	{ src: "/test/img/1.jpg", title: "Mountains", text: "rendered from a template" },
	{ src: "/test/img/2.jpg", title: "Harbour", text: "data array of objects" },
	{ src: "/test/img/3.jpg", title: "Forest", text: "one object per slide" },
	{ src: "/test/img/4.jpg", title: "Desert", text: "ES template literal" },
	{ src: "/test/img/5.jpg", title: "Coast", text: "(item, index) => html" },
];

// An ES template-literal function: receives one data item plus its index and
// returns the slide's inner HTML.
const cardTemplate = (item, i) => `
	<div class="slide-card">
		<img src="${item.src}" alt="${item.title}" />
		<div class="caption"><strong>${item.title}</strong> — ${item.text} (#${i + 1})</div>
	</div>`;

// --- 1. Template + data, horizontal slide, with manual controls ----------
const ss1 = new Slideshow(document.getElementById("ss-template"), {
	template: cardTemplate,
	data: slides,
	transition: "slide",
	direction: "horizontal",
	interval: 3000,
	transitionDuration: 600,
});

const log = document.getElementById("log");
const append = (msg) => {
	log.textContent = `• ${msg}\n` + log.textContent;
};
ss1.on("slideChanged", (c, a) => append(`slideChanged → index ${a.index}`));

document.getElementById("prev").onclick = () => ss1.prev();
document.getElementById("next").onclick = () => ss1.next();
document.getElementById("pause").onclick = () => ss1.pause();
document.getElementById("play").onclick = () => ss1.play();
document.getElementById("goto").onclick = () => ss1.goTo(2);

// --- 2. Existing child divs as slides, fade transition -------------------
new Slideshow(document.getElementById("ss-children"), {
	transition: "fade",
	interval: 2500,
	transitionDuration: 500,
});

// --- 3. Template + data, vertical slide ----------------------------------
new Slideshow(document.getElementById("ss-vertical"), {
	template: cardTemplate,
	data: slides,
	transition: "slide",
	direction: "vertical",
	interval: 3000,
});

// --- 4. Async datasource (Promise of an array), fade, height option ------
const fakeFetch = () =>
	new Promise((resolve) => setTimeout(() => resolve(slides.slice(0, 3)), 500));

new Slideshow(document.getElementById("ss-datasource"), {
	datasource: fakeFetch,
	template: cardTemplate,
	transition: "fade",
	interval: 1800,
	height: 240, // number → px; sizes the component (no CSS height needed)
});

// --- 5. transition: "none" (instant), no controls/indicators -------------
new Slideshow(document.getElementById("ss-none"), {
	template: cardTemplate,
	data: slides,
	transition: "none",
	interval: 1200,
	showControls: false,
	showIndicators: false,
});
