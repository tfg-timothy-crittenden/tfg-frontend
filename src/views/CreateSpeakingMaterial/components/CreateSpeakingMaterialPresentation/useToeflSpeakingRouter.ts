import { useNavigate } from "react-router-dom";

import { buildRoute } from "@/app/routes/routeConfig";

export type ToeflSpeakingRouterPort = {
	goToEditMaterial: (materialId: number) => void;
};

export function useToeflSpeakingRouter(): ToeflSpeakingRouterPort {
	const navigate = useNavigate();

	return {
		goToEditMaterial: (materialId: number) => {
			navigate(buildRoute.editSpeakingMaterial(materialId), {
				replace: true,
			});
		},
	};
}
