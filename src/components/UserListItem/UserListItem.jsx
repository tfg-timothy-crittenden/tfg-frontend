import { CircleUserRound } from "lucide-react";
import styles from "./UserListItem.module.css";

/**
 * Individual user item component for displaying user information with status
 */
const UserListItem = ({ user }) => {
	const invitationStatus = user.invitationStatus
		? String(user.invitationStatus)
		: "";

	return (
		<div className={styles.userContainer}>
			<div className={styles.userIcon}>
				<CircleUserRound size={48} strokeWidth={0.5} />
			</div>

			<div className={styles.userInfo}>
				<span className={styles.userName}>{user.name}</span>
				<span className={styles.userEmail}>{user.email}</span>
				{invitationStatus && (
					<span className={styles.userStatus}>{invitationStatus}</span>
				)}
			</div>
		</div>
	);
};

export default UserListItem;
