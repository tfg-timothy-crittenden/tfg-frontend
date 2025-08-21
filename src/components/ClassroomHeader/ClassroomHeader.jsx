import { useMemo } from "react";
import { useParams } from "react-router-dom";
import styles from "./ClassroomHeader.module.css";
import { NotebookTabs, UserPlus, Maximize, QrCode } from "lucide-react";
import Modal from "../Modal/Modal";
import useModal from "../Modal/useModal";
import ClassInvite from "../ClassInvite/ClassInvite";
import JoinCodeBar from "../JoinCodeBar/JoinCodeBar";

const ClassroomHeader = ({
	classrooms = [],
	onClassroomChange,
	setShowMaterial,
	showMaterial,
}) => {
	const { id: classroomId } = useParams();
	const { modalRef, isOpen, openModal, closeModal } = useModal();

	// Derive the selected classroom (no state needed)
	const selectedClassroom = useMemo(
		() => classrooms.find((c) => String(c.id) === String(classroomId)),
		[classrooms, classroomId]
	);

	const classCode = selectedClassroom?.code || "";
	const classroomName = selectedClassroom?.name || "";

	// Truncate classroom name for mobile display
	const getTruncatedName = (name, maxLength = 15) => {
		if (!name) return "";
		return name.length > maxLength
			? `${name.substring(0, maxLength)}...`
			: name;
	};

	return (
		<div className={styles.classroomHeader_container}>
			<h3 className={styles.classroomHeader_title}>Classroom</h3>

			{classrooms.length > 0 ? (
				<>
					<select
						value={String(classroomId)}
						onChange={(e) => onClassroomChange(e.target.value)}
						className={styles.classroom_selector}
						title={selectedClassroom?.name} // Full name in tooltip
					>
						{classrooms.map((classroom) => (
							<option key={classroom.id} value={String(classroom.id)}>
								{classroom.name}
							</option>
						))}
					</select>

					<div
						className={styles.classroom_join_code_container}
						onClick={openModal}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								openModal();
							}
						}}
						aria-label={`Show join code for ${classroomName}`}
					>
						<JoinCodeBar code={classCode} />
					</div>

					{isOpen && (
						<Modal
							modalRef={modalRef}
							closeModal={closeModal}
							modalTitle={`Join class: ${classroomName}`}
						>
							<span className={styles.classroom_join_code_big}>
								<ClassInvite
									classCode={classCode}
									joinUrl={`/join?classCode=${classCode}`}
									signupUrl={`/signup/${classCode}`}
									onClose={closeModal}
								/>
							</span>
						</Modal>
					)}
				</>
			) : (
				<p>No classrooms available</p>
			)}

			<div className={styles.classroom_nav_group_right}>
				<div
					onClick={() => setShowMaterial(true)}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							setShowMaterial(true);
						}
					}}
					aria-label="View materials"
					style={{
						backgroundColor: showMaterial
							? "var(--color-primary-light)"
							: "transparent",
						color: showMaterial ? "var(--color-primary)" : "var(--color-text)",
					}}
				>
					<NotebookTabs size={20} />
					<span className={styles.classroomHeader_iconText}>material</span>
				</div>
				<div
					onClick={() => setShowMaterial(false)}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							setShowMaterial(false);
						}
					}}
					aria-label="View members"
					style={{
						backgroundColor: !showMaterial
							? "var(--color-primary-light)"
							: "transparent",
						color: !showMaterial ? "var(--color-primary)" : "var(--color-text)",
					}}
				>
					<UserPlus size={20} />
					<span className={styles.classroomHeader_iconText}>members</span>
				</div>
			</div>
		</div>
	);
};

export default ClassroomHeader;
