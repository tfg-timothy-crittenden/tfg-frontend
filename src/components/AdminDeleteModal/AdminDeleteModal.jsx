import Modal from "@/components/Modal/Modal";
import styles from "./AdminDeleteModal.module.css";

/**
 * Reusable delete confirmation modal for admin pages
 */
const AdminDeleteModal = ({
	isOpen,
	modalRef,
	onClose,
	onConfirm,
	itemName = "item",
	itemNamePlural = "items",
	itemToDelete = null,
	bulkDelete = false,
	selectedCount = 0,
	confirmText,
	onConfirmTextChange,
	requiresTypeDelete = true,
}) => {
	if (!isOpen) return null;

	const getModalTitle = () => {
		if (bulkDelete) {
			return `Delete ${selectedCount} ${
				selectedCount === 1 ? itemName : itemNamePlural
			}`;
		}
		return `Delete ${itemName}`;
	};

	const getModalMessage = () => {
		if (bulkDelete) {
			return `Are you sure you want to delete ${selectedCount} selected ${
				selectedCount === 1 ? itemName : itemNamePlural
			}? This action cannot be undone.`;
		}
		return `Are you sure you want to delete "${
			itemToDelete?.name || itemToDelete?.class_name || "this item"
		}"? This action cannot be undone.`;
	};

	const isConfirmDisabled = () => {
		if (!requiresTypeDelete) return false;
		return confirmText.toLowerCase() !== "delete";
	};

	return (
		<Modal modalRef={modalRef} closeModal={onClose}>
			<div className={styles.deleteModal}>
				<h3 className={styles.deleteTitle}>{getModalTitle()}</h3>
				<p className={styles.deleteMessage}>{getModalMessage()}</p>

				{requiresTypeDelete && (
					<div className={styles.confirmSection}>
						<p className={styles.confirmInstruction}>
							Type <strong>delete</strong> to confirm:
						</p>
						<input
							type="text"
							value={confirmText}
							onChange={(e) => onConfirmTextChange(e.target.value)}
							className={styles.confirmInput}
							placeholder="Type 'delete' to confirm"
							autoFocus
						/>
					</div>
				)}

				<div className={styles.deleteActions}>
					<button onClick={onClose} className={styles.cancelButton}>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={isConfirmDisabled()}
						className={`${styles.deleteButton} ${
							isConfirmDisabled() ? styles.disabled : ""
						}`}
					>
						Delete{" "}
						{bulkDelete && selectedCount > 1
							? `${selectedCount} ${itemNamePlural}`
							: itemName}
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default AdminDeleteModal;
