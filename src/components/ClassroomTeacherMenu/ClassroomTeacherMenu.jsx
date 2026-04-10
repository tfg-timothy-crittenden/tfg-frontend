import { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./ClassroomTeacherMenu.module.css";
import { ChevronUp, ChevronDown, Library, UsersRound } from "lucide-react";
import Modal from "../Modal/Modal";
import useModal from "../Modal/useModal";
import ClassInvite from "../ClassInvite/ClassInvite";
import JoinCodeBar from "../JoinCodeBar/JoinCodeBar";
import { buildRoute, routeMatchers } from "@/routes/routeConfig"; // <-- added

const ClassroomTeacherMenu = ({
	classrooms = [],
	onClassroomChange,
	setShowMaterial,
	showMaterial,
	showButtonText,
}) => {
	const { id: classroomId, sectionId, partNumber } = useParams();
	const navigate = useNavigate();
	const location = useLocation(); // <-- added
	const { modalRef, isOpen, openModal, closeModal } = useModal();

	const [dropdownOpen, setDropdownOpen] = useState(false);

	const selectedClassroom = useMemo(
		() => classrooms.find((c) => String(c.id) === String(classroomId)),
		[classrooms, classroomId],
	);

	const classCode = selectedClassroom?.code || "";
	const classroomName = selectedClassroom?.name || "";

	// Determine if current route is the members view (route-based, not local state)
	const isMembersRoute = routeMatchers.isClassroomMembers(location.pathname);

	const handleMembersClick = () => {
		setShowMaterial?.(false); // keep legacy state in sync
		navigate(buildRoute.classroomMembers(classroomId));
	};

	const handleMaterialClick = () => {
		setShowMaterial?.(true);
		if (sectionId && partNumber) {
			// Return to the current section & part
			navigate(buildRoute.sectionPart(classroomId, sectionId, partNumber));
		} else {
			// Just the classroom root
			navigate(buildRoute.classroom(classroomId));
		}
	};

	return (
		<>
			<div className={styles.test_menu_section}>
				<div
					onClick={handleMembersClick}
					role="button"
					tabIndex={0}
					aria-label="View members"
					className={`${styles.list_item} ${
						isMembersRoute ? styles.active : ""
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
					onClick={handleMaterialClick}
					role="button"
					tabIndex={0}
					aria-label="View materials"
					className={`${styles.list_item} ${
						!isMembersRoute ? styles.active : ""
					}`}
				>
					<Library size={20} />
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
