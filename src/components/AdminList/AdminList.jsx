import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import styles from "./AdminList.module.css";

/**
 * Reusable admin list component for managing collections of items
 * Supports selection, bulk actions, sorting, and individual item actions
 */
const AdminList = ({
	items = [],
	loading = false,
	selectedItems,
	onSelectionChange,
	onBulkAction,
	bulkActions = [],
	renderItem,
	renderHeader,
	className = "",
	emptyMessage = "No items found.",
	loadingMessage = "Loading...",
	sortOptions = [],
	currentSort,
	onSortChange,
}) => {
	const [showActionsDropdown, setShowActionsDropdown] = useState(false);
	const [showSortDropdown, setShowSortDropdown] = useState(false);
	const actionsDropdownRef = useRef(null);
	const sortDropdownRef = useRef(null);

	// Handle click outside to close dropdowns
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				actionsDropdownRef.current &&
				!actionsDropdownRef.current.contains(event.target)
			) {
				setShowActionsDropdown(false);
			}
			if (
				sortDropdownRef.current &&
				!sortDropdownRef.current.contains(event.target)
			) {
				setShowSortDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Selection logic
	const isAllSelected = items.length > 0 && selectedItems.size === items.length;
	const isSomeSelected =
		selectedItems.size > 0 && selectedItems.size < items.length;

	const handleSelectAll = () => {
		if (isAllSelected) {
			onSelectionChange(new Set());
		} else {
			onSelectionChange(new Set(items.map((item) => item.id)));
		}
	};

	const handleItemSelect = (itemId) => {
		const newSelection = new Set(selectedItems);
		if (newSelection.has(itemId)) {
			newSelection.delete(itemId);
		} else {
			newSelection.add(itemId);
		}
		onSelectionChange(newSelection);
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	if (items.length === 0) {
		return <div className={styles.empty}>{emptyMessage}</div>;
	}

	return (
		<div className={`${styles.adminList} ${className}`}>
			{/* Header with select all and bulk actions */}
			<div className={styles.header}>
				<div className={styles.selectAllContainer}>
					<div className={styles.checkbox_container}>
						<input
							type="checkbox"
							checked={isAllSelected}
							ref={(input) => {
								if (input) input.indeterminate = isSomeSelected;
							}}
							onChange={handleSelectAll}
						/>
					</div>

					{/* Always show actions button, but disable when nothing selected */}
					{bulkActions.length > 0 && (
						<div
							className={styles.bulkActionsContainer}
							ref={actionsDropdownRef}
						>
							<button
								className={`${styles.actionsButton} ${
									selectedItems.size === 0 ? styles.actionsButtonDisabled : ""
								}`}
								onClick={() =>
									selectedItems.size > 0 &&
									setShowActionsDropdown(!showActionsDropdown)
								}
								disabled={selectedItems.size === 0}
							>
								Actions <ChevronDown size={16} />
							</button>

							{showActionsDropdown && selectedItems.size > 0 && (
								<div className={styles.actionsDropdown}>
									{bulkActions.map((action, index) => (
										<button
											key={index}
											onClick={() => {
												onBulkAction(action.key, selectedItems);
												setShowActionsDropdown(false);
											}}
											disabled={action.disabled}
											className={styles.dropdownItem}
										>
											{action.label}
										</button>
									))}
								</div>
							)}
						</div>
					)}

					{/* Sort dropdown */}
					{sortOptions.length > 0 && (
						<div className={styles.sortContainer} ref={sortDropdownRef}>
							<button
								className={styles.sortButton}
								onClick={() => setShowSortDropdown(!showSortDropdown)}
								title="Sort options"
							>
								<ArrowUpDown size={18} />
							</button>

							{showSortDropdown && (
								<div className={styles.sortDropdown}>
									{sortOptions.map((option, index) => (
										<button
											key={index}
											onClick={() => {
												onSortChange(option.key);
												setShowSortDropdown(false);
											}}
											className={`${styles.sortDropdownItem} ${
												currentSort === option.key ? styles.activeSortItem : ""
											}`}
										>
											{option.label}
										</button>
									))}
								</div>
							)}
						</div>
					)}

					{renderHeader && renderHeader()}
				</div>
			</div>

			{/* Items container */}
			<div className={styles.itemsContainer}>
				{items.map((item) =>
					renderItem(item, {
						isSelected: selectedItems.has(item.id),
						onSelect: () => handleItemSelect(item.id),
					})
				)}
			</div>
		</div>
	);
};

export default AdminList;
