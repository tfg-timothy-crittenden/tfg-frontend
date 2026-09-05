import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import svgr from "vite-plugin-svgr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createDevProxy = (target) => ({
	target,
	changeOrigin: true,
	secure: false,
	configure: (proxy) => {
		proxy.on("proxyReq", (proxyReq) => {
			proxyReq.removeHeader("origin");
			proxyReq.removeHeader("cookie");
		});
	},
});

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
		proxy: {
			"/users/api": createDevProxy("http://localhost:8080"),
			"/materials/api": createDevProxy("http://localhost:8080"),
			"/classrooms/api": createDevProxy("http://localhost:8080"),
		},
	},
	preview: {
		port: 5173, // Preview server port (same as dev)
		host: true, // Allow external connections
	},
});
