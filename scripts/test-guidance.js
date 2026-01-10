import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const catalogPath = path.join(__dirname, "..", "catalog.json");

// Test function to demonstrate guidance usage
function testGuidance() {
	const catalogContent = fs.readFileSync(catalogPath, "utf8");
	const catalog = JSON.parse(catalogContent);

	console.log("=== Agent Guidance Test ===\n");

	console.log("Available Instructions:");
	catalog.instructions.forEach((inst) => {
		console.log(
			`- ${inst.name}: ${inst.meta.description} (tags: ${inst.meta.tags.join(", ")})`,
		);
	});

	console.log("\n=== Testing Query Matching ===");

	const testQueries = [
		"I need to install a new npm package",
		"How should I structure my React component?",
		"I want to set up a JavaScript project with dependencies",
	];

	testQueries.forEach((query) => {
		console.log(`\nQuery: "${query}"`);

		// Simple matching logic using guidance
		const guidance = catalog.agentGuidance;
		const matchingInstructions = [];

		// Check against matching examples
		const example = guidance.matchingExamples.find((ex) =>
			ex.userQuery
				.toLowerCase()
				.includes(query.toLowerCase().split(" ").slice(0, 3).join(" ")),
		);
		if (example) {
			matchingInstructions.push(...example.matchingInstructions);
			console.log(
				`Match found in examples: ${example.matchingInstructions.join(", ")}`,
			);
			console.log(`Reasoning: ${example.reasoning}`);
		}

		// Check keywords
		const keywords = query.toLowerCase().split(" ");
		catalog.instructions.forEach((inst) => {
			const hasMatchingTag = inst.meta.tags.some((tag) =>
				keywords.includes(tag),
			);
			const hasMatchingName = keywords.includes(inst.name);
			if (hasMatchingTag || hasMatchingName) {
				if (!matchingInstructions.includes(inst.name)) {
					matchingInstructions.push(inst.name);
					console.log(
						`Tag/Name match: ${inst.name} (${inst.meta.tags.join(", ")})`,
					);
				}
			}
		});

		if (matchingInstructions.length === 0) {
			console.log("No direct matches found. Consider fallback strategies.");
		}
	});

	console.log("\n=== Guidance Summary ===");
	console.log(`Total instructions: ${catalog.instructions.length}`);
	console.log(
		`Guidance sections: ${Object.keys(catalog.agentGuidance).length}`,
	);
	console.log(
		"Agent can now make informed decisions about which instructions to apply!",
	);
}

testGuidance();
