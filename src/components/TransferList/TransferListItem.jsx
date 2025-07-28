import styles from "./TransferListItem.module.css";

const TransferListItem = ({ item, onToggle, isChecked, disabled }) => {
	return (
		<li
			className={`${styles.container} ${isChecked ? styles.selected : ""} ${
				disabled ? styles.disabled : ""
			}`}
			onClick={() => {
				if (!disabled) onToggle(item.id);
			}}
		>
			<span className={styles.label}>
				{item.name}
				<span className={isChecked ? styles.removeIcon : styles.arrow}></span>
			</span>
		</li>
	);
};

export default TransferListItem;
