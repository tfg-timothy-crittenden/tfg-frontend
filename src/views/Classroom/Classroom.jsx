import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SideNavBar from "@/components/SideNavBar/SideNavBar";
import { getClassroomTaskSummaries } from "@/api/tasks/tasksAPI";

const Classroom = () => {
	const { id: classroomId } = useParams();
	const [taskSummaries, setTaskSummaries] = useState({});
	const [currentTest, setCurrentTest] = useState(null);

	useEffect(() => {
		getClassroomTaskSummaries(classroomId)
			.then(setTaskSummaries)
			.catch((err) => console.error("Failed to load summaries:", err));
	}, [classroomId]);

	const loadTest = (testId) => {
		setCurrentTest({ id: testId });
	};

	return (
		<div style={{ display: "flex" }}>
			<SideNavBar
				taskSummaries={taskSummaries}
				currentTest={currentTest}
				loadTest={loadTest}
			/>
			<div style={{ flex: 1 }}>
				<Outlet context={{ currentTest, setCurrentTest }} />
			</div>
		</div>
	);
};

export default Classroom;
