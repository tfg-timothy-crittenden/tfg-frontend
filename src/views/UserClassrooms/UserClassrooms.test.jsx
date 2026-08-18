import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/auth/authSlice";
import UserClassrooms from "./UserClassrooms";

// Mock custom hooks — components must not know about API internals
const { mockMutateAsync } = vi.hoisted(() => ({
	mockMutateAsync: vi.fn(),
}));

vi.mock("@/domain/classrooms/hooks/useClassrooms", () => ({
	useClassrooms: () => ({
		data: [],
		isLoading: false,
		error: null,
	}),
	classroomsQueryKey: (userId) => ["classrooms", "member", userId],
}));

vi.mock("@/domain/classrooms/hooks/useJoinClassroom", () => ({
	useJoinClassroom: () => ({
		mutateAsync: mockMutateAsync,
		isPending: false,
	}),
}));

// Test constants
const TEST_JOIN_CODE = "ABC123";
const TEST_ERROR_MESSAGE = "Invalid class code";

const createMockStore = () =>
	configureStore({
		reducer: { auth: authReducer },
		preloadedState: {
			auth: {
				user: { id: "123", email: "test@example.com" },
				error: null,
				loading: false,
				token: "mock-token",
				isAuthenticated: true,
			},
		},
	});

const renderWithProviders = (component) => {
	const store = createMockStore();
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<MemoryRouter initialEntries={["/my/classrooms"]}>
					<Routes>
						<Route path="/my/classrooms" element={component} />
						<Route path="/my/classrooms/:id/*" element={component} />
					</Routes>
				</MemoryRouter>
			</Provider>
		</QueryClientProvider>,
	);
};

describe("UserClassrooms - Join Error Handling", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should display error message when join fails", async () => {
		const user = userEvent.setup();
		mockMutateAsync.mockRejectedValueOnce({
			response: { data: { error: TEST_ERROR_MESSAGE } },
		});

		renderWithProviders(<UserClassrooms />);

		await user.click(screen.getByRole("button", { name: "" }));
		await user.type(
			await screen.findByLabelText(/class code/i),
			TEST_JOIN_CODE,
		);
		await user.click(screen.getByRole("button", { name: /join/i }));

		await waitFor(() => {
			expect(screen.getByText(TEST_ERROR_MESSAGE)).toBeInTheDocument();
		});
	});

	it("should display default error message when API error has no message", async () => {
		const user = userEvent.setup();
		mockMutateAsync.mockRejectedValueOnce(new Error("Network error"));

		renderWithProviders(<UserClassrooms />);

		await user.click(screen.getByRole("button", { name: "" }));
		await user.type(
			await screen.findByLabelText(/class code/i),
			TEST_JOIN_CODE,
		);
		await user.click(screen.getByRole("button", { name: /join/i }));

		await waitFor(() => {
			expect(screen.getByText("Could not join class")).toBeInTheDocument();
		});
	});

	it("should display validation error when entering empty code", async () => {
		const user = userEvent.setup();

		renderWithProviders(<UserClassrooms />);

		await user.click(screen.getByRole("button", { name: "" }));
		await user.click(screen.getByRole("button", { name: /join/i }));

		await waitFor(() => {
			expect(screen.getByText("Enter a class code")).toBeInTheDocument();
		});
	});
});
