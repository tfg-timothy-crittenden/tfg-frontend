import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import styles from "./AdminList.module.css";

const AdminList = ({
	items = [],
	loading = false,
	selectedItems = new Set(), // default so non‑selectable lists can omit it
	onSelectionChange,
	onBulkAction,
	bulkActions = [],
	renderItem,
	renderHeader,
	className = "",
	emptyMessage = "No items found.",
	loadingMessage = "Loading...",
	sortOptions = [],
	currentSort = null,
	onSortChange = null,
	isActionable = true,
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

	// Selection logic (assumes each item has a stable unique item.id)
	const isAllSelected =
		isActionable && items.length > 0 && selectedItems.size === items.length;
	const isSomeSelected =
		isActionable && selectedItems.size > 0 && selectedItems.size < items.length;

	const handleSelectAll = () => {
		if (!isActionable || !onSelectionChange) return;
		if (isAllSelected) {
			onSelectionChange(new Set());
		} else {
			onSelectionChange(new Set(items.map((it) => it.id)));
		}
	};

	const handleItemSelect = (itemId) => {
		if (!isActionable || !onSelectionChange) return;
		const next = new Set(selectedItems);
		if (next.has(itemId)) next.delete(itemId);
		else next.add(itemId);
		onSelectionChange(next);
	};

	if (loading) return <LoadingSpinner label={loadingMessage} />;
	if (items.length === 0)
		return <div className={styles.empty + " fade_in"}>{emptyMessage}</div>;

	return (
		<div className={`${styles.adminList} ${className} fade_in`}>
			{/* Header with select all and bulk actions */}
			<div className={`${styles.header}`}>
				<div className={styles.selectAllContainer}>
					{isActionable && (
						<div className={styles.checkbox_container}>
							<input
								type="checkbox"
								checked={isAllSelected}
								ref={(el) => {
									if (el) el.indeterminate = isSomeSelected;
								}}
								onChange={handleSelectAll}
							/>
						</div>
					)}

					{isActionable && bulkActions.length > 0 && (
						<div
							className={styles.bulkActionsContainer}
							ref={actionsDropdownRef}
						>
							<button
								type="button"
								className={`${styles.actionsButton} ${
									selectedItems.size === 0 ? styles.actionsButtonDisabled : ""
								}`}
								onClick={() =>
									selectedItems.size > 0 && setShowActionsDropdown((o) => !o)
								}
								disabled={selectedItems.size === 0}
							>
								Actions <ChevronDown size={16} />
							</button>

							{showActionsDropdown && selectedItems.size > 0 && (
								<div className={styles.actionsDropdown}>
									{bulkActions.map((action) => (
										<button
											type="button"
											key={action.key || action.label}
											onClick={() => {
												if (onBulkAction) {
													onBulkAction(action.key, selectedItems);
												} else if (action.action) {
													action.action(selectedItems);
												}
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

					{sortOptions.length > 0 && onSortChange && (
						<div className={styles.sortContainer} ref={sortDropdownRef}>
							<button
								type="button"
								className={styles.sortButton}
								onClick={() => setShowSortDropdown((o) => !o)}
								title="Sort options"
							>
								<ArrowUpDown size={18} />
							</button>

							{showSortDropdown && (
								<div className={styles.sortDropdown}>
									{sortOptions.map((opt) => (
										<button
											type="button"
											key={opt.key}
											onClick={() => {
												onSortChange(opt.key);
												setShowSortDropdown(false);
											}}
											className={`${styles.sortDropdownItem} ${
												currentSort === opt.key ? styles.activeSortItem : ""
											}`}
										>
											{opt.label}
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
				{items.map((item) => (
					<div key={item.id} className={styles.item_container}>
						{renderItem(item, {
							isSelected: isActionable && selectedItems.has(item.id),
							onSelect: isActionable
								? () => handleItemSelect(item.id)
								: undefined,
						})}
					</div>
				))}
			</div>
		</div>
	);
};

export default AdminList;
