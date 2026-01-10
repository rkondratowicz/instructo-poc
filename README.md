# Instructo POC

[![CI](https://github.com/rkondratowicz/instructo-poc/actions/workflows/ci.yml/badge.svg)](https://github.com/rkondratowicz/instructo-poc/actions/workflows/ci.yml)
[![Biome](https://img.shields.io/badge/Biome-enabled-60a5fa)](https://biomejs.dev/)

A proof-of-concept system for managing and cataloging instruction sets with built-in security protections.

## Features

- Catalog management for instruction sets
- JSON schema validation for metadata
- **Prompt injection protection** - Scans instruction content for malicious patterns

## Security

This repository includes multiple layers of protection against prompt injection attacks:

### Pattern-based Detection
The validation script automatically scans all instruction content for common prompt injection patterns such as:
- "Ignore previous instructions"
- "Override system prompts"
- "Jailbreak" attempts
- "Developer mode" requests

## Usage

### Basic Validation
```bash
npm run validate
```

### Generate Catalog
```bash
npm run generate
```

## Catalog Generation

The `scripts/generate-catalog.js` script automatically:

1. Scans all resource directories in `library/`
2. Reads metadata and content files
3. Generates `catalog.json` with navigation guidance
4. Includes agent guidance for intelligent selection

Run `npm run generate` to update the catalog after adding new resources.

## Agent Guidance System

The `library/agent-guidance.json` file provides LLM agents with:

- **Selection Criteria**: Rules for matching user queries to appropriate resources
- **Matching Examples**: Concrete examples with reasoning
- **Prioritization Rules**: Decision-making guidelines
- **Combination Guidelines**: How to use multiple resources together
- **Fallback Strategies**: Handling edge cases

## Adding New Resources

To add a new resource:

1. Create a new directory under the appropriate type folder in `library/`
2. Create the content file with the correct extension (`.instructions.md`, `.prompt.md`, or skill file)
3. Use the `create-metadata` prompt to automatically generate the `_meta.json` file:
   - The prompt analyzes your content and creates appropriate metadata with tags, description, and languages
   - Run the agent with the `.github/prompts/create-metadata.prompt.md` prompt, providing your content file
4. Run `npm run generate` to update the catalog

⚠️ **IMPORTANT**: Never manually edit `catalog.json`. The catalog is automatically generated from the library contents. Any manual changes will be overwritten when the catalog is regenerated.

## Schema Validation

All metadata files are validated against `schemas/instruction-meta.schema.json`. Run `npm run validate` to check for schema compliance and security issues.

## CI/CD Pipeline

This project includes automated checks to ensure code quality and catalog integrity:

### Automated Checks
- **Formatting**: All code is checked with Biome for consistent formatting and linting
- **Catalog Validation**: Ensures `catalog.json` matches the source files in `library/`

### Running Checks Locally
```bash
# Check formatting and linting
npx biome check .

# Validate catalog integrity
npm run validate

# Apply formatting fixes
npm run format
```

The pipeline runs automatically on:
- All pushes to `main` branch
- All pull requests targeting `main` branch

## Security Considerations

- Content is automatically scanned for prompt injection patterns
- Resources are validated before inclusion in the catalog

## Contributing

When contributing new resources:

- Follow established naming conventions in `library/README.md`
- Use the `create-metadata` prompt to automatically generate comprehensive metadata with relevant tags
- Ensure content is clear and actionable
- Test catalog generation and validation
- Update documentation as needed

## Project Structure

```
├── library/
│   ├── README.md              # Library structure documentation
│   ├── agent-guidance.json    # Navigation guidance for LLM agents
│   ├── instructions/          # Instruction sets for development tasks
│   ├── prompts/               # Reusable prompt templates
│   └── skills/                # Specialized skill definitions
├── schemas/
│   └── instruction-meta.schema.json
├── scripts/
│   ├── generate-catalog.js
│   └── validate-catalog.js
└── catalog.json
