import styles from "./TabMenu.module.css";

const AdminMaterialTabMenu = ({
	activeRoleTab,
	setActiveRoleTab,
	tabLabels = [],
}) => {
	return (
		<ul className={styles.tab_container}>
			{tabLabels.map((label) => (
				<li onClick={() => setActiveRoleTab(label)} className={styles.tab}>
					<span
						className={`${styles.tab_text} ${
							activeRoleTab === label ? styles.active_tab : ""
						}`}
					>
						{label.toLowerCase().charAt(0).toUpperCase() + label.slice(1)}
					</span>
				</li>
			))}
		</ul>
	);
};
export default AdminMaterialTabMenu;
