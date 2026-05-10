import { useState, useRef, useEffect, useId } from "react";
import { EllipsisVertical } from "lucide-react";
import styles from "./ListItem.module.css"; // Use dedicated ListItem styles

/**
 * Reusable list item component with selection, kebab menu, and custom content
 */
const ListItem = ({
	id,
	isSelected,
	onSelect,
	renderContent,
	actions = [],
	className = "",
	children,
}) => {
	const reactId = useId();
	const [showKebabMenu, setShowKebabMenu] = useState(false);
	const kebabRef = useRef(null);

	// Handle click outside to close kebab menu
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (kebabRef.current && !kebabRef.current.contains(event.target)) {
				setShowKebabMenu(false);
			}
		};

		if (showKebabMenu) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [showKebabMenu]);

	return (
		<div className={`${styles.itemRow} ${className}`} key={id}>
			{/* Checkbox */}
			<div className={styles.checkbox_container}>
				<input type="checkbox" checked={isSelected} onChange={onSelect} />
			</div>

			{/* Main content */}
			<div className={styles.content}>
				{renderContent ? renderContent() : children}
			</div>

			{/* Actions (kebab menu) */}
			{actions.length > 0 && (
				<div className={styles.kebabContainer} ref={kebabRef}>
					<EllipsisVertical
						size={30}
						className={styles.kebab_button}
						onClick={() => setShowKebabMenu(!showKebabMenu)}
					/>

					{showKebabMenu && (
						<div className={styles.kebabDropdown}>
							{actions.map((action) => (
								<button
									key={reactId + "-" + (action.key || action.label)}
									onClick={() => {
										action.handler(id);
										setShowKebabMenu(false);
									}}
									className={styles.dropdownItem}
									disabled={action.disabled}
								>
									{action.label}
								</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ListItem;
