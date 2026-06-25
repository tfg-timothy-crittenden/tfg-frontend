import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";
import store from "./store/store.js";
import { Provider } from "react-redux";
import AppWrapper from "./components/AppWrapper/AppWrapper.jsx";
import { queryClient } from "@/api/queryClient";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>
					{/* Wrap the App in AppWrapper to handle global logout on token expiration*/}
					<AppWrapper>
						<App />
					</AppWrapper>
				</BrowserRouter>
			</QueryClientProvider>
		</Provider>
	</StrictMode>,
);
