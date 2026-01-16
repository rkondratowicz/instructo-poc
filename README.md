# Instructo

[![CI](https://github.com/rkondratowicz/instructo-poc/actions/workflows/ci.yml/badge.svg)](https://github.com/rkondratowicz/instructo-poc/actions/workflows/ci.yml)
[![Biome](https://img.shields.io/badge/Biome-enabled-60a5fa)](https://biomejs.dev/)

A proof-of-concept system for managing and cataloging instruction sets with built-in security protections.

## Features

- Catalog management for instruction sets
- JSON schema validation for metadata

## Usage

### Using the Catalog with VS Code Agents

To leverage the catalog for development tasks:

1. **Find Relevant Prompts**: Message your VS Code agent (e.g., GitHub Copilot) with queries about specific technologies or tasks
2. **Provide Catalog URL**: Include the URL to `catalog.json` in your message to allow the agent to browse and select appropriate instruction sets or prompts (raw URL works best)
3. **Example Query** (copy/paste):

```text
Analyze this project and find useful prompts using this catalog: https://raw.githubusercontent.com/rkondratowicz/instructo-poc/main/catalog.json
```

The catalog contains structured guidance for various development scenarios, with metadata for intelligent selection.

### Adding New Resources

To add a new resource:

1. Create a new directory under the appropriate type folder in `library/`
2. Create the content file with the correct extension (`.instructions.md` or `.prompts.md`)
3. Use the `create-metadata` prompt to automatically generate the `_meta.json` file:
   - The prompt analyzes your content and creates appropriate metadata with tags and description
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

## TODO

- Add support for skills resources in the future
