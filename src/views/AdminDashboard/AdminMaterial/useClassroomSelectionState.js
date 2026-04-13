import { useCallback, useState } from "react";

const useClassroomSelectionState = ({ hasChanges }) => {
	const [selectedClassId, setSelectedClassId] = useState(null);
	const [selectedClassName, setSelectedClassName] = useState("");
	const [activeRoleTab, setActiveRoleTab] = useState("teacher");
	const [isLibraryOpen, setIsLibraryOpen] = useState(false);

	const selectClass = useCallback(
		async (classObj) => {
			if (!classObj) return;

			if (hasChanges) {
				const confirmed = window.confirm(
					"You have unsaved changes. Switch classes and lose changes?",
				);
				if (!confirmed) return;
			}

			setSelectedClassId(classObj.id);
			setSelectedClassName(classObj.name);
			setIsLibraryOpen(false);
		},
		[hasChanges],
	);

	return {
		activeRoleTab,
		isLibraryOpen,
		selectClass,
		selectedClassId,
		selectedClassName,
		setActiveRoleTab,
		setIsLibraryOpen,
	};
};

export default useClassroomSelectionState;
