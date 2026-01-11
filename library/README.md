# Library Structure

This directory contains the instruction sets and prompts that form the core of the Instructo POC system. All resources are automatically cataloged and made available to LLM agents through the generated `catalog.json` file.

## Directory Structure

```
library/
├── README.md                 # This documentation file
├── agent-guidance.json       # Navigation guidance for LLM agents
├── instructions/             # Instruction sets for development tasks
│   ├── [instruction-name]/
│   │   ├── _meta.json        # Metadata and categorization
│   │   └── [instruction-name].instructions.md  # Content file
└── prompts/                  # Reusable prompt templates
    └── [prompt-name]/
        ├── _meta.json        # Metadata and categorization
        └── [prompt-name].prompts.md  # Content file
```

## File Types and Naming Conventions

### Metadata Files (`_meta.json`)

Each resource directory contains a `_meta.json` file that provides:

- **Tags**: Keywords for discovery and categorization
- **Description**: Human-readable explanation of the resource
- **Languages**: Programming languages the resource applies to
- **Schema validation**: All metadata follows `schemas/instruction-meta.schema.json`

Example `_meta.json`:
```json
{
  "$schema": "../../schemas/instruction-meta.schema.json",
  "description": "Standards for new React components",
  "tags": ["frontend", "react", "styling"],
  "languages": ["javascript", "typescript"]
}
```

### Content Files

Each resource type has its own file extension:

- **Instructions**: `[name].instructions.md` - Step-by-step development guidelines
- **Prompts**: `[name].prompts.md` - Reusable prompt templates for AI interactions

## Resource Types

### Instructions

Instruction sets provide comprehensive guidance for development tasks. They typically include:

- Key principles and best practices
- Step-by-step procedures
- Common commands and tools
- Security considerations

Example: `instructions/npm/` contains package management standards.

### Prompts

Prompt templates are reusable AI interaction patterns for specific scenarios:

- Standardized query formats
- Context-aware prompting strategies
- Task-specific communication templates
