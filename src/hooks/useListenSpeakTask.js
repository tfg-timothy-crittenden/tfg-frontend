import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
	getMaterialByParentIdAndOrder,
	getMaterialNodeAssets,
	getPresignedUrl,
} from "@/api/material/materialAPI";

const modeEnum = Object.freeze({
	INSTRUCTIONS: "INSTRUCTIONS",
	LISTEN: "LISTEN",
	SPEAK: "SPEAK",
});

const modeTimes = {
	[modeEnum.LISTEN]: 30,
	[modeEnum.SPEAK]: 60,
};

const getModeFromPath = (pathname) => {
	if (pathname.includes("/instructions")) return modeEnum.INSTRUCTIONS;
	if (pathname.includes("/listen")) return modeEnum.LISTEN;
	if (pathname.includes("/speak")) return modeEnum.SPEAK;
	return modeEnum.INSTRUCTIONS;
};

const getResolvedAssetUrl = async (asset) => {
	if (!asset) return null;

	const directUrl =
		asset.signedUrl || asset.url || asset.assetUrl || asset.previewUrl || null;
	const objectKey =
		asset.objectKey ||
		asset.storageKey ||
		asset.key ||
		asset.object_key ||
		asset.storage_key ||
		null;

	if (!objectKey) {
		return directUrl;
	}

	const bucket = asset.bucket || "toefl";
	const signedUrlResponse = await getPresignedUrl({
		bucket,
		objectKey,
		expirationSeconds: 3600,
	});

	if (typeof signedUrlResponse === "string") {
		return signedUrlResponse;
	}

	return (
		signedUrlResponse?.signedUrl ||
		signedUrlResponse?.url ||
		signedUrlResponse?.presignedUrl ||
		directUrl ||
		null
	);
};

const useListenSpeakTask = () => {
	const { sectionId, partNumber, questionNumber } = useParams();
	const location = useLocation();

	const [mode, setMode] = useState(getModeFromPath(location.pathname));
	const [time, setTime] = useState(0);
	const [testData, setTestData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [partId, setPartId] = useState(null);
	const [sharedImageUrl, setSharedImageUrl] = useState(null);
	const [questionAudioUrl, setQuestionAudioUrl] = useState(null);
	const cachedPartRef = useRef({ key: null, partId: null });

	useEffect(() => {
		const nextMode = getModeFromPath(location.pathname);
		setMode(nextMode);
		if (nextMode === modeEnum.LISTEN) {
			setTime(modeTimes.LISTEN * 1000);
		} else if (nextMode === modeEnum.SPEAK) {
			setTime(modeTimes.SPEAK * 1000);
		} else {
			setTime(0);
		}
	}, [location.pathname]);

	useEffect(() => {
		if (!sectionId || !questionNumber) {
			setTestData(null);
			setPartId(null);
			setSharedImageUrl(null);
			setQuestionAudioUrl(null);
			cachedPartRef.current = { key: null, partId: null };
			setLoading(false);
			return;
		}

		let cancelled = false;

		const loadMaterial = async () => {
			try {
				const partNumberAsNumber = Number(partNumber);
				const partDisplayOrder = Number.isNaN(partNumberAsNumber)
					? 0
					: Math.max(partNumberAsNumber - 1, 0);
				const currentPartKey = `${sectionId}:${partDisplayOrder}`;
				const isPartCacheHit =
					cachedPartRef.current.key === currentPartKey &&
					!!cachedPartRef.current.partId;

				// Keep shared image mounted during question switches within the same part.
				if (!isPartCacheHit) {
					setLoading(true);
					setTestData(null);
					setQuestionAudioUrl(null);
					setSharedImageUrl(null);
				}

				let resolvedPartId = isPartCacheHit
					? cachedPartRef.current.partId
					: null;

				if (!resolvedPartId) {
					const partNode = await getMaterialByParentIdAndOrder(
						sectionId,
						partDisplayOrder,
					);

					resolvedPartId = partNode?.id || partNode?.materialNodeId || null;
					if (cancelled) return;
					cachedPartRef.current = {
						key: currentPartKey,
						partId: resolvedPartId,
					};
					setPartId(resolvedPartId);
				} else if (partId !== resolvedPartId) {
					setPartId(resolvedPartId);
				}

				if (!resolvedPartId) {
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

				if (cancelled) return;
				setTestData(questionNode);

				const questionAssets =
					questionNode?.materialAssets || questionNode?.assets || [];
				const questionAudioAsset = questionAssets.find(
					(asset) =>
						asset?.order === 0 ||
						asset?.displayOrder === 0 ||
						asset?.display_order === 0 ||
						asset?.type === "AUDIO",
				);

				const resolvedQuestionAudioUrl =
					await getResolvedAssetUrl(questionAudioAsset);
				if (cancelled) return;
				setQuestionAudioUrl(resolvedQuestionAudioUrl);

				if (!isPartCacheHit || !sharedImageUrl) {
					const partAssetsData = await getMaterialNodeAssets(resolvedPartId);
					if (cancelled) return;

					const partAssets = Array.isArray(partAssetsData)
						? partAssetsData
						: partAssetsData?.assets || [];
					const imageAsset =
						partAssets.find((asset) => asset?.type === "IMAGE") ||
						partAssets[0];

					const resolvedSharedImageUrl = await getResolvedAssetUrl(imageAsset);
					if (cancelled) return;
					setSharedImageUrl(resolvedSharedImageUrl);
				}
			} catch (error) {
				if (!cancelled) {
					console.error("Error loading listen/speak task material:", error);
					setTestData(null);
					setPartId(null);
					setSharedImageUrl(null);
					setQuestionAudioUrl(null);
					cachedPartRef.current = { key: null, partId: null };
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		loadMaterial();

		return () => {
			cancelled = true;
		};
	}, [sectionId, partNumber, questionNumber]);

	return {
		mode,
		setMode,
		time,
		setTime,
		testData,
		loading,
		partId,
		sharedImageUrl,
		questionAudioUrl,
		modeEnum,
		modeTimes,
	};
};

export default useListenSpeakTask;
