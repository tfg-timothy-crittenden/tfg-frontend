import { useForm } from "react-hook-form";

import {
	defaultToeflSpeakingFormValues,
	type ToeflSpeakingFormValues,
} from "./toeflSpeakingFormTypes";

export function useToeflSpeakingForm() {
	return useForm<ToeflSpeakingFormValues>({
		defaultValues: defaultToeflSpeakingFormValues,
		mode: "onChange",
	});
}
