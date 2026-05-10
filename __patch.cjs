const fs = require("fs");
const path =
	"d:/programming-projects/toefl-2-app/toefl-2/src/views/CreateSpeakingMaterial/CreateSpeakingMaterial.jsx";
let content = fs.readFileSync(path, "utf8");

// Add import
if (!content.includes("ImageDropzone")) {
	content = content.replace(
		'import DrawEditor from "./ImageEditor/DrawEditor";',
		'import DrawEditor from "./ImageEditor/DrawEditor";\r\nimport ImageDropzone from "./ImageDropzone";',
	);
	console.log("import added");
}

// Replace lines 432-454 (0-indexed: 431 to 453) with ImageDropzone component
const lines = content.split("\n");

const newLines = [
	"\t\t\t\t\t\t\t\t<ImageDropzone\r",
	'\t\t\t\t\t\t\t\t\tid="image"\r',
	'\t\t\t\t\t\t\t\t\tregistration={register("image", { required: true })}\r',
	"\t\t\t\t\t\t\t\t\tselectedFile={selectedImage}\r",
	"\t\t\t\t\t\t\t\t\tariaInvalid={!!errors.image}\r",
	"\t\t\t\t\t\t\t\t/>\r",
	"\t\t\t\t\t\t\t\t{errors.image && (\r",
	"\t\t\t\t\t\t\t\t\t<span className={styles.error}>Image is required</span>\r",
	"\t\t\t\t\t\t\t\t)}\r",
];

lines.splice(431, 453 - 431 + 1, ...newLines);
fs.writeFileSync(path, lines.join("\n"), "utf8");
console.log("Done");
