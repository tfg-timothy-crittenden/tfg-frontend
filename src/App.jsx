// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import Header from "@/components/Header/Header";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import RoleRoute from "@/components/RoleRoute/RoleRoute";
import AuthCallback from "@/views/AuthCallback/AuthCallback";

import {
	OAuthLogin,
	Unauthorised,
	UserClassrooms,
	Classroom,
	AdminDashboard,
	AdminTeachers,
	AdminClasses,
	AdminMaterial,
	StudentSignup,
	EmailVerification,
} from "@/routes/lazyRoutes";

const Fallback = () => <div style={{ padding: 24 }}>Loading…</div>;

function App() {
	return (
		<>
			<Header />
			<Suspense fallback={<Fallback />}>
				<Routes>
					{/* Public */}
					<Route path="/login" element={<OAuthLogin />} />
					<Route path="/auth/callback" element={<AuthCallback />} />

					{/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

					<Route path="/unauthorised" element={<Unauthorised />} />
					{/* <Route path="/invite/accept" element={<AcceptInvite />} /> */}
					<Route path="/signup" element={<StudentSignup />} />
					<Route path="/signup/:classCode" element={<StudentSignup />} />
					<Route path="/verify-email/:token" element={<EmailVerification />} />
					<Route path="/verify-email" element={<EmailVerification />} />
					{/* Private */}
					<Route element={<PrivateRoute />}>
						<Route path="/my/classrooms" element={<UserClassrooms />}>
							<Route
								path=":id/test/:testId/part/:partNumber/*"
								element={<Classroom />}
							/>
						</Route>
					</Route>
					{/* Admin-only */}
					<Route element={<RoleRoute allowedRoles={["admin"]} />}>
						<Route path="/admin_dashboard" element={<AdminDashboard />}>
							<Route path="teachers" element={<AdminTeachers />} />
							<Route path="classes" element={<AdminClasses />} />
							<Route path="materials" element={<AdminMaterial />} />
						</Route>
					</Route>
					{/* 404 */}
				</Routes>
			</Suspense>
		</>
	);
}

export default App;
