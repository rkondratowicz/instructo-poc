import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const libraryDir = path.join(__dirname, "..", "library");
const instructionsDir = path.join(libraryDir, "instructions");
const promptsDir = path.join(libraryDir, "prompts");
const skillsDir = path.join(libraryDir, "skills");
const guidancePath = path.join(libraryDir, "agent-guidance.json");
const catalogPath = path.join(__dirname, "..", "catalog.json");

function readResourceType(dirPath, fileExtension, typeName) {
  const resources = [];

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

          // Remove $schema from meta
          const { $schema, ...cleanMeta } = meta;

          // Find the resource file
          const resourceFiles = fs
            .readdirSync(resourceDir)
            .filter((file) => file.endsWith(fileExtension));
          const resourceFile =
            resourceFiles.length > 0 ? resourceFiles[0] : null;

          const fullPath = resourceFile
            ? path.join(resourceDir, resourceFile)
            : resourceDir;

          resources.push({
            name: entry.name,
            path: path.relative(path.join(__dirname, ".."), fullPath),
            meta: cleanMeta,
          });
        } catch (error) {
          console.error(
            `Error processing ${typeName} ${entry.name}: ${error.message}`,
          );
        }
      }
    }
  }

  // Sort by name
  resources.sort((a, b) => a.name.localeCompare(b.name));
  return resources;
}

function generateCatalog() {
  const instructions = readResourceType(
    instructionsDir,
    ".instructions.md",
    "instruction",
  );
  const prompts = readResourceType(promptsDir, ".prompts.md", "prompt");
  const skills = readResourceType(skillsDir, ".skills.md", "skill");

  // Read agent guidance
  let agentGuidance = {};
  if (fs.existsSync(guidancePath)) {
    try {
      const guidanceContent = fs.readFileSync(guidancePath, "utf8");
      agentGuidance = JSON.parse(guidanceContent);
    } catch (error) {
      console.error(`Error reading agent guidance: ${error.message}`);
    }
  }

  const catalog = {
    agentGuidance: agentGuidance,
    prompts: {
      instructions: instructions,
      prompts: prompts,
      skills: skills,
    },
  };

  // Write catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Catalog generated at ${catalogPath}`);
}

generateCatalog();
