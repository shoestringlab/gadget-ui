import terser from "@rollup/plugin-terser";

const input = "src/javascript/gadget-ui.export.js";

export default [
	// ES module build
	{
		input,
		output: [
			{
				file: "dist/gadget-ui.es.js",
				format: "es",
				sourcemap: true,
			},
			{
				file: "dist/gadget-ui.min.es.js",
				format: "es",
				sourcemap: true,
				plugins: [terser()],
			},
		],
	},
	// IIFE build (global variable for script tags)
	{
		input: "src/javascript/gadget-ui.iife.js",
		output: [
			{
				file: "dist/gadget-ui.js",
				format: "iife",
				name: "gadgetui",
				sourcemap: true,
			},
			{
				file: "dist/gadget-ui.min.js",
				format: "iife",
				name: "gadgetui",
				sourcemap: true,
				plugins: [terser()],
			},
		],
	},
];
