import daisyui from "daisyui";

import type { Config as DaisyUIConfig } from "daisyui";
import type { Config } from "tailwindcss";

export default {
	important: true,
	content: ["./index.html", "./src/**/*"],
	theme: {
		fontFamily: {
			sans: [
				"-apple-system",
				"BlinkMacSystemFont",
				"Segoe UI",
				"Roboto",
				"Ubuntu",
				"Helvetica Neue",
				"Noto Sans",
				"Liberation Sans",
				"Arial",
				"Microsoft JhengHei",
				"Microsoft JhengHei UI",
				"Noto Sans HK",
				"Noto Sans CJK HK",
				"sans-serif",
				"Apple Color Emoji",
				"Segoe UI Emoji",
				"Segoe UI Symbol",
				"Noto Color Emoji",
			],
			symbol: [
				"-apple-system",
				"BlinkMacSystemFont",
				'"Noto Sans Symbols 2"',
				"Segoe UI Symbol",
				"sans-serif",
			],
		},
		extend: {
			screens: {
				xs: "440px",
				sm: "540px",
			},
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				light: {
					"primary": "#139ee6",
					"primary-content": "#fefefe",
					"secondary": "#0fccab",
					"secondary-content": "#fefefe",
					"accent": "#1da0bf",
					"accent-content": "#fefefe",
					"neutral": "#262c3d",
					"neutral-content": "#fefefe",
					"base-100": "#fefefe",
					"base-200": "#f1ede3",
					"base-300": "#dcd1b9",
					"base-content": "#262c3d",
					"info": "#3974f0",
					"success": "#16a34a",
					"warning": "#f0c373",
					"error": "#da3b43",
				},
			},
		],
	} satisfies DaisyUIConfig,
} satisfies Config;
