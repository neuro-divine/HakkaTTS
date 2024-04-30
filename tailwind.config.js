/** @type {import("tailwindcss").Config} */
module.exports = {
	important: true,
	content: ["./src/**/*"],
	theme: {
		fontFamily: {
			sans: [
				"-apple-system",
				"BlinkMacSystemFont",
				"Segoe UI",
				"Roboto",
				"Helvetica Neue",
				"Noto Sans",
				"Liberation Sans",
				"Arial",
				"sans-serif",
			],
		},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: ["cmyk"],
	},
};
