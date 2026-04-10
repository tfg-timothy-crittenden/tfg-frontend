import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ListenRepeatPresentation from "./ListenRepeatPresentation";
import {
	getMaterialByParentIdAndOrder,
	getMaterialNodeAssets,
	getPresignedUrl,
} from "@/api/material/materialAPI";

const ListenRepeatContainer = () => {
	const { sectionId, partNumber, questionNumber } = useParams();
	const location = useLocation();
	console.log("sectionID: ", sectionId);
	console.log("partNumber", partNumber);
	console.log("questionNumber", questionNumber);

	const modeEnum = Object.freeze({
		INSTRUCTIONS: "INSTRUCTIONS",
		LISTEN: "LISTEN",
		SPEAK: "SPEAK",
	});

	const modeTimes = {
		[modeEnum.LISTEN]: 30,
		[modeEnum.SPEAK]: 60,
	};

	const getModeFromUrl = () => {
		const pathname = location.pathname;
		if (pathname.includes("/instructions")) return modeEnum.INSTRUCTIONS;
		if (pathname.includes("/listen")) return modeEnum.LISTEN;
		if (pathname.includes("/speak")) return modeEnum.SPEAK;
		return modeEnum.INSTRUCTIONS;
	};

	const [mode, setMode] = useState(getModeFromUrl());
	const [time, setTime] = useState(0);
	const [testData, setTestData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [partId, setPartId] = useState(null);
	const [sharedImageUrl, setSharedImageUrl] = useState(null);
	const [questionAudioUrl, setQuestionAudioUrl] = useState(null);

	//Get the mode from the URL (Listen or speak)
	useEffect(() => {
		const newMode = getModeFromUrl();
		setMode(newMode);
		if (newMode === modeEnum.LISTEN) setTime(modeTimes.LISTEN * 1000);
		else if (newMode === modeEnum.SPEAK) setTime(modeTimes.SPEAK * 1000);
	}, [location.pathname]);

	useEffect(() => {
		if (!sectionId || !questionNumber) return;

		const loadMaterial = async () => {
			setLoading(true);
			try {
				const partNumberAsNumber = Number(partNumber);
				const partDisplayOrder = Number.isNaN(partNumberAsNumber)
					? 0
					: Math.max(partNumberAsNumber - 1, 0);

				const partNode = await getMaterialByParentIdAndOrder(
					sectionId,
					partDisplayOrder,
				);

				const resolvedPartId = partNode?.id || partNode?.materialNodeId || null;
				setPartId(resolvedPartId);

				if (!resolvedPartId) {
					setTestData(null);
					return;
				}

				const questionNumberAsNumber = Number(questionNumber);
				const questionDisplayOrder = Number.isNaN(questionNumberAsNumber)
					? 0
					: Math.max(questionNumberAsNumber - 1, 0);

				const questionNode = await getMaterialByParentIdAndOrder(
					resolvedPartId,
					questionDisplayOrder,
				);

				setTestData(questionNode);

				const questionAssets =
					questionNode?.materialAssets || questionNode?.assets || [];
				const audioAsset = questionAssets.find(
					(asset) =>
						asset?.order === 0 ||
						asset?.displayOrder === 0 ||
						asset?.display_order === 0 ||
						asset?.type === "AUDIO",
				);
				const audioObjectKey =
					audioAsset?.objectKey ||
					audioAsset?.storageKey ||
					audioAsset?.key ||
					audioAsset?.object_key ||
					audioAsset?.storage_key ||
					null;
				const audioBucket = audioAsset?.bucket || "toefl";

				if (audioObjectKey) {
					const signedUrlResponse = await getPresignedUrl({
						bucket: audioBucket,
						objectKey: audioObjectKey,
						expirationSeconds: 3600,
					});

					const signedUrl =
						typeof signedUrlResponse === "string"
							? signedUrlResponse
							: signedUrlResponse?.signedUrl ||
								signedUrlResponse?.url ||
								signedUrlResponse?.presignedUrl ||
								null;
					setQuestionAudioUrl(signedUrl);
				} else {
					setQuestionAudioUrl(
						audioAsset?.signedUrl ||
							audioAsset?.url ||
							audioAsset?.assetUrl ||
							null,
					);
				}
			} catch (err) {
				console.error("Error loading material node:", err);
				setTestData(null);
				setPartId(null);
				setQuestionAudioUrl(null);
			} finally {
				setLoading(false);
			}
		};

		loadMaterial();
	}, [sectionId, partNumber, questionNumber]);

	useEffect(() => {
		if (!partId) {
			setSharedImageUrl(null);
			setQuestionAudioUrl(null);
			return;
		}

		let cancelled = false;
		getMaterialNodeAssets(partId)
			.then(async (data) => {
				if (cancelled) return;

				const assets = Array.isArray(data) ? data : data?.assets || [];
				const imageAsset =
					assets.find((asset) => asset?.type === "IMAGE") || assets[0];
				const objectKey = imageAsset?.storageKey || null;

				const bucket = imageAsset?.bucket || "toefl";

				if (objectKey) {
					const signedUrlResponse = await getPresignedUrl({
						bucket,
						objectKey,
						expirationSeconds: 3600,
					});
					if (cancelled) return;

					const signedUrl =
						typeof signedUrlResponse === "string"
							? signedUrlResponse
							: signedUrlResponse?.signedUrl ||
								signedUrlResponse?.url ||
								signedUrlResponse?.presignedUrl ||
								null;
					setSharedImageUrl(signedUrl);
					console.log(signedUrl);

					return;
				}

				const directImageUrl =
					imageAsset?.signedUrl ||
					imageAsset?.url ||
					imageAsset?.assetUrl ||
					null;
				setSharedImageUrl(directImageUrl);
			})
			.catch((err) => console.error("Error loading material assets:", err));

		return () => {
			cancelled = true;
		};
	}, [partId]);

	return (
		<ListenRepeatPresentation
			mode={mode}
			setMode={setMode}
			modeEnum={modeEnum}
			modeTimeEnum={modeTimes}
			time={time}
			setTime={setTime}
			testData={testData}
			sharedImageUrl={sharedImageUrl}
			questionAudioUrl={questionAudioUrl}
			loading={loading}
		/>
	);
};

export default ListenRepeatContainer;
