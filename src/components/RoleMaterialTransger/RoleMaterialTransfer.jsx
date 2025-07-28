import React from "react";
import styles from "./RoleMaterialTransfer.module.css";
import documents_icon from "@/assets/icons/documents_icon.png";
import library_icon from "@/assets/icons/library_icon.png";

const RoleMaterialTransfer = ({
	allMaterials,
	assignedItemsIds,
	setAssignedItemsIds,
	isAssignedListVisible,
	ListItem,
	isLibraryOpen,
	setIsLibraryOpen,
}) => {
	const handleToggle = (itemId) => {
		if (!isLibraryOpen) return;

		setAssignedItemsIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) newSet.delete(itemId);
			else newSet.add(itemId);
			return newSet;
		});
	};

	const assignedItems = allMaterials.filter((item) =>
		assignedItemsIds.has(item.id)
	);
	const availableItems = allMaterials.filter(
		(item) => !assignedItemsIds.has(item.id)
	);

	return (
		<div className={styles.role_container}>
			<div className={styles.lists_wrapper}>
				{/* Assigned on the left */}
				<div className={styles.list_column}>
					<h3 className={styles.list_heading}>Assigned</h3>
					{isAssignedListVisible ? (
						assignedItems.length > 0 ? (
							<ul className={`scrollable_inner ${styles.scrollable_list}`}>
								{assignedItems.map((item) => (
									<ListItem
										key={item.id}
										item={item}
										isChecked={true}
										onToggle={handleToggle}
										disabled={!isLibraryOpen}
									/>
								))}
							</ul>
						) : (
							<div
								className={`${styles.empty_state} ${styles.scrollable_list}`}
							>
								<img
									src={documents_icon}
									alt="No tests icon"
									className={styles.empty_icon}
								/>
								<h4>No tests assigned yet</h4>
								<p className={styles.empty_description}>
									Use the library to assign materials to this class.
								</p>
							</div>
						)
					) : (
						<div className={`${styles.empty_state} ${styles.scrollable_list}`}>
							<img
								src={documents_icon}
								alt="Documents Icon"
								className={styles.empty_icon}
							/>
							<p className={styles.empty_description}>
								Select a class to view materials
							</p>
						</div>
					)}
				</div>

				{/* Library on the right — always rendered */}
				<div className={`${styles.list_column} ${styles.library_column}`}>
					<div className={styles.library_header}>
						<h3 className={styles.list_heading}>Test Library</h3>
					</div>
					{isLibraryOpen ? (
						<ul className={`scrollable_inner ${styles.scrollable_list}`}>
							{availableItems.map((item) => (
								<ListItem
									key={item.id}
									item={item}
									isChecked={false}
									onToggle={handleToggle}
								/>
							))}
						</ul>
					) : (
						<div className={styles.empty_state + " " + styles.scrollable_list}>
							<img
								src={library_icon}
								alt="Library Icon"
								className={styles.empty_icon}
							/>
							<button
								className={"action_button"}
								onClick={() => setIsLibraryOpen(true)}
								disabled={!isAssignedListVisible}
							>
								Assign Tests from Library
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default RoleMaterialTransfer;
