export type MaterialAssetKind =
	| "TEXT"
	| "AUDIO"
	| "IMAGE"
	| "VIDEO"
	| "PDF"
	| "OTHER";

export type MaterialAsset = {
	id: number;
	kind: MaterialAssetKind;
	storageKey: string;
	displayOrder: number;
};
