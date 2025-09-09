import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig({
	plugins: [react(), svgr()],
	base: "/", // Use relative paths for assets
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 5173, // Dev server port
		historyApiFallback: true, // esto es crítico para SPA routin	g
	},
	preview: {
		port: 5173, // Preview server port (same as dev)
		host: true, // Allow external connections
	},
});
