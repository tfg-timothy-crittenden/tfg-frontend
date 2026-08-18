import type { ToeflSpeakingFormValues } from "./toeflSpeakingFormTypes";

/**
 * Converts RHF form values to the multipart FormData the backend expects.
 *
 * - Only appends audio/image when the value is a new File (i.e. not a storage
 *   key string). Existing server files are identified by their string storage
 *   key and should not be re-uploaded — omitting them leaves them unchanged.
 */
export function buildSpeakingSectionFormData(
	values: ToeflSpeakingFormValues,
	materialId?: number | null,
): FormData {
	const fd = new FormData();

	fd.append("materialTitle", values.title.trim());
	if (values.description?.trim()) {
		fd.append("materialDescription", values.description.trim());
	}
	fd.append("partTitle", values.part1Title.trim());
	fd.append("part2Title", values.part2Title.trim());
	if (materialId != null) {
		fd.append("materialId", String(materialId));
	}
	if (values.part1Image instanceof File) {
		fd.append("partImage", values.part1Image);
	}

	for (let i = 0; i < values.part1Questions.length; i++) {
		const q = values.part1Questions[i];
		fd.append(`questions[${i}].transcriptText`, q.transcript);
		const highlightData = values.part1Highlights[i];
		if (highlightData) {
			fd.append(
				`questions[${i}].config`,
				JSON.stringify({ highlight_data: highlightData }),
			);
		}
		if (q.audio instanceof File) {
			fd.append(`questions[${i}].audio`, q.audio);
		}
	}

	for (let i = 0; i < values.part2Questions.length; i++) {
		const q = values.part2Questions[i];
		fd.append(`part2Questions[${i}].transcriptText`, q.transcript);
		if (q.audio instanceof File) {
			fd.append(`part2Questions[${i}].audio`, q.audio);
		}
	}

	return fd;
}
