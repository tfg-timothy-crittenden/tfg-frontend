import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useToeflSpeakingFormController } from "./useToeflSpeakingFormController";

// ─── helpers ─────────────────────────────────────────────────────────────────

const mockAudioFile = new File(["audio"], "q.mp3", { type: "audio/mpeg" });
const mockImageFile = new File(["img"], "image.png", { type: "image/png" });

function completeAllFields(
	result: ReturnType<typeof useToeflSpeakingFormController>,
) {
	act(() => {
		result.form.setValue("title", "My material", { shouldDirty: true });
		result.form.setValue("part1Image", mockImageFile, { shouldDirty: true });

		for (let i = 0; i < 7; i++) {
			result.form.setValue(
				`part1Questions.${i}.transcript`,
				`Transcript ${i}`,
				{
					shouldDirty: true,
				},
			);
			result.form.setValue(`part1Questions.${i}.audio`, mockAudioFile, {
				shouldDirty: true,
			});
		}

		for (let i = 0; i < 4; i++) {
			result.form.setValue(
				`part2Questions.${i}.transcript`,
				`Part 2 transcript ${i}`,
				{ shouldDirty: true },
			);
			result.form.setValue(`part2Questions.${i}.audio`, mockAudioFile, {
				shouldDirty: true,
			});
		}
	});
}

// ─── initial state ────────────────────────────────────────────────────────────

describe("useToeflSpeakingFormController — initial state", () => {
	it("exposes the form", () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());
		expect(result.current.form).toBeDefined();
	});

	it("sends LOAD_SUCCESS on mount (mock)", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() => {
			expect(result.current.state.matches("idle")).toBe(true);
		});

		expect(result.current.context.materialId).toBe(123);
		expect(result.current.context.sectionStatus).toBe("DRAFT");
	});

	it("starts at materialDetails step", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() => expect(result.current.isMaterialDetails).toBe(true));

		expect(result.current.isPart1Image).toBe(false);
		expect(result.current.isPart1Questions).toBe(false);
		expect(result.current.isPart2Questions).toBe(false);
	});
});

// ─── dirty state wiring ───────────────────────────────────────────────────────

describe("useToeflSpeakingFormController — dirty state", () => {
	it("machine stays clean when form is untouched", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		expect(
			result.current.state.matches({ idle: { persistence: "clean" } }),
		).toBe(true);
	});

	it("machine transitions to dirty when a field changes", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			result.current.form.setValue("title", "Hello", { shouldDirty: true });
		});

		await waitFor(() =>
			expect(
				result.current.state.matches({ idle: { persistence: "dirty" } }),
			).toBe(true),
		);
	});

	it("Save Draft is enabled when the form is dirty and sectionStatus is DRAFT", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			result.current.form.setValue("title", "Hello", { shouldDirty: true });
		});

		await waitFor(() =>
			expect(result.current.state.can({ type: "SAVE_DRAFT" })).toBe(true),
		);
	});
});

// ─── completion wiring ────────────────────────────────────────────────────────

describe("useToeflSpeakingFormController — form completion", () => {
	it("step navigation is blocked until materialInfoValid is true", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => result.current.nextStep());

		expect(result.current.isMaterialDetails).toBe(true);
	});

	it("can advance to Part 1 Image once title is filled", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			result.current.form.setValue("title", "My material", {
				shouldDirty: true,
			});
		});

		await waitFor(() =>
			expect(result.current.state.can({ type: "NEXT_STEP" })).toBe(true),
		);

		act(() => result.current.nextStep());

		await waitFor(() => expect(result.current.isPart1Image).toBe(true));
	});

	it("cannot advance past Part 1 Image until an image is set", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			result.current.form.setValue("title", "My material", {
				shouldDirty: true,
			});
		});

		await waitFor(() =>
			expect(result.current.state.can({ type: "NEXT_STEP" })).toBe(true),
		);

		act(() => result.current.nextStep());
		await waitFor(() => expect(result.current.isPart1Image).toBe(true));

		// image not set — should not advance
		act(() => result.current.nextStep());
		await waitFor(() => expect(result.current.isPart1Image).toBe(true));
	});

	it("can advance to Part 1 Questions once image is set", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			result.current.form.setValue("title", "My material", {
				shouldDirty: true,
			});
			result.current.form.setValue("part1Image", mockImageFile, {
				shouldDirty: true,
			});
		});

		await waitFor(() =>
			expect(result.current.state.can({ type: "NEXT_STEP" })).toBe(true),
		);

		act(() => result.current.nextStep()); // → part1Image
		await waitFor(() => expect(result.current.isPart1Image).toBe(true));

		act(() => result.current.nextStep()); // → part1Questions
		await waitFor(() => expect(result.current.isPart1Questions).toBe(true));
	});
});

// ─── question navigation ──────────────────────────────────────────────────────

describe("useToeflSpeakingFormController — question navigation", () => {
	it("starts at part 1 question 0", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		expect(result.current.context.currentQuestion).toBe(0);
	});

	it("increments part 1 question index", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => result.current.nextQuestion());

		expect(result.current.context.currentQuestion).toBe(1);
	});

	it("clamps part 1 question at 6", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			for (let i = 0; i < 20; i++) result.current.nextQuestion();
		});

		expect(result.current.context.currentQuestion).toBe(6);
	});

	it("cannot go back before question 0", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => result.current.previousQuestion());

		expect(result.current.context.currentQuestion).toBe(0);
	});

	it("increments part 2 question index", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => result.current.nextPart2Question());

		expect(result.current.context.currentPart2Question).toBe(1);
	});

	it("clamps part 2 question at 3", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			for (let i = 0; i < 20; i++) result.current.nextPart2Question();
		});

		expect(result.current.context.currentPart2Question).toBe(3);
	});
});

// ─── save draft ───────────────────────────────────────────────────────────────

describe("useToeflSpeakingFormController — saveDraft", () => {
	it("is a no-op when the form is clean", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		await act(() => result.current.saveDraft());

		expect(
			result.current.state.matches({ idle: { persistence: "clean" } }),
		).toBe(true);
	});

	it("transitions to savingDraft then back to clean on success", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			result.current.form.setValue("title", "My material", {
				shouldDirty: true,
			});
		});

		await waitFor(() =>
			expect(result.current.state.can({ type: "SAVE_DRAFT" })).toBe(true),
		);

		await act(() => result.current.saveDraft());

		await waitFor(() =>
			expect(
				result.current.state.matches({ idle: { persistence: "clean" } }),
			).toBe(true),
		);

		expect(result.current.context.sectionStatus).toBe("DRAFT");
		expect(result.current.context.materialId).toBe(123);
	});

	it("resets the RHF dirty baseline after a successful draft save", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			result.current.form.setValue("title", "My material", {
				shouldDirty: true,
			});
		});

		await waitFor(() =>
			expect(result.current.form.formState.isDirty).toBe(true),
		);

		await act(() => result.current.saveDraft());

		await waitFor(() =>
			expect(result.current.form.formState.isDirty).toBe(false),
		);
	});
});

// ─── publish ──────────────────────────────────────────────────────────────────

describe("useToeflSpeakingFormController — publish", () => {
	it("is a no-op when the form is dirty", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => {
			result.current.form.setValue("title", "My material", {
				shouldDirty: true,
			});
		});

		await waitFor(() =>
			expect(
				result.current.state.matches({ idle: { persistence: "dirty" } }),
			).toBe(true),
		);

		await act(() => result.current.publish());

		// should still be in idle, not publishing
		expect(result.current.state.matches("idle")).toBe(true);
	});

	it("is a no-op when the form is incomplete even if clean", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		// form is clean but not complete
		await act(() => result.current.publish());

		expect(result.current.state.matches("idle")).toBe(true);
	});

	it("transitions to publishing then sets sectionStatus PUBLISHED on success", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		// fill and save to reach clean + complete state
		completeAllFields(result.current);

		await waitFor(() =>
			expect(result.current.state.can({ type: "SAVE_DRAFT" })).toBe(true),
		);

		await act(() => result.current.saveDraft());

		await waitFor(() =>
			expect(
				result.current.state.matches({ idle: { persistence: "clean" } }),
			).toBe(true),
		);

		await act(() => result.current.publish());

		await waitFor(() =>
			expect(result.current.context.sectionStatus).toBe("PUBLISHED"),
		);
	});
});

// ─── revert ───────────────────────────────────────────────────────────────────

describe("useToeflSpeakingFormController — revert", () => {
	it("is a no-op when the form is clean", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		act(() => result.current.revert());

		expect(
			result.current.state.matches({ idle: { persistence: "clean" } }),
		).toBe(true);
	});

	it("resets form values to last saved state", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		// save a known state
		act(() => {
			result.current.form.setValue("title", "Saved title", {
				shouldDirty: true,
			});
		});

		await act(() => result.current.saveDraft());

		await waitFor(() =>
			expect(result.current.form.formState.isDirty).toBe(false),
		);

		// now make a new unsaved change
		act(() => {
			result.current.form.setValue("title", "Unsaved change", {
				shouldDirty: true,
			});
		});

		await waitFor(() =>
			expect(result.current.state.can({ type: "REVERT" })).toBe(true),
		);

		act(() => result.current.revert());

		await waitFor(() =>
			expect(result.current.form.getValues("title")).toBe("Saved title"),
		);

		expect(
			result.current.state.matches({ idle: { persistence: "clean" } }),
		).toBe(true);
	});
});

// ─── Save Changes (published) ─────────────────────────────────────────────────

describe("useToeflSpeakingFormController — savePublishedChanges", () => {
	it("is a no-op when sectionStatus is DRAFT", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		completeAllFields(result.current);

		await waitFor(() =>
			expect(result.current.state.can({ type: "SAVE_DRAFT" })).toBe(true),
		);

		await act(() => result.current.savePublishedChanges());

		// SAVE_PUBLISHED_CHANGES guard requires sectionStatus === PUBLISHED
		expect(result.current.state.matches("savingPublishedChanges")).toBe(false);
	});

	it("transitions to savingPublishedChanges then clean when published, dirty, and complete", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		// Reach published state: fill → save draft → publish
		completeAllFields(result.current);

		await waitFor(() =>
			expect(result.current.state.can({ type: "SAVE_DRAFT" })).toBe(true),
		);

		await act(() => result.current.saveDraft());

		await waitFor(() =>
			expect(
				result.current.state.matches({ idle: { persistence: "clean" } }),
			).toBe(true),
		);

		await act(() => result.current.publish());

		await waitFor(() =>
			expect(result.current.context.sectionStatus).toBe("PUBLISHED"),
		);

		// Now make a change and save published changes
		act(() => {
			result.current.form.setValue("title", "Updated title", {
				shouldDirty: true,
			});
		});

		await waitFor(() =>
			expect(result.current.state.can({ type: "SAVE_PUBLISHED_CHANGES" })).toBe(
				true,
			),
		);

		await act(() => result.current.savePublishedChanges());

		await waitFor(() =>
			expect(
				result.current.state.matches({ idle: { persistence: "clean" } }),
			).toBe(true),
		);

		expect(result.current.context.sectionStatus).toBe("PUBLISHED");
	});

	it("resets RHF dirty baseline after saving published changes", async () => {
		const { result } = renderHook(() => useToeflSpeakingFormController());

		await waitFor(() =>
			expect(result.current.state.matches("idle")).toBe(true),
		);

		completeAllFields(result.current);

		await waitFor(() =>
			expect(result.current.state.can({ type: "SAVE_DRAFT" })).toBe(true),
		);
		await act(() => result.current.saveDraft());
		await waitFor(() =>
			expect(
				result.current.state.matches({ idle: { persistence: "clean" } }),
			).toBe(true),
		);
		await act(() => result.current.publish());
		await waitFor(() =>
			expect(result.current.context.sectionStatus).toBe("PUBLISHED"),
		);

		act(() => {
			result.current.form.setValue("title", "Updated", { shouldDirty: true });
		});

		await waitFor(() =>
			expect(result.current.form.formState.isDirty).toBe(true),
		);

		await act(() => result.current.savePublishedChanges());

		await waitFor(() =>
			expect(result.current.form.formState.isDirty).toBe(false),
		);
	});
});
