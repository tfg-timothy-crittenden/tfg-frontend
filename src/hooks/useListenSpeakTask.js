import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
	getToeflSpeakingMaterialQuestion,
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
	const cachedPartImageRef = useRef({ key: null, url: null });

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
			cachedPartImageRef.current = { key: null, url: null };
			setLoading(false);
			return;
		}

		let cancelled = false;

		const loadMaterial = async () => {
			try {
				const currentPartKey = `${sectionId}:${partNumber}`;
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

				const questionNode = await getToeflSpeakingMaterialQuestion(
					sectionId,
					partNumber,
					questionNumber,
				);

				if (cancelled) return;

				const resolvedPartId =
					questionNode?.parentNodeId ||
					questionNode?.parentId ||
					cachedPartRef.current.partId ||
					null;
				const currentPartImageKey = resolvedPartId
					? String(resolvedPartId)
					: currentPartKey;
				const isPartImageCacheHit =
					cachedPartImageRef.current.key === currentPartImageKey &&
					!!cachedPartImageRef.current.url;

				cachedPartRef.current = {
					key: currentPartKey,
					partId: resolvedPartId,
				};

				if (partId !== resolvedPartId) {
					setPartId(resolvedPartId);
				}

				setTestData(questionNode);

				const questionAssets =
					questionNode?.assets || questionNode?.materialAssets || [];
				const questionAudioAsset =
					questionAssets.find(
						(asset) => asset?.kind === "AUDIO" || asset?.type === "AUDIO",
					) || questionAssets[0];

				const resolvedQuestionAudioUrl =
					await getResolvedAssetUrl(questionAudioAsset);
				if (cancelled) return;
				setQuestionAudioUrl(resolvedQuestionAudioUrl);

				if (resolvedPartId && (!isPartImageCacheHit || !sharedImageUrl)) {
					const partAssetsData = await getMaterialNodeAssets(resolvedPartId);
					if (cancelled) return;

					const partAssets = Array.isArray(partAssetsData)
						? partAssetsData
						: partAssetsData?.assets || [];
					const imageAsset =
						partAssets.find(
							(asset) => asset?.type === "IMAGE" || asset?.kind === "IMAGE",
						) || partAssets[0];

					const resolvedSharedImageUrl = await getResolvedAssetUrl(imageAsset);
					if (cancelled) return;
					cachedPartImageRef.current = {
						key: currentPartImageKey,
						url: resolvedSharedImageUrl,
					};
					setSharedImageUrl(resolvedSharedImageUrl);
				} else if (sharedImageUrl !== cachedPartImageRef.current.url) {
					setSharedImageUrl(cachedPartImageRef.current.url);
				}
			} catch (error) {
				if (!cancelled) {
					console.error("Error loading listen/speak task material:", error);
					setTestData(null);
					setPartId(null);
					setSharedImageUrl(null);
					setQuestionAudioUrl(null);
					cachedPartRef.current = { key: null, partId: null };
					cachedPartImageRef.current = { key: null, url: null };
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
