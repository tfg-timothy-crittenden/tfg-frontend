import { useSearchParams } from "react-router-dom";

// URL param names used to persist navigation state across saves / refreshes.
const PARAM = {
	part: "part",
	step: "step",
	q: "q",
	p2q: "p2q",
};

const DEFAULTS = { part: 1, step: 0, q: 0, p2q: 0 };

const getNum = (searchParams, key) => {
	const raw = searchParams.get(key);
	const n = raw !== null ? Number(raw) : NaN;
	return Number.isFinite(n) ? n : DEFAULTS[key];
};

const useSpeakingMaterialNavigation = (form) => {
	const questionCount = form?.questionCount ?? 1;
	const part2QuestionCount = form?.part2QuestionCount ?? 1;

	const [searchParams, setSearchParams] = useSearchParams();

	const activePart = getNum(searchParams, PARAM.part);
	const currentQuestion = getNum(searchParams, PARAM.q);
	const currentPart2Question = getNum(searchParams, PARAM.p2q);
	const step = getNum(searchParams, PARAM.step);

	// Apply one or more param updates in a single history replace so the browser
	// back-button is not cluttered with every step change.
	const updateParams = (updates) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				for (const [key, val] of Object.entries(updates)) {
					const current = getNum(prev, key);
					next.set(key, String(typeof val === "function" ? val(current) : val));
				}
				return next;
			},
			{ replace: true },
		);
	};

	const setActivePart = (v) => updateParams({ [PARAM.part]: v });
	const setCurrentQuestion = (v) => updateParams({ [PARAM.q]: v });
	const setCurrentPart2Question = (v) => updateParams({ [PARAM.p2q]: v });
	const setStep = (v) => updateParams({ [PARAM.step]: v });

	// Reset all navigation params to their defaults in a single URL update.
	const resetNavigation = () =>
		updateParams({
			[PARAM.part]: 1,
			[PARAM.step]: 0,
			[PARAM.q]: 0,
			[PARAM.p2q]: 0,
		});

	const goPrev = () => updateParams({ [PARAM.q]: (q) => Math.max(0, q - 1) });
	const goNext = () =>
		updateParams({ [PARAM.q]: (q) => Math.min(questionCount - 1, q + 1) });
	const goPart2Prev = () =>
		updateParams({ [PARAM.p2q]: (q) => Math.max(0, q - 1) });
	const goPart2Next = () =>
		updateParams({
			[PARAM.p2q]: (q) => Math.min(part2QuestionCount - 1, q + 1),
		});
	const goToNextStep = () =>
		updateParams({ [PARAM.step]: (s) => Math.min(2, s + 1) });
	const goToPrevStep = () =>
		updateParams({ [PARAM.step]: (s) => Math.max(0, s - 1) });
	const goToStage = (targetStep) =>
		updateParams({ [PARAM.part]: 1, [PARAM.step]: targetStep });
	const goToPart2 = () => updateParams({ [PARAM.part]: 2 });
	const goBackToPart1Questions = () =>
		updateParams({ [PARAM.part]: 1, [PARAM.step]: 2 });

	const isMaterialDetails = activePart === 1 && step === 0;
	const isPart1Image = activePart === 1 && step === 1;
	const isPart1Questions = activePart === 1 && step === 2;
	const isPart2Questions = activePart === 2;

	return {
		activePart,
		setActivePart,
		currentQuestion,
		setCurrentQuestion,
		currentPart2Question,
		setCurrentPart2Question,
		step,
		setStep,
		resetNavigation,
		goPrev,
		goNext,
		goPart2Prev,
		goPart2Next,
		goToNextStep,
		goToPrevStep,
		goToStage,
		goToPart2,
		goBackToPart1Questions,
		isMaterialDetails,
		isPart1Image,
		isPart1Questions,
		isPart2Questions,
	};
};

export default useSpeakingMaterialNavigation;
