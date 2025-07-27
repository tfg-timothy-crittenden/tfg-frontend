import { Route, Routes, Navigate } from "react-router-dom";

import Header from "@/components/Header/Header";
import Login from "@/views/Login/Login";
import Unauthorised from "@/views/Unauthorised/Unauthorised";
import AcceptInvite from "@/views/AcceptInvite/AcceptInvite";

import SpeakingPart1Container from "@/views/SpeakingPart1/SpeakingPart1Container";
import SpeakingPart2Container from "@/views/SpeakingPart2/SpeakingPart2Container";
import SpeakingPart3Container from "@/views/SpeakingPart3/SpeakingPart3Container";
import SpeakingPart4Container from "@/views/SpeakingPart4/SpeakingPart4Container";

import AdminDashboard from "@/views/AdminDashboard/AdminDashboard";
import AdminTeachers from "@/views/AdminDashboard/AdminTeachers";
import AdminClasses from "@/views/AdminDashboard/AdminClasses";
import AdminMaterial from "@/views/AdminDashboard/AdminMaterial";

import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import RoleRoute from "@/components/RoleRoute/RoleRoute";

function App() {
	return (
		<>
			<Header />
			<Routes>
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/login" element={<Login />} />
				<Route path="/unauthorised" element={<Unauthorised />} />
				<Route path="/invite/accept" element={<AcceptInvite />} />

				<Route element={<PrivateRoute />}>
					<Route path="/part_1" element={<SpeakingPart1Container />} />
					<Route path="/part_2" element={<SpeakingPart2Container />} />
					<Route path="/part_3" element={<SpeakingPart3Container />} />
					<Route path="/part_4" element={<SpeakingPart4Container />} />

					{/* ADMIN: protected nested dashboard */}
					<Route element={<RoleRoute allowedRoles={["admin"]} />}>
						<Route path="/admin_dashboard" element={<AdminDashboard />}>
							<Route path="teachers" element={<AdminTeachers />} />
							<Route path="classes" element={<AdminClasses />} />
							<Route path="materials" element={<AdminMaterial />} />
						</Route>
					</Route>
				</Route>
			</Routes>
		</>
	);
}

export default App;
