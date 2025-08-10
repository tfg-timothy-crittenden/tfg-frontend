import React, { useState } from "react";
import { QrCode, Maximize2, Copy, Check, UserRoundPlus } from "lucide-react";
import styles from "./JoinCodeBar.module.css";

const JoinCodeBar = ({ code, onOpenModal }) => {
	return (
		<div className={styles.wrap} role="group" aria-label="Class join code">
			<span className={styles.label}>Invite Members</span>

			<UserRoundPlus />
		</div>
	);
};

export default JoinCodeBar;
