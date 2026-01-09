import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const instructionsDir = path.join(__dirname, '..', 'library', 'instructions');
const catalogPath = path.join(__dirname, '..', 'catalog.json');

function generateCatalog() {
  const instructions = [];

  // Read all subdirectories in instructions
  const entries = fs.readdirSync(instructionsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const dirPath = path.join(instructionsDir, entry.name);
      const metaPath = path.join(dirPath, '_meta.json');

      if (fs.existsSync(metaPath)) {
        try {
          const metaContent = fs.readFileSync(metaPath, 'utf8');
          const meta = JSON.parse(metaContent);

          // Remove $schema from meta
          const { $schema, ...cleanMeta } = meta;

          // Find the .instructions.md file
          const instructionFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.instructions.md'));
          const instructionFile = instructionFiles.length > 0 ? instructionFiles[0] : null;

          const fullPath = instructionFile ? path.join(dirPath, instructionFile) : dirPath;

          instructions.push({
            name: entry.name,
            path: path.relative(path.join(__dirname, '..'), fullPath),
            meta: cleanMeta
          });
        } catch (error) {
          console.error(`Error processing ${entry.name}: ${error.message}`);
        }
      }
    }
  }

  // Sort by name
  instructions.sort((a, b) => a.name.localeCompare(b.name));

  const catalog = {
    instructions: instructions
  };

  // Write catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Catalog generated at ${catalogPath}`);
}

generateCatalog();
