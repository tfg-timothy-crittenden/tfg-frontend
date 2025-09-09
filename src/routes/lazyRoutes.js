// src/routes/lazyRoutes.js
import { lazy } from "react";

// helper so we only import once
const once = (fn) => {
	let done = false;
	let p;
	return () => {
		if (!done) {
			done = true;
			p = fn();
		}
		return p;
	};
};

// ===== Admin =====
export const _importAdminDashboard = once(() =>
	import("@/views/AdminDashboard/AdminDashboard")
);
export const _importAdminTeachers = once(() =>
	import("@/views/AdminDashboard/AdminTeachers")
);
export const _importAdminClasses = once(() =>
	import("@/views/AdminDashboard/AdminClasses")
);
export const _importAdminMaterial = once(() =>
	import("@/views/AdminDashboard/AdminMaterial/AdminMaterial")
);

// Prefetch all admin chunks at once (handy for the parent link)
export const prefetchAdminAll = () => {
	_importAdminDashboard();
	_importAdminTeachers();
	_importAdminClasses();
	_importAdminMaterial();
};

// Lazy components (use these in <Routes>)
export const AdminDashboard = lazy(_importAdminDashboard);
export const AdminTeachers = lazy(_importAdminTeachers);
export const AdminClasses = lazy(_importAdminClasses);
export const AdminMaterial = lazy(_importAdminMaterial);

// ===== Public / Private views (optional: add prefetchers as needed) =====

export const OAuthLogin = lazy(() => import("@/views/OAuthLogin/OAuthLogin"));
export const Unauthorised = lazy(() =>
	import("@/views/Unauthorised/Unauthorised")
);
export const AcceptInvite = lazy(() =>
	import("@/views/AcceptInvite/AcceptInvite")
);
export const UserClassrooms = lazy(() =>
	import("@/views/UserClassrooms/UserClassrooms")
);
export const Classroom = lazy(() => import("@/views/Classroom/Classroom"));
export const StudentSignup = lazy(() =>
	import("@/views/StudentSignup/StudentSignup")
);
export const EmailVerification = lazy(() =>
	import("@/views/EmailVerification/EmailVerification")
);
