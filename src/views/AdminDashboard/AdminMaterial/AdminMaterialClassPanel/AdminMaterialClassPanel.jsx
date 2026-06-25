import { useRef } from "react";

import { useAllClassroomsForAdmin } from "@/domain/classrooms/hooks/useAllClassroomsForAdmin";

import SearchableList from "@/components/SearchableList/SearchableList";
import DropdownSurface from "@/components/DropdownSurface/DropdownSurface";

import styles from "./AdminMaterialClassPanel.module.css";

const AdminMaterialClassPanel = ({
	selectedClassId,
	selectedClassName,
	selectClass,
	isMobile,
	dropdownOpen,
}) => {
	const dropDownHandleRef = useRef(null);

	const { data: classes = [] } = useAllClassroomsForAdmin();

	const onSelectClass = (classItem) => {
		selectClass(classItem);
		dropDownHandleRef.current?.hideSurface();
	};

	const buttonLabel = (() => {
		if (!selectedClassId) return "Select a class";
		return dropdownOpen ? "Hide Classes" : selectedClassName;
	})();

	return (
		<div className={styles.classPanelWrapper}>
			{/* Display the list of classes as a drop down list on mobiles */}
			{isMobile && (
				<DropdownSurface buttonLabel={buttonLabel} ref={dropDownHandleRef}>
					<SearchableList
						listItems={classes}
						onSelectItem={(item) => onSelectClass(item)}
						selectedItemId={selectedClassId}
					/>
				</DropdownSurface>
			)}

			{!isMobile && (
				<div className={styles.class_container}>
					<SearchableList
						listItems={classes}
						onSelectItem={onSelectClass}
						selectedItemId={selectedClassId}
					/>
				</div>
			)}
		</div>
	);
};

export default AdminMaterialClassPanel;
