// postcss.config.js (or .cjs if using CJS)
export default {
	plugins: {
		// must come BEFORE postcss-custom-media
		"@csstools/postcss-global-data": {
			files: ["src/styles/media.css"], // one or many files with @custom-media
		},
		"postcss-custom-media": { preserve: false },
		"postcss-nesting": {},
		autoprefixer: {},
	},
};
