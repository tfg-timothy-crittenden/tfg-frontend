import { useState } from "react";
import { Plus, CircleAlert } from "lucide-react";

import { useJoinClassroom } from "@/domain/classrooms/hooks/useJoinClassroom";
import styles from "./UserClassrooms.module.css";

const JoinClassroomPanel = ({ userId, onSuccess }) => {
	const [joinOpen, setJoinOpen] = useState(false);
	const [joinCode, setJoinCode] = useState("");
	const [joinErr, setJoinErr] = useState("");

	const joinMutation = useJoinClassroom(userId);
	const joining = joinMutation.isPending;

	const close = () => {
		setJoinOpen(false);
		setJoinCode("");
		setJoinErr("");
	};

	const handleJoin = async () => {
		const code = joinCode.trim();
		if (!code) {
			setJoinErr("Enter a class code");
			return;
		}
		setJoinErr("");
		try {
			const result = await joinMutation.mutateAsync(code);
			close();
			onSuccess(result);
		} catch (e) {
			const msg =
				e?.response?.data?.message ||
				e?.response?.data?.error ||
				"Could not join class";
			setJoinErr(msg);
		}
	};

	return (
		<div className={styles.join_panel}>
			<button
				type="button"
				className={styles.join_toggle}
				onClick={() => setJoinOpen((v) => !v)}
				aria-expanded={joinOpen}
				aria-controls="join-class-panel"
			>
				<Plus size={24} />
			</button>

			{joinOpen && (
				<div
					className={styles.join_overlay}
					onClick={() => {
						if (joining) return;
						close();
					}}
				>
					<div
						id="join-class-panel"
						className={styles.join_popover}
						role="dialog"
						aria-modal="true"
						onClick={(e) => e.stopPropagation()}
					>
						<div className={styles.join_header}>
							<label htmlFor="join-code" className={styles.join_label}>
								Class Code
							</label>
							<CircleAlert
								size={22}
								className={styles.join_info_icon}
								aria-hidden="true"
							/>
						</div>

						<input
							id="join-code"
							type="text"
							value={joinCode}
							onChange={(e) => {
								setJoinCode(e.target.value);
								if (joinErr) setJoinErr("");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleJoin();
								}
							}}
							className={styles.classroom_input}
							disabled={joining}
						/>

						<div className={styles.card_meta}>
							{joinErr && (
								<div className={styles.error} style={{ marginTop: 6 }}>
									{joinErr}
								</div>
							)}
						</div>

						<div className={styles.buttons_row}>
							<button
								className="action_button"
								onClick={close}
								disabled={joining}
							>
								Cancel
							</button>
							<button
								className={`${styles.join_btn} action_button`}
								onClick={handleJoin}
								disabled={joining}
							>
								{joining ? "Joining…" : "Join Class"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default JoinClassroomPanel;
