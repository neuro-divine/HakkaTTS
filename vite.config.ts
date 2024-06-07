import dsv from "@rollup/plugin-dsv";
import react from "@vitejs/plugin-react-swc";
import autoprefixer from "autoprefixer";
import postCSSNesting from "postcss-nesting";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { ViteMinifyPlugin } from "vite-plugin-minify";

import type { UserConfig } from "vite";

export default {
	base: "./",
	plugins: [
		react(),
		dsv(),
		ViteMinifyPlugin(),
		ViteImageOptimizer(),
	],
	css: {
		postcss: {
			plugins: [
				tailwindcssNesting(postCSSNesting({ edition: "2024-02" })),
				tailwindcss(),
				autoprefixer(),
			],
		},
	},
	build: {
		outDir: "build",
		target: "ES2017",
		rollupOptions: {
			output: {
				assetFileNames: "[name].[hash].[ext]",
				chunkFileNames: "[name].[hash].js",
				entryFileNames: "[name].[hash].js",
				hashCharacters: "hex",
			},
		},
	},
} satisfies UserConfig;
