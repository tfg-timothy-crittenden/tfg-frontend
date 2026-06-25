import { GraduationCap } from "lucide-react";
import type { ClassroomSummary } from "@/domain/classrooms/types/ClassroomSummary";
import styles from "./ClassroomSummaryCard.module.css";

type ClassroomSummaryCardProps = {
	classroom: ClassroomSummary;
	onOpenClassroom: (classroomId: number) => void;
};

const ClassroomSummaryCard = ({
	classroom,
	onOpenClassroom,
}: ClassroomSummaryCardProps) => {
	const teacherLabel =
		classroom.teachers && classroom.teachers.length
			? classroom.teachers
					.map((teacher) => {
						const firstName = teacher?.name || "";
						const lastName = teacher?.surname || "";
						const fullName = `${firstName} ${lastName}`.trim();
						return (
							fullName || String(teacher?.userId || teacher?.memberId || "")
						);
					})
					.filter(Boolean)
					.join(", ")
			: "Unassigned";

	return (
		<li
			className={styles.classroom_card}
			onClick={() => onOpenClassroom(classroom.id)}
			role="button"
			tabIndex={0}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					onOpenClassroom(classroom.id);
				}
			}}
		>
			<div className={styles.card_header}>
				<div className={styles.card_title}>{classroom.name}</div>
				{classroom.description && (
					<div className={styles.card_subject}>{classroom.description}</div>
				)}
			</div>

			<div className={styles.card_meta}>
				<div className={styles.meta_row}>
					<span className={styles.meta_label}>
						<GraduationCap size={18} style={{ verticalAlign: "middle" }} />
					</span>
					<span className={styles.meta_value}>{teacherLabel}</span>
				</div>
			</div>

			<div className={styles.card_cta}>View class</div>
		</li>
	);
};

export default ClassroomSummaryCard;
