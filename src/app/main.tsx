import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import "@/index.css";
import { queryClient } from "@/api/queryClient";
import AppWrapper from "@/components/AppWrapper/AppWrapper";
import App from "./App";
import store from "./store/store";

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
