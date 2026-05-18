import { gadgetui } from "/dist/gadget-ui.es.js";

const logEl = document.getElementById("event-log");
function log(name, payload) {
	const line = document.createElement("div");
	line.textContent = `[${new Date().toLocaleTimeString()}] ${name}` +
		(payload ? ` ${JSON.stringify(payload)}` : "");
	logEl.appendChild(line);
	logEl.scrollTop = logEl.scrollHeight;
}

function wireLifecycle(pop, label) {
	pop.on("opened", () => log(`${label}: opened`));
	pop.on("closed", () => log(`${label}: closed`));
	pop.on("removed", () => log(`${label}: removed`));
}

// 1. Default popover — no anchor, no portal. Should render at the CSS
//    placeholder position (top: 100px; left: 50%) and behave exactly like
//    a pre-12.3.0 Popover. autoOpen: false so the demo controls drive it.
const popDefault = new gadgetui.display.Popover(
	document.getElementById("pop-default"),
	{ autoOpen: false },
);
wireLifecycle(popDefault, "default");

document
	.getElementById("btn-default-open")
	.addEventListener("click", () => popDefault.open());
document
	.getElementById("btn-default-close")
	.addEventListener("click", () => popDefault.close());

// 2. Anchored popover — placement: bottom (default), align: left (default).
//    autoOpen stays true (default) — clicking the trigger reopens via
//    open() each time so the position re-syncs to the current rect.
const anchorBottomLeft = document.getElementById("anchor-bottom-left");
const popBottomLeft = new gadgetui.display.Popover(
	document.getElementById("pop-bottom-left"),
	{
		anchor: anchorBottomLeft,
		autoOpen: false,
	},
);
wireLifecycle(popBottomLeft, "bottom-left");

anchorBottomLeft.addEventListener("click", () => {
	if (popBottomLeft.element.classList.contains("gadgetui-showPopover")) {
		popBottomLeft.close();
	} else {
		popBottomLeft.open();
	}
});

// 3. Anchored — placement: top, align: right.
const anchorTopRight = document.getElementById("anchor-top-right");
const popTopRight = new gadgetui.display.Popover(
	document.getElementById("pop-top-right"),
	{
		anchor: anchorTopRight,
		placement: "top",
		align: "right",
		autoOpen: false,
	},
);
wireLifecycle(popTopRight, "top-right");

anchorTopRight.addEventListener("click", () => {
	if (popTopRight.element.classList.contains("gadgetui-showPopover")) {
		popTopRight.close();
	} else {
		popTopRight.open();
	}
});

// 4. Anchored + portal — the trigger lives inside an overflow:hidden +
//    transformed container. Without portal, the popover would be clipped
//    at the container edges. portal: true mounts it on body.
const anchorPortal = document.getElementById("anchor-portal");
const popPortal = new gadgetui.display.Popover(
	document.getElementById("pop-portal"),
	{
		anchor: anchorPortal,
		portal: true,
		placement: "bottom",
		align: "left",
		autoOpen: false,
	},
);
wireLifecycle(popPortal, "portal");

anchorPortal.addEventListener("click", () => {
	if (popPortal.element.classList.contains("gadgetui-showPopover")) {
		popPortal.close();
	} else {
		popPortal.open();
	}
});

// 5. Destroy the bottom-left popover and verify "removed" fires.
document
	.getElementById("btn-destroy-bottom-left")
	.addEventListener("click", () => popBottomLeft.destroy());
