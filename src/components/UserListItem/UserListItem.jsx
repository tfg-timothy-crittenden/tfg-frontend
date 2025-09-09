import { CircleUserRound } from "lucide-react";
import styles from "./UserListItem.module.css";

/**
 * Individual user item component for displaying user information with status
 */
const UserListItem = ({ user }) => {
	const isInvited = user.status === "invited";

	return (
		<div
			className={`${styles.userContainer} ${isInvited ? styles.invited : ""}`}
		>
			<div
				className={`${styles.userIcon} ${isInvited ? styles.invitedIcon : ""}`}
			>
				<CircleUserRound size={48} strokeWidth={0.5} />
			</div>

			<div className={styles.userInfo}>
				<span
					className={`${styles.userName} ${
						isInvited ? styles.invitedName : ""
					}`}
				>
					{user.name}
				</span>
				<span
					className={`${styles.userEmail} ${
						isInvited ? styles.invitedEmail : ""
					}`}
				>
					{user.email}
				</span>
			</div>

			{isInvited && <span className={styles.invitedStatus}>invited</span>}
		</div>
	);
};

export default UserListItem;
