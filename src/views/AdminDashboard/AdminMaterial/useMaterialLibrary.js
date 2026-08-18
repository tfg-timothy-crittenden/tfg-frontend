import { useAllSpeakingSections } from "@/domain/materials/hooks/useAllSpeakingSections";

import { normalizeMaterialForUI } from "./materialUtils";

const useMaterialLibrary = () => {
	const { data = [], isLoading } = useAllSpeakingSections();
	const libraryMaterials = data.map(normalizeMaterialForUI).filter(Boolean);

	return {
		libraryMaterials,
		materialsLoaded: !isLoading,
	};
};

export default useMaterialLibrary;
