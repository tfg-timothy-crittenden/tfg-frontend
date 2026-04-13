// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import Header from "@/components/Header/Header";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import RoleRoute from "@/components/RoleRoute/RoleRoute";
import AuthCallback from "@/views/AuthCallback/AuthCallback";
import { ROUTES, ADMIN_SEGMENTS, ROUTE_SEGMENTS } from "@/routes/routeConfig";

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
	PasswordResetRequest,
	PasswordResetConfirm,
} from "@/routes/lazyRoutes";

const Fallback = () => <div style={{ padding: 24 }}>Loading…</div>;

function App() {
	return (
		<>
			<Header />
			<Suspense fallback={<Fallback />}>
				<Routes>
					{/* Public routes */}
					<Route path={ROUTES.LOGIN} element={<OAuthLogin />} />
					<Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
					<Route path={ROUTES.UNAUTHORISED} element={<Unauthorised />} />
					<Route path={ROUTES.SIGNUP} element={<StudentSignup />} />
					<Route path={ROUTES.SIGNUP_WITH_CODE} element={<StudentSignup />} />
					<Route
						path={ROUTES.VERIFY_EMAIL_WITH_TOKEN}
						element={<EmailVerification />}
					/>
					<Route path={ROUTES.VERIFY_EMAIL} element={<EmailVerification />} />
					<Route path="/password-reset" element={<PasswordResetRequest />} />
					<Route path="/reset-password" element={<PasswordResetConfirm />} />

					{/* Private routes */}
					<Route element={<PrivateRoute />}>
						<Route path={ROUTES.CLASSROOMS} element={<UserClassrooms />}>
							{/* Welcome route - no test selected */}
							<Route path=":id" element={<Classroom />} />
							<Route path=":id/members" element={<Classroom />} />
							{/* Global test instructions route */}
							<Route
								path={ROUTES.SECTION_INSTRUCTIONS.replace(
									`/${ROUTES.CLASSROOMS}/`,
									"",
								)}
								element={<Classroom />}
							/>

							{/* Generic part + mode route */}
							<Route
								path={ROUTES.SECTION_PART.replace(`/${ROUTES.CLASSROOMS}/`, "")}
								element={<Classroom />}
							/>
							{/* Part-specific mode routes */}
							<Route
								path={ROUTES.PART_INSTRUCTIONS.replace(
									`/${ROUTES.CLASSROOMS}/`,
									"",
								)}
								element={<Classroom />}
							/>

							<Route
								path={ROUTES.PART_PREPARE.replace(`/${ROUTES.CLASSROOMS}/`, "")}
								element={<Classroom />}
							/>

							<Route
								path={ROUTES.PART_SPEAK.replace(`/${ROUTES.CLASSROOMS}/`, "")}
								element={<Classroom />}
							/>

							<Route
								path={ROUTES.PART_READ.replace(`/${ROUTES.CLASSROOMS}/`, "")}
								element={<Classroom />}
							/>

							<Route
								path={ROUTES.PART_LISTEN.replace(`/${ROUTES.CLASSROOMS}/`, "")}
								element={<Classroom />}
							/>
						</Route>
					</Route>

					{/* Admin-only routes */}
					<Route element={<RoleRoute allowedRoles={["admin"]} />}>
						<Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />}>
							<Route
								path={ADMIN_SEGMENTS.TEACHERS}
								element={<AdminTeachers />}
							/>
							<Route path={ADMIN_SEGMENTS.CLASSES} element={<AdminClasses />} />
							<Route
								path={ADMIN_SEGMENTS.MATERIALS}
								element={<AdminMaterial />}
							/>
						</Route>
					</Route>

					{/* Default redirect */}
					<Route
						path="/"
						element={<Navigate to={ROUTES.CLASSROOMS} replace />}
					/>
				</Routes>
			</Suspense>
		</>
	);
}

export default App;
