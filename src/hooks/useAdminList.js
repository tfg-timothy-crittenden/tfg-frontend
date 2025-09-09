import { useRef, useCallback, useEffect, useState } from "react";
import useModal from "@/components/Modal/useModal";

/**
 * Custom hook for managing admin list functionality
 * Handles selection, loading, delete confirmation, bulk actions, and dropdown management
 */
const useAdminList = ({
	loadItems,
	deleteItem,
	deleteMultipleItems,
	itemName = "item", // e.g., "teacher", "class"
	itemNamePlural = "items", // e.g., "teachers", "classes"
}) => {
	// Core state
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedItems, setSelectedItems] = useState(new Set());

	// Dropdown state
	const [showActionsDropdown, setShowActionsDropdown] = useState(false);
	const [activeKebabMenu, setActiveKebabMenu] = useState(null);

	// Delete confirmation state
	const [itemToDelete, setItemToDelete] = useState(null);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");
	const [bulkDelete, setBulkDelete] = useState(false);

	// Modal for delete confirmation
	const {
		modalRef,
		isOpen: isDeleteModalOpen,
		openModal: openDeleteModal,
		closeModal: closeDeleteModal,
	} = useModal();

	// Refs for click-outside detection
	const actionsDropdownRef = useRef(null);
	const kebabDropdownRefs = useRef(new Map());

	// Prevent overlapping loads / loops
	const loadingRef = useRef(false);
	const latestLoadFnRef = useRef(loadItems);

	// Update ref if function identity changes (without triggering effect loops)
	useEffect(() => {
		latestLoadFnRef.current = loadItems;
	}, [loadItems]);

	// Handle click outside to close dropdowns
	useEffect(() => {
		const handleClickOutside = (event) => {
			// Close actions dropdown if clicked outside
			if (
				actionsDropdownRef.current &&
				!actionsDropdownRef.current.contains(event.target)
			) {
				setShowActionsDropdown(false);
			}

			// Close kebab dropdown if clicked outside
			if (activeKebabMenu !== null) {
				const kebabRef = kebabDropdownRefs.current.get(activeKebabMenu);
				if (kebabRef && !kebabRef.contains(event.target)) {
					setActiveKebabMenu(null);
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [activeKebabMenu]);

	// Load items function
	const refreshItems = useCallback(async () => {
		if (loadingRef.current) return;
		loadingRef.current = true;
		setLoading(true);
		setError(null);
		try {
			const data = await latestLoadFnRef.current();
			setItems(Array.isArray(data) ? data : []);
		} catch (e) {
			console.error("Failed to load items:", e);
			setError("Failed to load items");
		} finally {
			loadingRef.current = false;
			setLoading(false);
		}
	}, []);

	// Initial load
	useEffect(() => {
		refreshItems();
	}, []);

	// Selection management
	const handleSelectionChange = (newSelection) => {
		setSelectedItems(newSelection);
	};

	const selectAll = () => {
		setSelectedItems(new Set(items.map((item) => item.id)));
	};

	const deselectAll = () => {
		setSelectedItems(new Set());
	};

	// Delete confirmation handlers
	const confirmSingleDelete = (item) => {
		setItemToDelete(item);
		setBulkDelete(false);
		setDeleteConfirmText("");
		openDeleteModal();
	};

	const confirmBulkDelete = () => {
		setBulkDelete(true);
		setDeleteConfirmText("");
		openDeleteModal();
	};

	const handleDeleteConfirm = useCallback(async () => {
		try {
			if (bulkDelete) {
				if (deleteMultipleItems) {
					await deleteMultipleItems(Array.from(selectedItems));
				} else if (deleteItem) {
					for (const id of selectedItems) await deleteItem(id);
				}
			} else if (itemToDelete) {
				await deleteItem(itemToDelete);
			}
			await refreshItems(); // single refresh
		} catch (err) {
			console.error(
				`Failed to delete ${bulkDelete ? itemNamePlural : itemName}:`,
				err
			);
		} finally {
			setItemToDelete(null);
			setBulkDelete(false);
			setDeleteConfirmText("");
			closeDeleteModal();
		}
	}, [
		bulkDelete,
		deleteItem,
		deleteMultipleItems,
		itemToDelete,
		itemName,
		itemNamePlural,
		refreshItems,
		selectedItems,
		closeDeleteModal,
	]);

	const cancelDelete = () => {
		setItemToDelete(null);
		setBulkDelete(false);
		setDeleteConfirmText("");
		closeDeleteModal();
	};

	// Dropdown handlers
	const toggleActionsDropdown = () => {
		setShowActionsDropdown(!showActionsDropdown);
	};

	const toggleKebabMenu = (itemId) => {
		setActiveKebabMenu(activeKebabMenu === itemId ? null : itemId);
	};

	// Bulk actions
	const bulkActions = [
		{
			key: "delete",
			label: `Delete Selected ${itemNamePlural}`,
			action: confirmBulkDelete,
			disabled: selectedItems.size === 0,
			variant: "danger",
		},
	];

	return {
		// Data
		items,
		loading,
		error,

		// Selection
		handleSelectionChange,
		selectAll,
		deselectAll,
		selectedItems,

		// Delete
		confirmSingleDelete,
		confirmBulkDelete,
		handleDeleteConfirm,
		cancelDelete,
		itemToDelete,
		bulkDelete,
		deleteConfirmText,
		setDeleteConfirmText,

		// Modal
		modalRef,
		isDeleteModalOpen,
		openDeleteModal,
		closeDeleteModal,

		// Dropdowns
		showActionsDropdown,
		toggleActionsDropdown,
		actionsDropdownRef,
		activeKebabMenu,
		toggleKebabMenu,
		kebabDropdownRefs,

		// Actions
		refreshItems,
		bulkActions,

		// Config
		itemName,
		itemNamePlural,
	};
};

export default useAdminList;
