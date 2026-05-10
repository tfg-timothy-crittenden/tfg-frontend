import { useState } from "react";

const useSpeakingMaterialNavigation = (form) => {
	const questionCount = form?.questionCount ?? 1;
	const part2QuestionCount = form?.part2QuestionCount ?? 1;

	const [activePart, setActivePart] = useState(1);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [currentPart2Question, setCurrentPart2Question] = useState(0);
	const [step, setStep] = useState(0);

	const goPrev = () => setCurrentQuestion((q) => Math.max(0, q - 1));
	const goNext = () =>
		setCurrentQuestion((q) => Math.min(questionCount - 1, q + 1));
	const goPart2Prev = () => setCurrentPart2Question((q) => Math.max(0, q - 1));
	const goPart2Next = () =>
		setCurrentPart2Question((q) => Math.min(part2QuestionCount - 1, q + 1));
	const goToNextStep = () => setStep((s) => Math.min(2, s + 1));
	const goToPrevStep = () => setStep((s) => Math.max(0, s - 1));
	const goToStage = (targetStep) => {
		setActivePart(1);
		setStep(targetStep);
	};
	const goToPart2 = () => setActivePart(2);
	const goBackToPart1Questions = () => {
		setActivePart(1);
		setStep(2);
	};
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
