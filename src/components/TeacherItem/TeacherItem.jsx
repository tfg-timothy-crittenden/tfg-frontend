import { CircleUserRound } from "lucide-react";
import styles from "./TeacherItem.module.css";

/**
 * Individual teacher item component for displaying teacher information with status
 */
const TeacherItem = ({ teacher }) => {
	const isInvited = teacher.status === "invited";

	return (
		<div
			className={`${styles.teacherContainer} ${
				isInvited ? styles.invited : ""
			}`}
		>
			<div
				className={`${styles.teacherIcon} ${
					isInvited ? styles.invitedIcon : ""
				}`}
			>
				<CircleUserRound size={48} strokeWidth={0.5} />
			</div>

			<div className={styles.teacherInfo}>
				<span
					className={`${styles.teacherName} ${
						isInvited ? styles.invitedName : ""
					}`}
				>
					{teacher.name}
				</span>
				<span
					className={`${styles.teacherEmail} ${
						isInvited ? styles.invitedEmail : ""
					}`}
				>
					{teacher.email}
				</span>
			</div>

			{isInvited && <span className={styles.invitedStatus}>invited</span>}
		</div>
	);
};

export default TeacherItem;
