---
agent: agent
---

# Create Metadata Prompt

You are tasked with generating metadata for instruction, prompt, or skill files in the instructo-poc project. The metadata should be in JSON format conforming to the instruction-meta.schema.json schema.

## Input
You will receive the content of an instruction (.instructions.md), prompt (.prompt.md), or skill file.

## Task
Analyze the provided content and generate appropriate metadata with the following fields:

### Required Fields
- **tags**: An array of strings representing keywords for discovery and classification. Choose relevant tags based on the content's topic, technology, purpose, etc. Minimum 1 tag.

### Optional Fields
- **description**: A short, concise explanation of what the instruction/prompt/skill does, suitable for catalogs or UIs.
- **author**: The name of the person who created the instruction/prompt/skill.

## Schema Reference
The output must conform to this schema:
```json
{
  "$schema": "../../../schemas/instruction-meta.schema.json",
  "tags": ["tag1", "tag2"],
  "description": "Short description here",
  "author": "Author Name"
}
```

## Guidelines for Analysis
1. **Tags**: Extract key concepts, technologies, domains, and purposes from the content. Use lowercase, hyphen-separated if needed (e.g., "package-management").
2. **Description**: Summarize the main purpose in 1-2 sentences.
3. **Author**: Use the name provided by the user, or default to "John Smith" if not specified.

## Output
Create a `_meta.json` file in the same directory as the input file, containing the generated metadata in valid JSON format conforming to the schema.

After creating the file, ask the user to review the generated metadata. Once they confirm they're satisfied with it, remind them to run `npm run generate` to update the catalog with the new resource.
