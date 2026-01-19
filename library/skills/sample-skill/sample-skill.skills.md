---
name: sample-skill
description: A sample Agent Skill demonstrating the agentskills.io specification format. Use this as a reference when creating new skills for specialized capabilities that agents can activate on demand.
---

# Sample Skill

This is a sample skill that demonstrates the Agent Skills specification format.

## When to Use This Skill

Use this skill when you need:
- A reference for creating new Agent Skills
- To understand the structure of skills following agentskills.io specification
- An example of how skills differ from instructions and prompts

## Instructions

1. Skills are activated by agents on demand for specialized capabilities
2. Skills are deployed to `.github/skills/` in user projects as complete directory structures
3. The main file must be named `SKILL.md` with YAML frontmatter
4. Skills can include optional subdirectories: `scripts/`, `references/`, and `assets/`

## Key Differences from Instructions/Prompts

- **Location**: Skills go in `.github/skills/` as directories (not individual files in `.github/skills/`)
- **Structure**: Complete directory with `SKILL.md` + optional subdirectories
- **Purpose**: Specialized capabilities activated on demand by agents
- **Frontmatter**: Required YAML with name and description fields

## Best Practices

- Keep `SKILL.md` under 500 lines
- Move detailed reference material to `references/` subdirectory
- Use relative paths for file references
- Include clear activation criteria in the description
