import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SideNavBar from "@/components/SideNavBar/SideNavBar";
import {
	getClassroomStudentTaskSummaries,
	getClassroomTeacherTaskSummaries,
} from "@/api/tasks/tasksAPI";

import { useSelector } from "react-redux";
import { selectHasRole } from "@/store/auth/authSlice";

const Classroom = () => {
	const { id: classroomId } = useParams();
	const [studentTaskSummaries, setStudentTaskSummaries] = useState({});
	const [teacherTaskSummaries, setTeacherTaskSummaries] = useState({});
	const [currentTest, setCurrentTest] = useState(null);
	const [selectedSource, setSelectedSource] = useState(null); // ✅ Track the origin

	const hasTeacherRole = useSelector(selectHasRole(["teacher"]));

	const [topics, setTopics] = useState([]);
	const [topicData, setTopicData] = useState({});
	const [currentTopic, setCurrentTopic] = useState(null);

	useEffect(() => {
		getClassroomStudentTaskSummaries(classroomId)
			.then(setStudentTaskSummaries)
			.catch((err) => console.error("Failed to load student summaries:", err));

		if (!hasTeacherRole) return;
		getClassroomTeacherTaskSummaries(classroomId)
			.then(setTeacherTaskSummaries)
			.catch((err) => console.error("Failed to load teacher summaries:", err));
	}, [classroomId, hasTeacherRole]);

	const loadTest = (testId, source) => {
		setCurrentTest({ id: testId });
		setSelectedSource(source);
	};

	const handleTopicChange = (topic) => {
		setCurrentTopic(topic);
	};

	useEffect(() => {
		const loadTopics = async () => {
			try {
				const response = await fetch("/questions_part_1_and_officials.json");
				const data = await response.json();
				setTopicData(data);
				const keys = Object.keys(data);
				setTopics(keys);
				if (keys.length > 0) setCurrentTopic(keys[0]);
			} catch (err) {
				console.error("Error loading Part 1 topics:", err);
			}
		};
		loadTopics();
	}, []);

	return (
		<div style={{ display: "flex" }}>
			<SideNavBar
				studentTaskSummaries={studentTaskSummaries}
				teacherTaskSummaries={teacherTaskSummaries}
				currentTest={currentTest}
				selectedSource={selectedSource} // ✅ Pass selected source
				loadTest={loadTest}
				topics={topics}
				currentTopic={currentTopic}
				handleTopicChange={handleTopicChange}
			/>

			<div style={{ flex: 1 }}>
				<Outlet
					context={{
						currentTest,
						setCurrentTest,
						currentTopic,
						handleTopicChange,
						topics,
						topicData,
					}}
				/>
			</div>
		</div>
	);
};

export default Classroom;
