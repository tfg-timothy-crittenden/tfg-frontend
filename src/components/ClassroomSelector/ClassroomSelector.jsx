import { useState, useMemo } from "react";
import {
	useParams,
	useNavigate,
	useLocation,
	useMatch,
	generatePath,
} from "react-router-dom";
import { ChevronUp, ChevronDown } from "lucide-react";
import styles from "./ClassroomSelector.module.css";

const CLASSROOM_WILDCARD_PATTERN = "/my/classrooms/:id/*";

const ClassroomSelector = ({ classrooms = [], onClassroomChange }) => {
	const { id: classroomId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const match = useMatch(CLASSROOM_WILDCARD_PATTERN);
	const [open, setOpen] = useState(false);

	const selectedClassroom = useMemo(
		() => classrooms.find((c) => String(c.id) === String(classroomId)),
		[classrooms, classroomId],
	);

	const swapId = (newId) => {
		if (match) {
			const remainder = location.pathname.slice(match.pathnameBase.length); // keeps /members, /tests/..., etc.
			const base = generatePath("/my/classrooms/:id", { id: newId });
			navigate(base + remainder + location.search + location.hash);
		} else {
			// Fallback if not inside classrooms scope
			navigate(generatePath("/my/classrooms/:id", { id: newId }));
		}
	};

	const handleSelect = (newId) => {
		onClassroomChange?.(newId);
		swapId(newId);
		setOpen(false);
	};

	return (
		<div className={styles.dropdown_section}>
			<div
				className={styles.dropdown_header}
				onClick={() => setOpen((o) => !o)}
				role="button"
				tabIndex={0}
			>
				<span>
					{selectedClassroom ? selectedClassroom.name : "Select a classroom"}
				</span>
				<span className={styles.chevron}>
					{open ? <ChevronUp /> : <ChevronDown />}
				</span>
			</div>
			{open && (
				<ul className={styles.dropdown_list}>
					{classrooms.map((c) => {
						const active = String(c.id) === String(classroomId);
						return (
							<li
								key={c.id}
								className={`${styles.list_item} ${active ? styles.active : ""}`}
								onClick={() => handleSelect(c.id)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") handleSelect(c.id);
								}}
							>
								<span className={styles.test_title}>{c.name}</span>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default ClassroomSelector;
