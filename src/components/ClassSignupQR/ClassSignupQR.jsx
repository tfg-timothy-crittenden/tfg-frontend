// src/components/ClassSignupQR.jsx
import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

const DEFAULT_APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

/**
 * Props:
 *  - classCode (string, required)
 *  - appUrl (string) -> defaults to VITE_APP_URL for prod-safe links
 *  - mode: "param" | "query" -> /signup/:code or /signup?classCode=...
 *  - size: number (pixels for preview) -> default 256
 */
const ClassSignupQR = ({
	classCode,
	appUrl = DEFAULT_APP_URL,
	mode = "param",
	size = 256,
}) => {
	const [svg, setSvg] = useState("");
	const [pngUrl, setPngUrl] = useState("");
	const signupUrl = useMemo(() => {
		if (!classCode) return "";
		return mode === "query"
			? `${appUrl}/signup?classCode=${encodeURIComponent(classCode)}`
			: `${appUrl}/signup/${encodeURIComponent(classCode)}`;
	}, [classCode, appUrl, mode]);

	useEffect(() => {
		let cancelled = false;
		const generate = async () => {
			if (!signupUrl) return;
			try {
				// SVG for crisp print
				const svgStr = await QRCode.toString(signupUrl, {
					type: "svg",
					errorCorrectionLevel: "M",
					margin: 2,
				});
				// High-DPI PNG (good for ~2in print @300dpi => 600px)
				const png = await QRCode.toDataURL(signupUrl, {
					errorCorrectionLevel: "M",
					margin: 2,
					width: 600, // adjust for print size
				});
				if (!cancelled) {
					setSvg(svgStr);
					setPngUrl(png);
				}
			} catch (e) {
				console.error("QR generation failed:", e);
			}
		};
		generate();
		return () => {
			cancelled = true;
		};
	}, [signupUrl]);

	const downloadSVG = () => {
		const blob = new Blob([svg], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `signup-${classCode}.svg`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const downloadPNG = () => {
		const a = document.createElement("a");
		a.href = pngUrl;
		a.download = `signup-${classCode}.png`;
		a.click();
	};

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(signupUrl);
			alert("Signup link copied!");
		} catch {
			window.prompt("Copy signup link:", signupUrl);
		}
	};

	if (!classCode) return <p>Provide a class code</p>;

	return (
		<div style={{ textAlign: "center" }}>
			{/* Preview (SVG rendered into the DOM) */}
			<div
				style={{ width: size, height: size, margin: "0 auto" }}
				dangerouslySetInnerHTML={{ __html: svg }}
				aria-label={`Signup QR for ${classCode}`}
			/>
			<div
				style={{
					marginTop: 12,
					display: "flex",
					gap: 10,
					justifyContent: "center",
				}}
			>
				<button onClick={copyLink}>Copy link</button>
			</div>
			<div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
				<code>{signupUrl}</code>
			</div>
		</div>
	);
};

export default ClassSignupQR;
