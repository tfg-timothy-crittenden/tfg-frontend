import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function importCicTest() {
	// Load JSON files
	const part2 = JSON.parse(
		await fs.readFile(path.resolve("public/speaking_part2_CIC.json"), "utf8")
	);
	const part3 = JSON.parse(
		await fs.readFile(path.resolve("public/speaking_part3_CIC.json"), "utf8")
	);
	const part4 = JSON.parse(
		await fs.readFile(path.resolve("public/speaking_part4_CIC.json"), "utf8")
	);

	// Create SpeakingTask2
	const speakingTask2 = await prisma.speakingTask2.create({
		data: {
			id: part2[0].id,
			title: part2[0].title,
			readingTitle: part2[0].reading_title,
			readingBody: part2[0].reading_body,
			listeningAudio: part2[0].listening_audio,
			listeningScript: part2[0].listening_script,
			questionText: part2[0].question_text,
			questionAudio: part2[0].question_audio,
		},
	});

	// Create SpeakingTask3
	const speakingTask3 = await prisma.speakingTask3.create({
		data: {
			id: part3[0].id,
			title: part3[0].title,
			readingTitle: part3[0].reading_title,
			readingBody: part3[0].reading_body,
			listeningAudio: part3[0].listening_audio,
			listeningScript: part3[0].listening_script,
			questionText: part3[0].question_text,
			questionAudio: part3[0].question_audio,
		},
	});

	// Create SpeakingTask4
	const speakingTask4 = await prisma.speakingTask4.create({
		data: {
			id: part4[0].id,
			title: part4[0].title,
			readingTitle: part4[0].reading_title ?? "",
			listeningAudio: part4[0].listening_audio,
			listeningScript: part4[0].listening_script,
			questionText: part4[0].question_text,
			questionAudio: part4[0].question_audio,
		},
	});

	// Create Test and link tasks
	const test = await prisma.test.create({
		data: {
			id: "CIC_Speaking_Test",
			name: "CIC Speaking Test",
			part2Id: speakingTask2.id,
			part3Id: speakingTask3.id,
			part4Id: speakingTask4.id,
		},
	});

	console.log("Import complete:", test);
}

async function testReadCicFiles() {
	try {
		const part2 = JSON.parse(
			await fs.readFile(path.resolve("public/speaking_part2_CIC.json"), "utf8")
		);
		const part3 = JSON.parse(
			await fs.readFile(path.resolve("public/speaking_part3_CIC.json"), "utf8")
		);
		const part4 = JSON.parse(
			await fs.readFile(path.resolve("public/speaking_part4_CIC.json"), "utf8")
		);

		console.log("Part 2 sample:", part2[0]);
		console.log("Part 3 sample:", part3[0]);
		console.log("Part 4 sample:", part4[0]);

		if (!part2.length || !part3.length || !part4.length) {
			throw new Error(
				"One or more files are empty or not formatted as arrays."
			);
		}

		console.log("All files read successfully and contain data.");
	} catch (e) {
		console.error("Error reading or parsing files:", e);
		process.exit(1);
	}
}

// Choose function based on CLI argument
const mode = process.argv[2];

if (mode === "import") {
	importCicTest()
		.catch((e) => {
			console.error(e);
			process.exit(1);
		})
		.finally(() => prisma.$disconnect());
} else if (mode === "test") {
	testReadCicFiles();
} else {
	console.log("Usage: node importCICtests.js [import|test]");
}
