import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function importCicTest() {
	try {
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

		console.log(
			`📊 Importing ${Math.max(
				part2.length,
				part3.length,
				part4.length
			)} CIC tests...`
		);

		// Import individual tasks
		for (
			let i = 0;
			i < Math.max(part2.length, part3.length, part4.length);
			i++
		) {
			let task2Id = null,
				task3Id = null,
				task4Id = null;

			// Create Part 2 task
			if (part2[i]) {
				try {
					const task2 = await prisma.speakingTask2.create({
						data: {
							id: part2[i].id,
							title: part2[i].title,
							readingTitle: part2[i].reading_title,
							readingBody: part2[i].reading_body,
							listeningAudio: part2[i].listening_audio,
							listeningScript: part2[i].listening_script,
							questionText: part2[i].question_text,
							questionAudio: part2[i].question_audio,
						},
					});
					task2Id = task2.id;
					console.log(`✅ Created Part 2: ${task2.id}`);
				} catch (error) {
					if (error.code === "P2002") {
						console.log(`⚠️  Part 2 already exists: ${part2[i].id}`);
						task2Id = part2[i].id;
					} else {
						throw error;
					}
				}
			}

			// Create Part 3 task
			if (part3[i]) {
				try {
					const task3 = await prisma.speakingTask3.create({
						data: {
							id: part3[i].id,
							title: part3[i].title,
							readingTitle: part3[i].reading_title,
							readingBody: part3[i].reading_body,
							listeningAudio: part3[i].listening_audio,
							listeningScript: part3[i].listening_script,
							questionText: part3[i].question_text,
							questionAudio: part3[i].question_audio,
						},
					});
					task3Id = task3.id;
					console.log(`✅ Created Part 3: ${task3.id}`);
				} catch (error) {
					if (error.code === "P2002") {
						console.log(`⚠️  Part 3 already exists: ${part3[i].id}`);
						task3Id = part3[i].id;
					} else {
						throw error;
					}
				}
			}

			// Create Part 4 task
			if (part4[i]) {
				try {
					const task4 = await prisma.speakingTask4.create({
						data: {
							id: part4[i].id,
							title: part4[i].title,
							readingTitle: part4[i].reading_title ?? "",
							listeningAudio: part4[i].listening_audio,
							listeningScript: part4[i].listening_script,
							questionText: part4[i].question_text,
							questionAudio: part4[i].question_audio,
						},
					});
					task4Id = task4.id;
					console.log(`✅ Created Part 4: ${task4.id}`);
				} catch (error) {
					if (error.code === "P2002") {
						console.log(`⚠️  Part 4 already exists: ${part4[i].id}`);
						task4Id = part4[i].id;
					} else {
						throw error;
					}
				}
			}

			// Create Test if we have at least one task
			if (task2Id || task3Id || task4Id) {
				const testId = `CIC_Test_${i + 1}`;
				try {
					const test = await prisma.test.create({
						data: {
							id: testId,
							name: `CIC Speaking Test ${i + 1}`,
							part2Id: task2Id,
							part3Id: task3Id,
							part4Id: task4Id,
						},
					});
					console.log(`🎯 Created Test: ${test.id}`);
				} catch (error) {
					if (error.code === "P2002") {
						console.log(`⚠️  Test already exists: ${testId}`);
					} else {
						throw error;
					}
				}
			}
		}

		console.log("🎉 Import complete!");
	} catch (error) {
		console.error("❌ Import failed:", error);
		throw error;
	}
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
		console.log(
			`📊 Counts - Part 2: ${part2.length}, Part 3: ${part3.length}, Part 4: ${part4.length}`
		);

		if (!part2.length || !part3.length || !part4.length) {
			throw new Error(
				"One or more files are empty or not formatted as arrays."
			);
		}

		console.log("✅ All files read successfully and contain data.");
	} catch (e) {
		console.error("❌ Error reading or parsing files:", e);
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
