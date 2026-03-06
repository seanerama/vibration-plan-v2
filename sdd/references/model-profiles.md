# Model Profiles

## Overview

Model profiles control which AI model handles each role. Higher-capability
models are used for architectural decisions; efficient models for implementation.

## Profiles

### Quality (highest capability, highest cost)
All roles use opus except documentation roles.

### Balanced (recommended default)
- **Opus**: Lead Architect, Retrofit Planner, Project Planner
- **Sonnet**: All others except Codebase Mapper
- **Haiku**: Codebase Mapper

### Budget (most cost-efficient)
- **Sonnet**: Architect, Planner, Stage Manager, Tester, Merge Manager
- **Haiku**: All others

## Model Resolution Order

1. Per-role override in `config.model_overrides.{role-id}`
2. Profile lookup in `MODEL_PROFILES[role-id][profile]`
3. Default: sonnet

## Setting the Profile

```bash
# Check current profile
node vp-tools.cjs config get model_profile

# Change profile
node vp-tools.cjs config set model_profile quality

# Override a specific role
node vp-tools.cjs config set model_overrides.stage-manager opus
```
