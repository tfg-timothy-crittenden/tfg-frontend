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

	return (
		<div className={styles.classroomHeader_container}>
			<h3 className={styles.classroomHeader_title}>Classroom</h3>

			{classrooms.length > 0 ? (
				<>
					<select
						value={String(classroomId)}
						onChange={(e) => onClassroomChange(e.target.value)}
						className={styles.classroom_selector}
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
				<div onClick={() => setShowMaterial(true)}>
					<NotebookTabs size={24} />
					<span className={styles.classroomHeader_iconText}>material</span>
				</div>
				<div onClick={() => setShowMaterial(false)}>
					<UserPlus size={24} />
					<span className={styles.classroomHeader_iconText}>members</span>
				</div>
			</div>
		</div>
	);
};

export default ClassroomHeader;
