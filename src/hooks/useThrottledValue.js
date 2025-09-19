import { useEffect, useRef, useState } from "react";

export default function useThrottledValue(value, delay = 200) {
	const [throttled, setThrottled] = useState(value);
	const lastExecRef = useRef(0);
	const timeoutRef = useRef(null);

	useEffect(() => {
		const now = Date.now();
		const remaining = delay - (now - lastExecRef.current);

		const run = () => {
			lastExecRef.current = Date.now();
			setThrottled(value);
		};

		if (remaining <= 0) {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
			run(); // leading
		} else {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(run, remaining); // trailing
		}

		return () => timeoutRef.current && clearTimeout(timeoutRef.current);
	}, [value, delay]);

	return throttled;
}
