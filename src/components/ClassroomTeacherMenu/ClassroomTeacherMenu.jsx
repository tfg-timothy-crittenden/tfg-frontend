import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ClassroomTeacherMenu.module.css";
import { ChevronUp, ChevronDown, NotebookTabs, UsersRound } from "lucide-react";
import Modal from "../Modal/Modal";
import useModal from "../Modal/useModal";
import ClassInvite from "../ClassInvite/ClassInvite";
import JoinCodeBar from "../JoinCodeBar/JoinCodeBar";

const ClassroomTeacherMenu = ({
	classrooms = [],
	onClassroomChange,
	setShowMaterial,
	showMaterial,
	showButtonText,
}) => {
	const { id: classroomId } = useParams();
	const navigate = useNavigate();
	const { modalRef, isOpen, openModal, closeModal } = useModal();

	const [dropdownOpen, setDropdownOpen] = useState(false);

	const selectedClassroom = useMemo(
		() => classrooms.find((c) => String(c.id) === String(classroomId)),
		[classrooms, classroomId]
	);

	const classCode = selectedClassroom?.code || "";
	const classroomName = selectedClassroom?.name || "";

	return (
		<>
			<div className={styles.test_menu_section}>
				<div
					onClick={() => setShowMaterial(false)}
					role="button"
					tabIndex={0}
					aria-label="View members"
					className={`${styles.list_item} ${
						!showMaterial ? styles.active : ""
					}`}
				>
					<UsersRound size={20} />
					<span
						className={`${styles.label} ${
							showButtonText ? styles.labelVisible : styles.labelHidden
						}`}
					>
						Members
					</span>
				</div>
				<div
					onClick={() => setShowMaterial(true)}
					role="button"
					tabIndex={0}
					aria-label="View materials"
					className={`${styles.list_item} ${showMaterial ? styles.active : ""}`}
				>
					<NotebookTabs size={20} />
					<span
						className={`${styles.label} ${
							showButtonText ? styles.labelVisible : styles.labelHidden
						}`}
					>
						Material
					</span>
				</div>
			</div>

			{/* Join Code Modal */}
			{isOpen && (
				<Modal
					modalRef={modalRef}
					closeModal={closeModal}
					modalTitle={`Join class: ${classroomName}`}
				>
					<span>
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
	);
};

export default ClassroomTeacherMenu;
