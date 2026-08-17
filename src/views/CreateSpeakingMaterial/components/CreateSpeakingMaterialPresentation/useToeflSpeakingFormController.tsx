import { useToeflSpeakingForm } from "./useToeflSpeakingForm";
import { useToeflSpeakingFormWorkflowBridge } from "./useToeflSpeakingFormWorkflowBridge";
import { useToeflSpeakingHeaderActions } from "./useToeflSpeakingHeaderActions";
import { useToeflSpeakingPersistence } from "./useToeflSpeakingPersistence";
import { useToeflSpeakingRouter } from "./useToeflSpeakingRouter";
import { useToeflSpeakingWorkflow } from "./useToeflSpeakingWorkflow";

export function useToeflSpeakingFormController(materialId?: number) {
	const form = useToeflSpeakingForm();
	const workflow = useToeflSpeakingWorkflow();
	const router = useToeflSpeakingRouter();

	useToeflSpeakingFormWorkflowBridge({ form, workflow });

	const persistence = useToeflSpeakingPersistence({
		materialId,
		form: {
			getValues: form.getValues,
			reset: form.reset,
		},
		workflow,
		router,
	});

	const headerActions = useToeflSpeakingHeaderActions({
		workflow,
		persistence,
	});

	return {
		form,
		state: workflow.state,
		context: workflow.context,
		isMaterialDetails: workflow.isMaterialDetails,
		isPart1Image: workflow.isPart1Image,
		isPart1Questions: workflow.isPart1Questions,
		isPart2Questions: workflow.isPart2Questions,
		nextStep: workflow.nextStep,
		previousStep: workflow.previousStep,
		nextQuestion: workflow.nextQuestion,
		previousQuestion: workflow.previousQuestion,
		setCurrentQuestion: workflow.setCurrentQuestion,
		nextPart2Question: workflow.nextPart2Question,
		previousPart2Question: workflow.previousPart2Question,
		setCurrentPart2Question: workflow.setCurrentPart2Question,
		headerActions,
		saveDraft: persistence.saveDraft,
		savePublishedChanges: persistence.savePublishedChanges,
		publish: persistence.publish,
		revert: persistence.revert,
	};
}
