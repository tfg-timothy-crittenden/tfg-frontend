import { useState, useRef, useEffect, useCallback } from "react";

const useModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	const modalRef = useRef(null);

	const openModal = () => setIsOpen(true);
	const closeModal = () => setIsOpen(false);
	const toggleModal = () => setIsOpen((p) => !p);

	// Only runs when open; uses capture so it can't be stopped by React handlers
	useEffect(() => {
		if (!isOpen) return;

		const handleDocumentClick = (event) => {
			const node = modalRef.current;
			if (node && !node.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("click", handleDocumentClick, { capture: true });
		return () => {
			document.removeEventListener("click", handleDocumentClick, {
				capture: true,
			});
		};
	}, [isOpen]);

	return { isOpen, openModal, closeModal, toggleModal, modalRef };
};

export default useModal;
