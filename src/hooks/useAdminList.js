import { useState, useEffect, useRef } from "react";
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
	const refreshItems = async () => {
		try {
			setLoading(true);
			const result = await loadItems();
			setItems(result);
			// Clear selections when data reloads
			setSelectedItems(new Set());
		} catch (err) {
			console.error(`Failed to load ${itemNamePlural}:`, err);
		} finally {
			setLoading(false);
		}
	};

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

	const handleDeleteConfirm = async () => {
		if (deleteConfirmText.toLowerCase() !== "delete") {
			return;
		}

		try {
			if (bulkDelete) {
				const selectedIds = Array.from(selectedItems);
				if (deleteMultipleItems) {
					await deleteMultipleItems(selectedIds);
				} else {
					// Fallback to individual deletes if bulk delete not provided
					await Promise.all(
						selectedIds.map((id) =>
							deleteItem(items.find((item) => item.id === id))
						)
					);
				}
			} else if (itemToDelete) {
				await deleteItem(itemToDelete);
			}

			await refreshItems();
			closeDeleteModal();
		} catch (err) {
			console.error(`Failed to delete ${itemName}(s):`, err);
			alert(`Failed to delete ${itemName}(s). Please try again.`);
		}
	};

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
		selectedItems,

		// Selection
		handleSelectionChange,
		selectAll,
		deselectAll,

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
