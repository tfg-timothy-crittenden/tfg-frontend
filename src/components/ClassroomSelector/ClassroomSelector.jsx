import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ClassroomSelector.module.css";
import { ChevronUp, ChevronDown } from "lucide-react";

const ClassroomSelector = ({ classrooms = [], onClassroomChange }) => {
	const { id: classroomId } = useParams();
	const navigate = useNavigate();
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const selectedClassroom = useMemo(
		() => classrooms.find((c) => String(c.id) === String(classroomId)),
		[classrooms, classroomId]
	);

	return (
		<div className={styles.dropdown_section}>
			<div
				className={styles.dropdown_header}
				onClick={() => setDropdownOpen((prev) => !prev)}
				role="button"
				tabIndex={0}
				aria-label="Toggle classroom list"
			>
				<span>
					{selectedClassroom ? selectedClassroom.name : "Select a classroom"}
				</span>
				<span className={styles.chevron}>
					{dropdownOpen ? <ChevronUp /> : <ChevronDown />}
				</span>
			</div>
			{dropdownOpen && (
				<ul className={styles.dropdown_list}>
					{classrooms.map((classroom) => (
						<li
							key={classroom.id}
							className={`${styles.list_item} ${
								String(classroom.id) === String(classroomId)
									? styles.active
									: ""
							}`}
							onClick={() => {
								onClassroomChange?.(classroom.id);
								navigate(`/my/classrooms/${classroom.id}`);
								setDropdownOpen(false);
							}}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									onClassroomChange?.(classroom.id);
									navigate(`/my/classrooms/${classroom.id}`);
									setDropdownOpen(false);
								}
							}}
						>
							<span className={styles.test_title}>{classroom.name}</span>
							{classroom.subject && (
								<span className={styles.reading_title}>
									{classroom.subject}
								</span>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default ClassroomSelector;
