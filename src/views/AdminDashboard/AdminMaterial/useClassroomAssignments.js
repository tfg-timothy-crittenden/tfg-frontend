import useClassroomAssignmentDraft from "./useClassroomAssignmentDraft";
import useClassroomAssignmentSave from "./useClassroomAssignmentSave";
import useClassroomAssignmentSync from "./useClassroomAssignmentSync";
import useClassroomSelectionState from "./useClassroomSelectionState";

const useClassroomAssignments = ({ libraryMaterials, materialsLoaded }) => {
	// Input props:
	//   libraryMaterials: The full list of available materials fetched from the material service.
	//     Used to render the library panel on the right and to look up display names
	//     for assigned items.

	//   materialsLoaded: Flag indicating the library has finished fetching. Triggers
	//     classroom material sync when a new classroom is selected.

	// These hooks split the page into UI concerns: classroom selection, draft edits,
	// syncing from the server, and saving the current teacher/student assignment state.
	const draft = useClassroomAssignmentDraft({ libraryMaterials });
	
	
	const selection = useClassroomSelectionState({
		hasChanges: draft.hasChanges,
	});

	// When the selected classroom changes, load the teacher and student materials shown
	// in the assigned panels on the left side of the UI.
	useClassroomAssignmentSync({
		materialsLoaded,
		selectedClassId: selection.selectedClassId,
		loadAssignments: draft.loadAssignments,
	});

	// The Save button commits the current library selections into the class record.
	const { handleSave } = useClassroomAssignmentSave({
		selectedClassId: selection.selectedClassId,
		libraryMaterials,
		selectedStudentItemIds: draft.selectedStudentItemIds,
		selectedTeacherItemIds: draft.selectedTeacherItemIds,
		onSaved: draft.commitChanges,
	});

	// Restores the assigned panels back to the last saved classroom state.
	const handleCancel = () => {
		draft.cancelChanges();
		selection.setIsLibraryOpen(false);
	};

	return {
		// Active tab controls whether the teacher or student assignment panel is visible.
		activeRoleTab: selection.activeRoleTab,

		// This union drives which library items appear unavailable in the UI.
		allAssignedItemIds: draft.allAssignedItemIds,
		handleCancel,
		handleSave,

		// Used by the page to enable or disable Save / Cancel.
		hasChanges: draft.hasChanges,

		// Controls whether the library column is expanded and interactive.
		isLibraryOpen: selection.isLibraryOpen,

		// The class panel reads these so the UI can show which class is being edited.
		selectedClassId: selection.selectedClassId,
		selectedClassName: selection.selectedClassName,

		// These sets back the selected items in each role-specific panel.
		selectedStudentItemIds: draft.selectedStudentItemIds,
		selectedTeacherItemIds: draft.selectedTeacherItemIds,
		selectClass: selection.selectClass,
		setActiveRoleTab: selection.setActiveRoleTab,
		setIsLibraryOpen: selection.setIsLibraryOpen,

		// The transfer list uses these setters to move items between library and assigned state.
		setSelectedStudentItemIds: draft.setSelectedStudentItemIds,
		setSelectedTeacherItemIds: draft.setSelectedTeacherItemIds,

		// These are the fully shaped items rendered in the assigned lists.
		studentAssignedDisplayItems: draft.studentAssignedDisplayItems,
		teacherAssignedDisplayItems: draft.teacherAssignedDisplayItems,
	};
};

export default useClassroomAssignments;
