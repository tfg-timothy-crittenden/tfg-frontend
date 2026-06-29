import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { toeflSpeakingFormMachine } from "./toeflSpeakingFormMachine";

function createFormActor() {
	const actor = createActor(toeflSpeakingFormMachine);
	actor.start();
	return actor;
}

function loadExistingDraft(actor: ReturnType<typeof createFormActor>) {
	actor.send({
		type: "LOAD_SUCCESS",
		materialId: 123,
		sectionStatus: "DRAFT",
	});
}

function loadExistingPublished(actor: ReturnType<typeof createFormActor>) {
	actor.send({
		type: "LOAD_SUCCESS",
		materialId: 123,
		sectionStatus: "PUBLISHED",
	});
}

function setAllComplete(actor: ReturnType<typeof createFormActor>) {
	actor.send({
		type: "FORM_COMPLETION_CHANGED",
		materialInfoValid: true,
		hasPart1Image: true,
		part1QuestionsValid: true,
		part2QuestionsValid: true,
	});
}

function setMaterialInfoValid(actor: ReturnType<typeof createFormActor>) {
	actor.send({
		type: "FORM_COMPLETION_CHANGED",
		materialInfoValid: true,
		hasPart1Image: false,
		part1QuestionsValid: false,
		part2QuestionsValid: false,
	});
}

function setImageComplete(actor: ReturnType<typeof createFormActor>) {
	actor.send({
		type: "FORM_COMPLETION_CHANGED",
		materialInfoValid: true,
		hasPart1Image: true,
		part1QuestionsValid: false,
		part2QuestionsValid: false,
	});
}

function setPart1QuestionsComplete(actor: ReturnType<typeof createFormActor>) {
	actor.send({
		type: "FORM_COMPLETION_CHANGED",
		materialInfoValid: true,
		hasPart1Image: true,
		part1QuestionsValid: true,
		part2QuestionsValid: false,
	});
}

describe("TOEFL speaking form machine - loading", () => {
	it("starts in loading", () => {
		const actor = createFormActor();

		expect(actor.getSnapshot().value).toBe("loading");
	});

	it("moves to idle after load success", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});

		expect(actor.getSnapshot().context.materialId).toBe(123);
		expect(actor.getSnapshot().context.sectionStatus).toBe("DRAFT");
		expect(actor.getSnapshot().context.mode).toBe("edit");
	});

	it("moves to loadError after load failure", () => {
		const actor = createFormActor();

		actor.send({
			type: "LOAD_FAILURE",
			error: "Could not load material",
		});

		expect(actor.getSnapshot().value).toBe("loadError");
		expect(actor.getSnapshot().context.error).toBe("Could not load material");
	});

	it("can retry from loadError", () => {
		const actor = createFormActor();

		actor.send({
			type: "LOAD_FAILURE",
			error: "Could not load material",
		});

		actor.send({ type: "RETRY" });

		expect(actor.getSnapshot().value).toBe("loading");
	});
});

describe("TOEFL speaking form machine - step navigation", () => {
	it("does not move from material details when material info is invalid", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "NEXT_STEP" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});
	});

	it("moves from material details to image when material info is valid", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setMaterialInfoValid(actor);

		actor.send({ type: "NEXT_STEP" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "part1Image",
				persistence: "clean",
			},
		});
	});

	it("does not move from image step when image is missing", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setMaterialInfoValid(actor);

		actor.send({ type: "NEXT_STEP" });
		actor.send({ type: "NEXT_STEP" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "part1Image",
				persistence: "clean",
			},
		});
	});

	it("moves from image step to part 1 questions when image exists", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setImageComplete(actor);

		actor.send({ type: "NEXT_STEP" });
		actor.send({ type: "NEXT_STEP" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "part1Questions",
				persistence: "clean",
			},
		});
	});

	it("does not move from part 1 questions to part 2 questions when part 1 is incomplete", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setImageComplete(actor);

		actor.send({ type: "NEXT_STEP" });
		actor.send({ type: "NEXT_STEP" });
		actor.send({ type: "NEXT_STEP" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "part1Questions",
				persistence: "clean",
			},
		});
	});

	it("moves from part 1 questions to part 2 questions when part 1 is complete", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setPart1QuestionsComplete(actor);

		actor.send({ type: "NEXT_STEP" });
		actor.send({ type: "NEXT_STEP" });
		actor.send({ type: "NEXT_STEP" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "part2Questions",
				persistence: "clean",
			},
		});
	});

	it("can move backwards between steps", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setPart1QuestionsComplete(actor);

		actor.send({ type: "NEXT_STEP" });
		actor.send({ type: "NEXT_STEP" });
		actor.send({ type: "NEXT_STEP" });

		actor.send({ type: "PREVIOUS_STEP" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "part1Questions",
				persistence: "clean",
			},
		});

		actor.send({ type: "PREVIOUS_STEP" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "part1Image",
				persistence: "clean",
			},
		});

		actor.send({ type: "PREVIOUS_STEP" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});
	});
});

describe("TOEFL speaking form machine - question navigation", () => {
	it("starts on part 1 question index 0", () => {
		const actor = createFormActor();

		expect(actor.getSnapshot().context.currentQuestion).toBe(0);
	});

	it("can move through part 1 questions up to index 6", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		for (let i = 0; i < 10; i++) {
			actor.send({ type: "NEXT_QUESTION" });
		}

		expect(actor.getSnapshot().context.currentQuestion).toBe(6);
	});

	it("can move backwards through part 1 questions down to index 0", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		for (let i = 0; i < 6; i++) {
			actor.send({ type: "NEXT_QUESTION" });
		}

		for (let i = 0; i < 10; i++) {
			actor.send({ type: "PREVIOUS_QUESTION" });
		}

		expect(actor.getSnapshot().context.currentQuestion).toBe(0);
	});

	it("can move through part 2 questions up to index 3", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		for (let i = 0; i < 10; i++) {
			actor.send({ type: "NEXT_PART2_QUESTION" });
		}

		expect(actor.getSnapshot().context.currentPart2Question).toBe(3);
	});

	it("can move backwards through part 2 questions down to index 0", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		for (let i = 0; i < 3; i++) {
			actor.send({ type: "NEXT_PART2_QUESTION" });
		}

		for (let i = 0; i < 10; i++) {
			actor.send({ type: "PREVIOUS_PART2_QUESTION" });
		}

		expect(actor.getSnapshot().context.currentPart2Question).toBe(0);
	});
});

describe("TOEFL speaking form machine - draft saving", () => {
	it("marks the form dirty when a field changes", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "FIELD_CHANGED" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "dirty",
			},
		});

		expect(actor.getSnapshot().context.hasUnsavedFieldChanges).toBe(true);
	});

	it("cannot save draft when the form is clean", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "SAVE_DRAFT" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});
	});

	it("can save draft when the form is dirty and not published", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "FIELD_CHANGED" });
		actor.send({ type: "SAVE_DRAFT" });

		expect(actor.getSnapshot().value).toBe("savingDraft");
	});

	it("after draft save success, material becomes edit draft and clean", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "FIELD_CHANGED" });
		actor.send({ type: "SAVE_DRAFT" });

		actor.send({
			type: "DRAFT_SAVE_SUCCESS",
			materialId: 456,
		});

		const snapshot = actor.getSnapshot();

		expect(snapshot.value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});

		expect(snapshot.context.mode).toBe("edit");
		expect(snapshot.context.materialId).toBe(456);
		expect(snapshot.context.sectionStatus).toBe("DRAFT");
		expect(snapshot.context.hasUnsavedFieldChanges).toBe(false);
	});

	it("after draft save failure, material returns to dirty with an error", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "FIELD_CHANGED" });
		actor.send({ type: "SAVE_DRAFT" });

		actor.send({
			type: "DRAFT_SAVE_FAILURE",
			error: "Draft save failed",
		});

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "dirty",
			},
		});

		expect(actor.getSnapshot().context.error).toBe("Draft save failed");
	});
});

describe("TOEFL speaking form machine - publishing", () => {
	it("cannot publish an unsaved create-mode material, even if complete", () => {
		const actor = createFormActor();

		actor.send({ type: "LOAD_SUCCESS" });
		setAllComplete(actor);

		actor.send({ type: "PUBLISH" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});
	});

	it("cannot publish an incomplete draft", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "PUBLISH" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});
	});

	it("cannot publish a dirty draft, even if complete", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setAllComplete(actor);

		actor.send({ type: "FIELD_CHANGED" });
		actor.send({ type: "PUBLISH" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "dirty",
			},
		});
	});

	it("can publish only when saved, draft, clean, and complete", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setAllComplete(actor);

		actor.send({ type: "PUBLISH" });

		expect(actor.getSnapshot().value).toBe("publishing");
	});

	it("after publish success, material becomes published and clean", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setAllComplete(actor);

		actor.send({ type: "PUBLISH" });
		actor.send({ type: "PUBLISH_SUCCESS" });

		const snapshot = actor.getSnapshot();

		expect(snapshot.value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});

		expect(snapshot.context.sectionStatus).toBe("PUBLISHED");
		expect(snapshot.context.hasUnsavedFieldChanges).toBe(false);
	});

	it("after publish failure, material returns to idle with an error", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);
		setAllComplete(actor);

		actor.send({ type: "PUBLISH" });

		actor.send({
			type: "PUBLISH_FAILURE",
			error: "Publish failed",
		});

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});

		expect(actor.getSnapshot().context.error).toBe("Publish failed");
		expect(actor.getSnapshot().context.sectionStatus).toBe("DRAFT");
	});
});

describe("TOEFL speaking form machine - published editing", () => {
	it("cannot save published changes when the published material is incomplete", () => {
		const actor = createFormActor();

		loadExistingPublished(actor);

		actor.send({ type: "FIELD_CHANGED" });

		actor.send({
			type: "FORM_COMPLETION_CHANGED",
			materialInfoValid: true,
			hasPart1Image: false,
			part1QuestionsValid: true,
			part2QuestionsValid: true,
		});

		actor.send({ type: "SAVE_PUBLISHED_CHANGES" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "dirty",
			},
		});
	});

	it("can save published changes when dirty, published, edit mode, and complete", () => {
		const actor = createFormActor();

		loadExistingPublished(actor);
		actor.send({ type: "FIELD_CHANGED" });
		setAllComplete(actor);

		actor.send({ type: "SAVE_PUBLISHED_CHANGES" });

		expect(actor.getSnapshot().value).toBe("savingPublishedChanges");
	});

	it("after published save success, material is published and clean", () => {
		const actor = createFormActor();

		loadExistingPublished(actor);
		actor.send({ type: "FIELD_CHANGED" });
		setAllComplete(actor);

		actor.send({ type: "SAVE_PUBLISHED_CHANGES" });
		actor.send({ type: "PUBLISHED_SAVE_SUCCESS" });

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});

		expect(actor.getSnapshot().context.sectionStatus).toBe("PUBLISHED");
		expect(actor.getSnapshot().context.hasUnsavedFieldChanges).toBe(false);
	});
});

describe("TOEFL speaking form machine - revert", () => {
	it("can revert when dirty", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "FIELD_CHANGED" });
		actor.send({ type: "REVERT" });

		expect(actor.getSnapshot().value).toBe("reverting");
	});

	it("after revert success, material becomes clean and question indexes reset", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "NEXT_QUESTION" });
		actor.send({ type: "NEXT_PART2_QUESTION" });

		actor.send({ type: "FIELD_CHANGED" });
		actor.send({ type: "REVERT" });
		actor.send({ type: "REVERT_SUCCESS" });

		const snapshot = actor.getSnapshot();

		expect(snapshot.value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "clean",
			},
		});

		expect(snapshot.context.hasUnsavedFieldChanges).toBe(false);
		expect(snapshot.context.currentQuestion).toBe(0);
		expect(snapshot.context.currentPart2Question).toBe(0);
	});

	it("after revert failure, material returns to dirty with an error", () => {
		const actor = createFormActor();

		loadExistingDraft(actor);

		actor.send({ type: "FIELD_CHANGED" });
		actor.send({ type: "REVERT" });

		actor.send({
			type: "REVERT_FAILURE",
			error: "Revert failed",
		});

		expect(actor.getSnapshot().value).toEqual({
			idle: {
				step: "materialDetails",
				persistence: "dirty",
			},
		});

		expect(actor.getSnapshot().context.error).toBe("Revert failed");
	});
});
