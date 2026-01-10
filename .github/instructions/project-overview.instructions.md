---
applyTo: '**'
---

## Project Overview: Instructo POC

**Instructo POC** is a proof-of-concept system for securely managing and cataloging instruction sets, prompts, and skills for development tasks. It provides LLM agents with structured guidance while including multiple layers of protection against prompt injection attacks.

### Core Architecture

- **Library Structure**: Organized content in `library/` with three main types:
  - `instructions/`: Step-by-step development guidelines (`.instructions.md`)
  - `prompts/`: Reusable AI interaction templates (`.prompts.md`) 
  - `skills/`: Specialized capability definitions (`.skills.md`)

- **Metadata System**: Each resource has a `_meta.json` file with tags, description, and author, validated against `schemas/instruction-meta.schema.json`

- **Catalog Generation**: `scripts/generate-catalog.js` automatically scans the library and creates `catalog.json` with navigation guidance

- **Agent Guidance**: `library/agent-guidance.json` provides selection criteria, matching examples, and prioritization rules for intelligent resource discovery

### Security Features

- **Prompt Injection Detection**: Validation script scans all content for malicious patterns like "ignore previous instructions", jailbreak attempts, etc.
- **Schema Validation**: Ensures metadata compliance and prevents malformed entries
- **Automated Scanning**: Runs on all catalog generation and CI/CD pipelines

### Development Workflow

1. **Adding Resources**: Create directory under appropriate type folder with `_meta.json` and content file
2. **Metadata Creation**: Use `.github/prompts/create-metadata.prompt.md` to auto-generate comprehensive metadata
3. **Catalog Update**: Run `npm run generate` (never edit `catalog.json` manually)
4. **Validation**: Run `npm run validate` for schema compliance and security checks

### Safe Modification Guidelines

- **Never manually edit** `catalog.json` - it's auto-generated and changes will be overwritten
- **Use provided prompts** for metadata generation to ensure proper tagging and security
- **Run validation** after any changes to detect injection patterns or schema violations
- **Follow naming conventions**: `[name].instructions.md`, `[name].prompts.md`, `[name].skills.md`
- **Test catalog generation** locally before committing
- **CI/CD enforces** Biome formatting and catalog integrity checks

### Technology Stack

- **Runtime**: Node.js with ES modules
- **Linting/Formatting**: Biome (`npm run lint`, `npm run format`)
- **Scripts**: Custom Node.js scripts for catalog management
- **Validation**: JSON Schema + custom security pattern detection

This system enables safe, automated curation of development guidance while protecting against malicious content injection.

### Maintenance Guidelines

**Update this instruction file** whenever significant changes are made to the project's core architecture, workflow, security features, or technology stack. This includes:

- Changes to the library structure or file organization
- Modifications to catalog generation or validation processes
- Updates to security scanning mechanisms
- Additions or changes to CI/CD pipelines
- Major technology stack updates

**Do not update** this file for routine additions of new instruction sets, prompts, or skills - those are handled through the normal catalog generation process.
