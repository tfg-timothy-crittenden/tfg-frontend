import { useEffect, useState } from "react";

import { getAllMaterial } from "@/api/material/materialAPI";

import { normalizeMaterialForUI } from "./materialUtils";

const useMaterialLibrary = () => {
	const [libraryMaterials, setLibraryMaterials] = useState([]);
	const [materialsLoaded, setMaterialsLoaded] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const materialListResponse = await getAllMaterial();
				const normalizedMaterials = Array.isArray(materialListResponse)
					? materialListResponse
							.map((item) => normalizeMaterialForUI(item))
							.filter(Boolean)
					: [];

				setLibraryMaterials(normalizedMaterials);
				setMaterialsLoaded(true);
			} catch (err) {
				console.error("Error fetching speaking tests:", err);
				setMaterialsLoaded(true);
			}
		};

		fetchData();
	}, []);

	return {
		libraryMaterials,
		materialsLoaded,
	};
};

export default useMaterialLibrary;
