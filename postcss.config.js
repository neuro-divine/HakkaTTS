// @ts-check
import postCSSNesting from "postcss-nesting";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting/index.js"; // eslint-disable-line import/extensions

/** @satisfies { import("postcss").ProcessOptions & { plugins?: import("postcss").AcceptedPlugin[] } } */
const exports = {
	plugins: [
		tailwindcssNesting(postCSSNesting({ edition: "2024-02" })),
		tailwindcss(),
	],
};
export default exports;
