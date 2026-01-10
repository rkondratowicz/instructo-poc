import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const instructionsDir = path.join(__dirname, "..", "library", "instructions");
const catalogPath = path.join(__dirname, "..", "catalog.json");

// Prompt injection patterns to check for
const INJECTION_PATTERNS = [
	/ignore\s+(?:all\s+)?previous\s+instructions?/i,
	/forget\s+(?:all\s+)?previous\s+(?:instructions?|rules)/i,
	/system\s+prompt/i,
	/override\s+(?:the\s+)?system/i,
	/new\s+important\s+instruction/i,
	/bypass\s+(?:the\s+)?restriction/i,
	/jailbreak/i,
	/developer\s+mode/i,
	/admin\s+mode/i,
	/unrestricted/i,
	/uncensored/i,
	/DAN\s+mode/i, // Common jailbreak persona
	/assistant.*override/i,
];

// Function to check for prompt injection patterns
function checkPromptInjection(text) {
	const matches = [];
	for (const pattern of INJECTION_PATTERNS) {
		const match = text.match(pattern);
		if (match) {
			matches.push(match[0]);
		}
	}
	return matches;
}

// Function to validate instruction content
async function validateInstructionContent(instructionPath) {
	try {
		const content = fs.readFileSync(instructionPath, "utf8");
		const injectionMatches = checkPromptInjection(content);

		if (injectionMatches.length > 0) {
			return {
				valid: false,
				errors: [
					`Potential prompt injection patterns detected: ${injectionMatches.join(", ")}`,
				],
			};
		}

		return { valid: true };
	} catch (error) {
		return {
			valid: false,
			errors: [`Failed to read instruction file: ${error.message}`],
		};
	}
}

async function validateCatalog() {
	let isValid = true;
	const errors = [];

	// Check if catalog.json exists
	if (!fs.existsSync(catalogPath)) {
		errors.push("catalog.json does not exist");
		console.log("Validation failed:");
		errors.forEach((error) => {
			console.log(`- ${error}`);
		});
		return false;
	}

	// Read catalog.json
	let catalog;
	try {
		const catalogContent = fs.readFileSync(catalogPath, "utf8");
		catalog = JSON.parse(catalogContent);
	} catch (error) {
		errors.push(`Failed to parse catalog.json: ${error.message}`);
		console.log("Validation failed:");
		errors.forEach((error) => {
			console.log(`- ${error}`);
		});
		return false;
	}

	// Collect actual instruction files
	const actualInstructions = new Map();

	// Read all subdirectories in instructions
	const entries = fs.readdirSync(instructionsDir, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			const dirPath = path.join(instructionsDir, entry.name);
			const metaPath = path.join(dirPath, "_meta.json");

			if (fs.existsSync(metaPath)) {
				try {
					const metaContent = fs.readFileSync(metaPath, "utf8");
					const meta = JSON.parse(metaContent);

					// Remove $schema from meta for comparison
					const { $schema, ...cleanMeta } = meta;

					// Find the .instructions.md file
					const instructionFiles = fs
						.readdirSync(dirPath)
						.filter((file) => file.endsWith(".instructions.md"));
					const instructionFile =
						instructionFiles.length > 0 ? instructionFiles[0] : null;

					if (instructionFile) {
						const fullPath = path.relative(
							path.join(__dirname, ".."),
							path.join(dirPath, instructionFile),
						);
						const fullInstructionPath = path.join(dirPath, instructionFile);

						// Validate instruction content for prompt injection
						const contentValidation =
							await validateInstructionContent(fullInstructionPath);
						if (!contentValidation.valid) {
							contentValidation.errors.forEach((error) => {
								errors.push(`${entry.name}: ${error}`);
							});
							isValid = false;
						}

						actualInstructions.set(entry.name, {
							name: entry.name,
							path: fullPath,
							meta: cleanMeta,
						});
					}
				} catch (error) {
					errors.push(`Error processing ${entry.name}: ${error.message}`);
					isValid = false;
				}
			}
		}
	}

	// Check catalog entries against actual files
	const catalogNames = new Set();
	for (const instruction of catalog.prompts?.instructions || []) {
		catalogNames.add(instruction.name);

		const actual = actualInstructions.get(instruction.name);
		if (!actual) {
			errors.push(
				`Instruction "${instruction.name}" in catalog but not found in filesystem`,
			);
			isValid = false;
			continue;
		}

		// Check path
		if (instruction.path !== actual.path) {
			errors.push(
				`Path mismatch for "${instruction.name}": expected "${actual.path}", got "${instruction.path}"`,
			);
			isValid = false;
		}

		// Check meta
		if (JSON.stringify(instruction.meta) !== JSON.stringify(actual.meta)) {
			errors.push(`Meta mismatch for "${instruction.name}"`);
			isValid = false;
		}
	}

	// Check for missing entries in catalog
	for (const [name, _actual] of actualInstructions) {
		if (!catalogNames.has(name)) {
			errors.push(
				`Instruction "${name}" exists in filesystem but missing from catalog`,
			);
			isValid = false;
		}
	}

	// Check if catalog is sorted by name
	const sortedInstructions = [...(catalog.prompts?.instructions || [])].sort(
		(a, b) => a.name.localeCompare(b.name),
	);
	const isSorted =
		JSON.stringify(catalog.prompts?.instructions || []) ===
		JSON.stringify(sortedInstructions);
	if (!isSorted) {
		errors.push("Instructions in catalog are not sorted by name");
		isValid = false;
	}

	if (isValid) {
		console.log(
			"Validation passed: catalog.json matches the instruction files",
		);
		return true;
	} else {
		console.log("Validation failed:");
		errors.forEach((error) => {
			console.log(`- ${error}`);
		});
		return false;
	}
}

validateCatalog().catch(console.error);
