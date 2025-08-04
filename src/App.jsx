import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Header from "@/components/Header/Header";
import Login from "@/views/Login/Login";
import Unauthorised from "@/views/Unauthorised/Unauthorised";
import AcceptInvite from "@/views/AcceptInvite/AcceptInvite";

import Read from "@/components/Read/Read";
import Listen from "@/components/Listen/ListenLectureContainer";
import PrepareSpeak from "@/components/PrepareSpeak/PrepareSpeak";

import SpeakingPart2Container from "@/views/SpeakingPart2/SpeakingPart2Container";

import UserClassrooms from "@/views/UserClassrooms/UserClassrooms";

import AdminDashboard from "@/views/AdminDashboard/AdminDashboard";
import AdminTeachers from "@/views/AdminDashboard/AdminTeachers";
import AdminClasses from "@/views/AdminDashboard/AdminClasses";
import AdminMaterial from "@/views/AdminDashboard/AdminMaterial";

import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import RoleRoute from "@/components/RoleRoute/RoleRoute";

import SideNavBar from "@/components/SideNavBar/SideNavBar";
import Classroom from "@/views/Classroom/Classroom";

import ClassroomHeader from "./components/ClassroomHeader/ClassroomHeader";

function App() {
	return (
		<>
			<Header />

			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/login" element={<Login />} />
				<Route path="/unauthorised" element={<Unauthorised />} />
				<Route path="/invite/accept" element={<AcceptInvite />} />

				{/* Private Routes */}
				<Route element={<PrivateRoute />}>
					<Route path="/my/classrooms" element={<UserClassrooms />}>
						<Route
							path=":id/test/:testId/part/:partNumber/*" /*Wildcard allows for the addition of "topic" at end of url when part 1 is selected*/
							element={<Classroom />}
						/>
					</Route>
				</Route>

				{/* Admin Routes */}
				<Route element={<RoleRoute allowedRoles={["admin"]} />}>
					<Route path="/admin_dashboard" element={<AdminDashboard />}>
						<Route path="teachers" element={<AdminTeachers />} />
						<Route path="classes" element={<AdminClasses />} />
						<Route path="materials" element={<AdminMaterial />} />
					</Route>
				</Route>
			</Routes>
		</>
	);
}

export default App;
