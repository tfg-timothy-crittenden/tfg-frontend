const getPart1Questions = (section) =>
	section?.questions ||
	section?.part1Questions ||
	section?.part1?.questions ||
	[];

const getPart2Questions = (section) =>
	section?.part2Questions || section?.part2?.questions || [];

const getQuestionTranscript = (question) =>
	question?.transcriptText || question?.transcript || "";

const toMediaRef = ({ directUrl = null, objectKey = null, bucket = null }) => {
	if (!directUrl && !objectKey) return null;
	return {
		url: directUrl || null,
		objectKey: objectKey || null,
		bucket: bucket || null,
	};
};

const getObjectKey = (source) =>
	source?.objectKey ||
	source?.storageKey ||
	source?.key ||
	source?.object_key ||
	source?.storage_key ||
	null;

const getDirectUrl = (source) =>
	source?.signedUrl ||
	source?.url ||
	source?.assetUrl ||
	source?.previewUrl ||
	null;

const getBucket = (source) => source?.bucket || null;

const pickAudioAsset = (assets = []) =>
	assets.find((asset) => asset?.type === "AUDIO" || asset?.kind === "AUDIO") ||
	assets[0] ||
	null;

const pickImageAsset = (assets = []) =>
	assets.find((asset) => asset?.type === "IMAGE" || asset?.kind === "IMAGE") ||
	assets[0] ||
	null;

const getQuestionConfig = (question) => {
	if (!question) return {};
	if (typeof question.config === "string") {
		try {
			return JSON.parse(question.config);
		} catch {
			return {};
		}
	}
	if (question.config && typeof question.config === "object") {
		return question.config;
	}
	return {};
};

const getQuestionAudioUrl = (question) => {
	if (!question) return null;
	const questionAssets =
		question?.assets || question?.materialAssets || question?.mediaAssets || [];
	const audioAsset = pickAudioAsset(questionAssets);
	const mediaRef = toMediaRef({
		directUrl:
			question?.audioUrl ||
			question?.audio_url ||
			question?.audio?.url ||
			question?.audio?.signedUrl ||
			question?.audio?.assetUrl ||
			getDirectUrl(audioAsset),
		objectKey: getObjectKey(question?.audio) || getObjectKey(audioAsset),
		bucket: getBucket(question?.audio) || getBucket(audioAsset),
	});

	if (!mediaRef) return null;
	return mediaRef.url;
};

const getPartImageUrl = (section) =>
	section?.partImageUrl ||
	section?.partImage?.url ||
	section?.partImage?.signedUrl ||
	section?.partImage?.assetUrl ||
	section?.part1?.imageUrl ||
	section?.part1?.partImageUrl ||
	section?.part1?.partImage?.url ||
	section?.part1?.partImage?.signedUrl ||
	section?.part1?.partImage?.assetUrl ||
	section?.assets?.find(
		(asset) => asset?.type === "IMAGE" || asset?.kind === "IMAGE",
	)?.url ||
	section?.assets?.find(
		(asset) => asset?.type === "IMAGE" || asset?.kind === "IMAGE",
	)?.signedUrl ||
	section?.assets?.find(
		(asset) => asset?.type === "IMAGE" || asset?.kind === "IMAGE",
	)?.assetUrl ||
	section?.part1?.assets?.find(
		(asset) => asset?.type === "IMAGE" || asset?.kind === "IMAGE",
	)?.url ||
	section?.part1?.assets?.find(
		(asset) => asset?.type === "IMAGE" || asset?.kind === "IMAGE",
	)?.signedUrl ||
	section?.part1?.assets?.find(
		(asset) => asset?.type === "IMAGE" || asset?.kind === "IMAGE",
	)?.assetUrl ||
	null;

const getQuestionAudioRef = (question) => {
	if (!question) return null;
	const questionAssets =
		question?.assets || question?.materialAssets || question?.mediaAssets || [];
	const audioAsset = pickAudioAsset(questionAssets);

	return toMediaRef({
		directUrl:
			question?.audioUrl ||
			question?.audio_url ||
			question?.audio?.url ||
			question?.audio?.signedUrl ||
			question?.audio?.assetUrl ||
			getDirectUrl(audioAsset),
		objectKey: getObjectKey(question?.audio) || getObjectKey(audioAsset),
		bucket: getBucket(question?.audio) || getBucket(audioAsset),
	});
};

const getPartImageRef = (section) => {
	const sectionImageAsset = pickImageAsset(section?.assets || []);
	const partImageAsset = pickImageAsset(section?.part1?.assets || []);

	return toMediaRef({
		directUrl:
			section?.partImageUrl ||
			section?.partImage?.url ||
			section?.partImage?.signedUrl ||
			section?.partImage?.assetUrl ||
			section?.part1?.imageUrl ||
			section?.part1?.partImageUrl ||
			section?.part1?.partImage?.url ||
			section?.part1?.partImage?.signedUrl ||
			section?.part1?.partImage?.assetUrl ||
			getDirectUrl(sectionImageAsset) ||
			getDirectUrl(partImageAsset),
		objectKey:
			getObjectKey(section?.partImage) ||
			getObjectKey(section?.part1?.partImage) ||
			getObjectKey(sectionImageAsset) ||
			getObjectKey(partImageAsset),
		bucket:
			getBucket(section?.partImage) ||
			getBucket(section?.part1?.partImage) ||
			getBucket(sectionImageAsset) ||
			getBucket(partImageAsset),
	});
};

const toStableString = (value) => {
	if (!value || typeof value !== "object") return JSON.stringify(value ?? {});
	const sorted = Object.keys(value)
		.sort()
		.reduce((acc, key) => {
			acc[key] = value[key];
			return acc;
		}, {});
	return JSON.stringify(sorted);
};

const hasEntries = (formData) => {
	for (const _entry of formData.entries()) {
		return true;
	}
	return false;
};

export const normalizeSectionToFormState = (
	section,
	questionCount,
	part2QuestionCount,
) => {
	const part1Questions = getPart1Questions(section);
	const part2Questions = getPart2Questions(section);

	const questions = Array.from({ length: questionCount }, (_, idx) => ({
		transcriptText: getQuestionTranscript(part1Questions[idx]),
		audio: [],
	}));

	const normalizedPart2Questions = Array.from(
		{ length: part2QuestionCount },
		(_, idx) => ({
			transcriptText: getQuestionTranscript(part2Questions[idx]),
			audio: [],
		}),
	);

	const highlightDataByQuestion = Array.from(
		{ length: questionCount },
		(_, idx) => {
			const config = getQuestionConfig(part1Questions[idx]);
			return config?.highlight_data || null;
		},
	);

	const part2ConfigByQuestion = Array.from(
		{ length: part2QuestionCount },
		(_, idx) => getQuestionConfig(part2Questions[idx]),
	);

	return {
		values: {
			materialTitle: section?.materialTitle || section?.title || "",
			materialDescription:
				section?.materialDescription || section?.description || "",
			materialId: String(section?.materialId || section?.id || ""),
			partTitle: section?.partTitle || section?.part1Title || "",
			part2Title: section?.part2Title || "",
			questions,
			part2Questions: normalizedPart2Questions,
		},
		highlightDataByQuestion,
		part2ConfigByQuestion,
		existingMedia: {
			partImageUrl: getPartImageUrl(section),
			questionAudioUrls: Array.from({ length: questionCount }, (_, idx) =>
				getQuestionAudioUrl(part1Questions[idx]),
			),
			part2QuestionAudioUrls: Array.from(
				{ length: part2QuestionCount },
				(_, idx) => getQuestionAudioUrl(part2Questions[idx]),
			),
		},
	};
};

export const extractSectionMediaRefs = (
	section,
	questionCount,
	part2QuestionCount,
) => {
	const part1Questions = getPart1Questions(section);
	const part2Questions = getPart2Questions(section);

	return {
		partImage: getPartImageRef(section),
		questionAudio: Array.from({ length: questionCount }, (_, idx) =>
			getQuestionAudioRef(part1Questions[idx]),
		),
		part2QuestionAudio: Array.from({ length: part2QuestionCount }, (_, idx) =>
			getQuestionAudioRef(part2Questions[idx]),
		),
	};
};

export const buildCreateSpeakingSectionFormData = ({
	data,
	highlightDataByQuestion,
	part2ConfigByQuestion,
}) => {
	const formData = new FormData();
	formData.append("materialTitle", data.materialTitle);
	if (data.partTitle) formData.append("partTitle", data.partTitle);
	if (data.part2Title) formData.append("part2Title", data.part2Title);
	if (data.materialDescription) {
		formData.append("materialDescription", data.materialDescription);
	}
	if (data.materialId) formData.append("materialId", data.materialId);
	if (data.image && data.image[0]) {
		formData.append("partImage", data.image[0]);
	}

	for (let i = 0; i < (data.questions?.length || 0); i++) {
		formData.append(
			`questions[${i}].transcriptText`,
			data.questions[i].transcriptText,
		);
		if (data.questions[i].audio && data.questions[i].audio[0]) {
			formData.append(`questions[${i}].audio`, data.questions[i].audio[0]);
		}
		const config = {};
		if (highlightDataByQuestion?.[i]) {
			config.highlight_data = highlightDataByQuestion[i];
		}
		formData.append(`questions[${i}].config`, JSON.stringify(config));
	}

	for (let i = 0; i < (data.part2Questions?.length || 0); i++) {
		formData.append(
			`part2Questions[${i}].transcriptText`,
			data.part2Questions[i].transcriptText,
		);
		const part2Config = part2ConfigByQuestion?.[i] || {};
		formData.append(`part2Questions[${i}].config`, JSON.stringify(part2Config));
		if (data.part2Questions[i].audio && data.part2Questions[i].audio[0]) {
			formData.append(
				`part2Questions[${i}].audio`,
				data.part2Questions[i].audio[0],
			);
		}
	}

	return formData;
};

export const buildPatchSpeakingSectionFormData = ({
	initialValues,
	initialHighlightDataByQuestion,
	initialPart2ConfigByQuestion,
	data,
	highlightDataByQuestion,
	part2ConfigByQuestion,
}) => {
	const formData = new FormData();

	if ((initialValues?.materialTitle || "") !== (data.materialTitle || "")) {
		formData.append("materialTitle", data.materialTitle || "");
	}

	if (
		(initialValues?.materialDescription || "") !==
		(data.materialDescription || "")
	) {
		formData.append("materialDescription", data.materialDescription || "");
	}

	if ((initialValues?.partTitle || "") !== (data.partTitle || "")) {
		formData.append("partTitle", data.partTitle || "");
	}

	if ((initialValues?.part2Title || "") !== (data.part2Title || "")) {
		formData.append("part2Title", data.part2Title || "");
	}

	if (data.image && data.image[0]) {
		formData.append("partImage", data.image[0]);
	}

	for (let i = 0; i < (data.questions?.length || 0); i++) {
		const prevTranscript = initialValues?.questions?.[i]?.transcriptText || "";
		const nextTranscript = data.questions?.[i]?.transcriptText || "";
		if (prevTranscript !== nextTranscript) {
			formData.append(`questions[${i}].transcriptText`, nextTranscript);
		}

		if (data.questions?.[i]?.audio?.[0]) {
			formData.append(`questions[${i}].audio`, data.questions[i].audio[0]);
		}

		const prevConfig = {
			highlight_data: initialHighlightDataByQuestion?.[i] || undefined,
		};
		if (!prevConfig.highlight_data) {
			delete prevConfig.highlight_data;
		}
		const nextConfig = {};
		if (highlightDataByQuestion?.[i]) {
			nextConfig.highlight_data = highlightDataByQuestion[i];
		}

		if (toStableString(prevConfig) !== toStableString(nextConfig)) {
			formData.append(`questions[${i}].config`, JSON.stringify(nextConfig));
		}
	}

	for (let i = 0; i < (data.part2Questions?.length || 0); i++) {
		const prevTranscript =
			initialValues?.part2Questions?.[i]?.transcriptText || "";
		const nextTranscript = data.part2Questions?.[i]?.transcriptText || "";
		if (prevTranscript !== nextTranscript) {
			formData.append(`part2Questions[${i}].transcriptText`, nextTranscript);
		}

		const prevPart2Config = initialPart2ConfigByQuestion?.[i] || {};
		const nextPart2Config = part2ConfigByQuestion?.[i] || {};
		if (toStableString(prevPart2Config) !== toStableString(nextPart2Config)) {
			formData.append(
				`part2Questions[${i}].config`,
				JSON.stringify(nextPart2Config),
			);
		}

		if (data.part2Questions?.[i]?.audio?.[0]) {
			formData.append(
				`part2Questions[${i}].audio`,
				data.part2Questions[i].audio[0],
			);
		}
	}

	return hasEntries(formData) ? formData : null;
};
