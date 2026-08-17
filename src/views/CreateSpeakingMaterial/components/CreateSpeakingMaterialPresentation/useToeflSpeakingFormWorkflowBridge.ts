import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { ToeflSpeakingFormValues } from "./toeflSpeakingFormTypes";

type ToeflSpeakingFormWorkflowBridgeInput = {
	form: UseFormReturn<ToeflSpeakingFormValues>;
	workflow: {
		fieldChanged: () => void;
		syncCompletion: (values: ToeflSpeakingFormValues) => void;
	};
};

export function useToeflSpeakingFormWorkflowBridge({
	form,
	workflow,
}: ToeflSpeakingFormWorkflowBridgeInput) {
	const { isDirty } = form.formState;
	const { fieldChanged, syncCompletion } = workflow;

	useEffect(() => {
		if (isDirty) fieldChanged();
	}, [fieldChanged, isDirty]);

	useEffect(() => {
		const subscription = form.watch((values) => {
			syncCompletion(values as ToeflSpeakingFormValues);
		});
		return () => subscription.unsubscribe();
	}, [form, syncCompletion]);
}
