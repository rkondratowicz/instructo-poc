import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const instructionsDir = path.join(__dirname, "..", "library", "instructions");
const promptsDir = path.join(__dirname, "..", "library", "prompts");
const catalogPath = path.join(__dirname, "..", "catalog.json");
const schemaPath = path.join(
  __dirname,
  "..",
  "schemas",
  "instruction-meta.schema.json",
);

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

// Function to validate content
async function validateContent(contentPath) {
  try {
    const content = fs.readFileSync(contentPath, "utf8");
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
      errors: [`Failed to read content file: ${error.message}`],
    };
  }
}

function collectResources(dirPath, fileExtension, typeName, validateMeta, ajv) {
  const resources = new Map();

  if (!fs.existsSync(dirPath)) {
    return resources;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const resourceDir = path.join(dirPath, entry.name);
      const metaPath = path.join(resourceDir, "_meta.json");

      if (fs.existsSync(metaPath)) {
        try {
          const metaContent = fs.readFileSync(metaPath, "utf8");
          const meta = JSON.parse(metaContent);

          // Validate meta against schema
          if (!validateMeta(meta)) {
            throw new Error(
              `Schema validation failed: ${ajv.errorsText(validateMeta.errors)}`,
            );
          }

          // Remove $schema and author from meta for comparison
          const { $schema, author, ...cleanMeta } = meta;

          // Find the resource file
          const resourceFiles = fs
            .readdirSync(resourceDir)
            .filter((file) => file.endsWith(fileExtension));
          const resourceFile =
            resourceFiles.length > 0 ? resourceFiles[0] : null;

          if (resourceFile) {
            const fullPath = path.relative(
              path.join(__dirname, ".."),
              path.join(resourceDir, resourceFile),
            );
            const fullResourcePath = path.join(resourceDir, resourceFile);

            resources.set(entry.name, {
              name: entry.name,
              path: fullPath,
              meta: cleanMeta,
              fullPath: fullResourcePath,
            });
          }
        } catch (error) {
          throw new Error(
            `Error processing ${typeName} ${entry.name}: ${error.message}`,
          );
        }
      }
    }
  }

  return resources;
}

async function validateCatalog() {
  let isValid = true;
  const errors = [];

  // Load JSON schema
  let ajv;
  let validateMeta;
  try {
    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    const schema = JSON.parse(schemaContent);
    ajv = new Ajv();
    validateMeta = ajv.compile(schema);
  } catch (error) {
    errors.push(`Failed to load schema: ${error.message}`);
    console.log("Validation failed:");
    errors.forEach((error) => {
      console.log(`- ${error}`);
    });
    return false;
  }

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

  // Collect actual resource files
  let actualInstructions = new Map();
  let actualPrompts = new Map();
  try {
    actualInstructions = collectResources(
      instructionsDir,
      ".instructions.md",
      "instruction",
      validateMeta,
      ajv,
    );
    actualPrompts = collectResources(
      promptsDir,
      ".prompts.md",
      "prompt",
      validateMeta,
      ajv,
    );
  } catch (error) {
    errors.push(error.message);
    isValid = false;
  }

  // Validate content for injection patterns
  for (const [name, resource] of actualInstructions) {
    const contentValidation = await validateContent(resource.fullPath);
    if (!contentValidation.valid) {
      contentValidation.errors.forEach((error) => {
        errors.push(`Instruction ${name}: ${error}`);
      });
      isValid = false;
    }
  }

  for (const [name, resource] of actualPrompts) {
    const contentValidation = await validateContent(resource.fullPath);
    if (!contentValidation.valid) {
      contentValidation.errors.forEach((error) => {
        errors.push(`Prompt ${name}: ${error}`);
      });
      isValid = false;
    }
  }

  // Check catalog entries against actual files
  const catalogInstructionNames = new Set();
  for (const instruction of catalog.prompts?.instructions || []) {
    catalogInstructionNames.add(instruction.name);

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

  const catalogPromptNames = new Set();
  for (const prompt of catalog.prompts?.prompts || []) {
    catalogPromptNames.add(prompt.name);

    const actual = actualPrompts.get(prompt.name);
    if (!actual) {
      errors.push(
        `Prompt "${prompt.name}" in catalog but not found in filesystem`,
      );
      isValid = false;
      continue;
    }

    // Check path
    if (prompt.path !== actual.path) {
      errors.push(
        `Path mismatch for "${prompt.name}": expected "${actual.path}", got "${prompt.path}"`,
      );
      isValid = false;
    }

    // Check meta
    if (JSON.stringify(prompt.meta) !== JSON.stringify(actual.meta)) {
      errors.push(`Meta mismatch for "${prompt.name}"`);
      isValid = false;
    }
  }

  // Check for missing entries in catalog
  for (const [name, _actual] of actualInstructions) {
    if (!catalogInstructionNames.has(name)) {
      errors.push(
        `Instruction "${name}" exists in filesystem but missing from catalog`,
      );
      isValid = false;
    }
  }

  for (const [name, _actual] of actualPrompts) {
    if (!catalogPromptNames.has(name)) {
      errors.push(
        `Prompt "${name}" exists in filesystem but missing from catalog`,
      );
      isValid = false;
    }
  }

  // Check if catalog is sorted by name
  const sortedInstructions = [...(catalog.prompts?.instructions || [])].sort(
    (a, b) => a.name.localeCompare(b.name),
  );
  const isInstructionsSorted =
    JSON.stringify(catalog.prompts?.instructions || []) ===
    JSON.stringify(sortedInstructions);
  if (!isInstructionsSorted) {
    errors.push("Instructions in catalog are not sorted by name");
    isValid = false;
  }

  const sortedPrompts = [...(catalog.prompts?.prompts || [])].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const isPromptsSorted =
    JSON.stringify(catalog.prompts?.prompts || []) ===
    JSON.stringify(sortedPrompts);
  if (!isPromptsSorted) {
    errors.push("Prompts in catalog are not sorted by name");
    isValid = false;
  }

  if (isValid) {
    console.log("Validation passed: catalog.json matches the library files");
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
