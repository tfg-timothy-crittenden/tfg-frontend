/**
 * toeflSpeakingFormMachine
 *
 * XState machine that manages the lifecycle of the TOEFL Speaking material form.
 *
 * --- LIFECYCLE ---
 * 1. Machine starts in `loading`. Send LOAD_SUCCESS (with materialId + sectionStatus
 *    when editing) or LOAD_FAILURE to transition to `idle` or `loadError`.
 * 2. In `loadError`, send RETRY to go back to `loading`.
 *
 * --- IDLE (PARALLEL STATES) ---
 * `idle` runs two parallel regions simultaneously:
 *
 *   step  — tracks which form step is active:
 *     materialDetails → part1Image → part1Questions → part2Questions
 *     Navigate with NEXT_STEP / PREVIOUS_STEP (NEXT_STEP requires guards to pass).
 *
 *   persistence  — tracks unsaved changes:
 *     clean → dirty (via FIELD_CHANGED)
 *     While dirty:
 *       SAVE_DRAFT             → `savingDraft`          (guard: canSaveDraft)
 *       SAVE_PUBLISHED_CHANGES → `savingPublishedChanges` (guard: canSavePublishedChanges)
 *       REVERT                 → `reverting`            (guard: canRevert)
 *
 * --- QUESTION NAVIGATION (from idle) ---
 *   NEXT_QUESTION / PREVIOUS_QUESTION       — cycles currentQuestion (0–6)
 *   NEXT_PART2_QUESTION / PREVIOUS_PART2_QUESTION — cycles currentPart2Question (0–3)
 *
 * --- ASYNC OPERATIONS ---
 * After triggering a save/publish/revert, the caller is responsible for performing
 * the async work and then sending the corresponding result event:
 *   savingDraft            → DRAFT_SAVE_SUCCESS (materialId required) | DRAFT_SAVE_FAILURE
 *   savingPublishedChanges → PUBLISHED_SAVE_SUCCESS | PUBLISHED_SAVE_FAILURE
 *   publishing             → PUBLISH_SUCCESS | PUBLISH_FAILURE
 *   reverting              → REVERT_SUCCESS | REVERT_FAILURE
 *
 * --- FORM COMPLETION ---
 * Send FORM_COMPLETION_CHANGED (with materialInfoValid, hasPart1Image,
 * part1QuestionsValid, part2QuestionsValid) whenever form validation state changes.
 * The machine uses these values to gate NEXT_STEP, PUBLISH, and save guards.
 *
 * --- PUBLISHING ---
 * PUBLISH is accepted from `idle` when canPublish guard passes
 * (mode=edit, sectionStatus=DRAFT, no unsaved changes, all sections valid).
 */
import { assign, setup } from "xstate";

type SectionStatus = "DRAFT" | "PUBLISHED" | null;

type FormContext = {
	mode: "create" | "edit";
	materialId: number | null;
	sectionStatus: SectionStatus;

	materialInfoValid: boolean;
	hasPart1Image: boolean;
	part1QuestionsValid: boolean;
	part2QuestionsValid: boolean;

	currentQuestion: number; // 0–6
	currentPart2Question: number; // 0–3

	hasUnsavedFieldChanges: boolean;
	error: string | null;
};

type FormEvent =
	| { type: "LOAD_SUCCESS"; materialId?: number; sectionStatus?: SectionStatus }
	| { type: "LOAD_FAILURE"; error?: string }
	| { type: "RETRY" }
	| {
			type: "FORM_COMPLETION_CHANGED";
			materialInfoValid: boolean;
			hasPart1Image: boolean;
			part1QuestionsValid: boolean;
			part2QuestionsValid: boolean;
	  }
	| { type: "NEXT_STEP" }
	| { type: "PREVIOUS_STEP" }
	| { type: "NEXT_QUESTION" }
	| { type: "PREVIOUS_QUESTION" }
	| { type: "NEXT_PART2_QUESTION" }
	| { type: "PREVIOUS_PART2_QUESTION" }
	| { type: "FIELD_CHANGED" }
	| { type: "SAVE_DRAFT" }
	| { type: "DRAFT_SAVE_SUCCESS"; materialId: number }
	| { type: "DRAFT_SAVE_FAILURE"; error?: string }
	| { type: "SAVE_PUBLISHED_CHANGES" }
	| { type: "PUBLISHED_SAVE_SUCCESS" }
	| { type: "PUBLISHED_SAVE_FAILURE"; error?: string }
	| { type: "PUBLISH" }
	| { type: "PUBLISH_SUCCESS" }
	| { type: "PUBLISH_FAILURE"; error?: string }
	| { type: "REVERT" }
	| { type: "REVERT_SUCCESS" }
	| { type: "REVERT_FAILURE"; error?: string };

export const toeflSpeakingFormMachine = setup({
	types: {
		context: {} as FormContext,
		events: {} as FormEvent,
	},

	actions: {
		markDirty: assign({
			hasUnsavedFieldChanges: true,
			error: null,
		}),

		updateCompletionStatus: assign({
			materialInfoValid: ({ event }) =>
				event.type === "FORM_COMPLETION_CHANGED"
					? event.materialInfoValid
					: false,

			hasPart1Image: ({ event }) =>
				event.type === "FORM_COMPLETION_CHANGED" ? event.hasPart1Image : false,

			part1QuestionsValid: ({ event }) =>
				event.type === "FORM_COMPLETION_CHANGED"
					? event.part1QuestionsValid
					: false,

			part2QuestionsValid: ({ event }) =>
				event.type === "FORM_COMPLETION_CHANGED"
					? event.part2QuestionsValid
					: false,
		}),

		loadSuccess: assign({
			mode: "edit",
			materialId: ({ event }) =>
				event.type === "LOAD_SUCCESS" ? (event.materialId ?? null) : null,
			sectionStatus: ({ event }) =>
				event.type === "LOAD_SUCCESS" ? (event.sectionStatus ?? null) : null,
			hasUnsavedFieldChanges: false,
			error: null,
		}),

		draftSaveSuccess: assign({
			mode: "edit",
			materialId: ({ event }) =>
				event.type === "DRAFT_SAVE_SUCCESS" ? event.materialId : null,
			sectionStatus: "DRAFT",
			hasUnsavedFieldChanges: false,
			error: null,
		}),

		publishedSaveSuccess: assign({
			sectionStatus: "PUBLISHED",
			hasUnsavedFieldChanges: false,
			error: null,
		}),

		publishSuccess: assign({
			mode: "edit",
			sectionStatus: "PUBLISHED",
			hasUnsavedFieldChanges: false,
			error: null,
		}),

		revertSuccess: assign({
			hasUnsavedFieldChanges: false,
			error: null,
			currentQuestion: 0,
			currentPart2Question: 0,
		}),

		setError: assign({
			error: ({ event }) =>
				"error" in event && event.error ? event.error : "Something went wrong",
		}),

		incrementCurrentQuestion: assign({
			currentQuestion: ({ context }) => context.currentQuestion + 1,
		}),

		decrementCurrentQuestion: assign({
			currentQuestion: ({ context }) => context.currentQuestion - 1,
		}),

		incrementCurrentPart2Question: assign({
			currentPart2Question: ({ context }) => context.currentPart2Question + 1,
		}),

		decrementCurrentPart2Question: assign({
			currentPart2Question: ({ context }) => context.currentPart2Question - 1,
		}),

		resetQuestionIndexes: assign({
			currentQuestion: 0,
			currentPart2Question: 0,
		}),
	},

	guards: {
		canProceedToImage: ({ context }) => {
			return context.materialInfoValid === true;
		},

		canProceedToPart1Questions: ({ context }) => {
			return context.hasPart1Image === true;
		},

		canProceedToPart2Questions: ({ context }) => {
			return context.part1QuestionsValid === true;
		},

		canGoToNextQuestion: ({ context }) => {
			return context.currentQuestion < 6;
		},

		canGoToPreviousQuestion: ({ context }) => {
			return context.currentQuestion > 0;
		},

		canGoToNextPart2Question: ({ context }) => {
			return context.currentPart2Question < 3;
		},

		canGoToPreviousPart2Question: ({ context }) => {
			return context.currentPart2Question > 0;
		},

		canSaveDraft: ({ context }) => {
			return (
				context.hasUnsavedFieldChanges === true &&
				context.sectionStatus !== "PUBLISHED"
			);
		},

		canSavePublishedChanges: ({ context }) => {
			return (
				context.hasUnsavedFieldChanges === true &&
				context.mode === "edit" &&
				context.materialId !== null &&
				context.sectionStatus === "PUBLISHED" &&
				context.materialInfoValid === true &&
				context.hasPart1Image === true &&
				context.part1QuestionsValid === true &&
				context.part2QuestionsValid === true
			);
		},

		canRevert: ({ context }) => {
			return context.hasUnsavedFieldChanges === true;
		},

		canPublish: ({ context }) => {
			return (
				context.mode === "edit" &&
				context.materialId !== null &&
				context.sectionStatus === "DRAFT" &&
				context.hasUnsavedFieldChanges === false &&
				context.materialInfoValid === true &&
				context.hasPart1Image === true &&
				context.part1QuestionsValid === true &&
				context.part2QuestionsValid === true
			);
		},
	},
}).createMachine({
	id: "Form",

	context: {
		mode: "create",
		materialId: null,
		sectionStatus: null,

		materialInfoValid: false,
		hasPart1Image: false,
		part1QuestionsValid: false,
		part2QuestionsValid: false,

		currentQuestion: 0,
		currentPart2Question: 0,

		hasUnsavedFieldChanges: false,
		error: null,
	},

	initial: "loading",

	states: {
		loading: {
			on: {
				LOAD_SUCCESS: {
					target: "idle",
					actions: {
						type: "loadSuccess",
					},
				},

				LOAD_FAILURE: {
					target: "loadError",
					actions: {
						type: "setError",
					},
				},
			},
		},

		loadError: {
			on: {
				RETRY: {
					target: "loading",
				},
			},
		},

		idle: {
			type: "parallel",

			on: {
				FORM_COMPLETION_CHANGED: {
					actions: {
						type: "updateCompletionStatus",
					},
				},

				PUBLISH: {
					target: "publishing",
					guard: {
						type: "canPublish",
					},
				},

				NEXT_QUESTION: {
					guard: {
						type: "canGoToNextQuestion",
					},
					actions: {
						type: "incrementCurrentQuestion",
					},
				},

				PREVIOUS_QUESTION: {
					guard: {
						type: "canGoToPreviousQuestion",
					},
					actions: {
						type: "decrementCurrentQuestion",
					},
				},

				NEXT_PART2_QUESTION: {
					guard: {
						type: "canGoToNextPart2Question",
					},
					actions: {
						type: "incrementCurrentPart2Question",
					},
				},

				PREVIOUS_PART2_QUESTION: {
					guard: {
						type: "canGoToPreviousPart2Question",
					},
					actions: {
						type: "decrementCurrentPart2Question",
					},
				},
			},

			states: {
				step: {
					initial: "materialDetails",

					states: {
						materialDetails: {
							on: {
								NEXT_STEP: {
									target: "part1Image",
									guard: {
										type: "canProceedToImage",
									},
								},
							},
						},

						part1Image: {
							on: {
								NEXT_STEP: {
									target: "part1Questions",
									guard: {
										type: "canProceedToPart1Questions",
									},
								},

								PREVIOUS_STEP: {
									target: "materialDetails",
								},
							},
						},

						part1Questions: {
							on: {
								NEXT_STEP: {
									target: "part2Questions",
									guard: {
										type: "canProceedToPart2Questions",
									},
								},

								PREVIOUS_STEP: {
									target: "part1Image",
								},
							},
						},

						part2Questions: {
							on: {
								PREVIOUS_STEP: {
									target: "part1Questions",
								},
							},
						},
					},
				},

				persistence: {
					initial: "clean",

					states: {
						clean: {
							on: {
								FIELD_CHANGED: {
									target: "dirty",
									actions: {
										type: "markDirty",
									},
								},
							},
						},

						dirty: {
							on: {
								SAVE_DRAFT: {
									target: "#Form.savingDraft",
									guard: {
										type: "canSaveDraft",
									},
								},

								SAVE_PUBLISHED_CHANGES: {
									target: "#Form.savingPublishedChanges",
									guard: {
										type: "canSavePublishedChanges",
									},
								},

								REVERT: {
									target: "#Form.reverting",
									guard: {
										type: "canRevert",
									},
								},
							},
						},
					},
				},
			},
		},

		savingDraft: {
			on: {
				DRAFT_SAVE_SUCCESS: {
					target: "#Form.idle.persistence.clean",
					actions: {
						type: "draftSaveSuccess",
					},
				},

				DRAFT_SAVE_FAILURE: {
					target: "#Form.idle.persistence.dirty",
					actions: {
						type: "setError",
					},
				},
			},
		},

		savingPublishedChanges: {
			on: {
				PUBLISHED_SAVE_SUCCESS: {
					target: "#Form.idle.persistence.clean",
					actions: {
						type: "publishedSaveSuccess",
					},
				},

				PUBLISHED_SAVE_FAILURE: {
					target: "#Form.idle.persistence.dirty",
					actions: {
						type: "setError",
					},
				},
			},
		},

		publishing: {
			on: {
				PUBLISH_SUCCESS: {
					target: "#Form.idle.persistence.clean",
					actions: {
						type: "publishSuccess",
					},
				},

				PUBLISH_FAILURE: {
					target: "idle",
					actions: {
						type: "setError",
					},
				},
			},
		},

		reverting: {
			on: {
				REVERT_SUCCESS: {
					target: "#Form.idle.persistence.clean",
					actions: {
						type: "revertSuccess",
					},
				},

				REVERT_FAILURE: {
					target: "#Form.idle.persistence.dirty",
					actions: {
						type: "setError",
					},
				},
			},
		},
	},
});
