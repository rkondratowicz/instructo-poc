# Instructo POC

A proof-of-concept system for managing and cataloging instruction sets with built-in security protections.

## Features

- Catalog management for instruction sets
- JSON schema validation for metadata
- **Prompt injection protection** - Scans instruction content for malicious patterns
- Integration with Superagent AI for advanced security scanning

## Security

This repository includes multiple layers of protection against prompt injection attacks:

### Pattern-based Detection
The validation script automatically scans all instruction content for common prompt injection patterns such as:
- "Ignore previous instructions"
- "Override system prompts"
- "Jailbreak" attempts
- "Developer mode" requests

### Advanced AI Scanning (Optional)
When a Superagent API key is provided, the system can use AI-powered analysis to detect more sophisticated injection attempts.

## Usage

### Basic Validation
```bash
npm run validate
```

### Secure Validation with AI Scanning
```bash
SUPERAGENT_API_KEY=your-api-key npm run validate:secure
```

### Generate Catalog
```bash
npm run generate
```

## Environment Variables

- `SUPERAGENT_API_KEY` - Optional API key for advanced AI-based security scanning

## Project Structure

```
├── library/
│   └── instructions/
│       ├── [instruction-set]/
│       │   ├── _meta.json
│       │   └── [instruction-set].instructions.md
├── schemas/
│   └── instruction-meta.schema.json
├── scripts/
│   ├── generate-catalog.js
│   └── validate-catalog.js
└── catalog.json
