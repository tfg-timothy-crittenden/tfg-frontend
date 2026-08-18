import type { MaterialAsset } from "./MaterialAsset";

export type MaterialNodeKind = "SECTION" | "PART" | "ITEM" | "QUESTION";

export type MaterialNode = {
	id: number;
	parentNodeId: number;
	kind: MaterialNodeKind;
	title: string;
	displayOrder: number;
	transcriptText: string;
	assets: MaterialAsset[];
	/** Parsed config object. Structure depends on node kind. */
	config: Record<string, unknown>;
};
