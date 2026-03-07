---
name: sdd:help
description: Show all spec-driven-devops commands and current workflow state
allowed-tools:
  - Read
  - Bash
---
<objective>
Display all available spec-driven-devops commands grouped by phase, with current
availability status for each.
</objective>

<context>
Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" role list`
</context>

<process>
1. Load role list:
   ```bash
   node "$HOME/.claude/sdd/bin/vp-tools.cjs" role list
   ```

2. Display formatted help:

   ## Spec-Driven DevOps Commands

   ### Getting Started
   | Command | Description |
   |---------|-------------|
   | /sdd:start | Begin a new or existing project workflow |
   | /sdd:status | Show current workflow state |
   | /sdd:next | Show what to do next |
   | /sdd:help | This help page |

   ### Design Phase
   | Command | Role | Status |
   |---------|------|--------|
   | /sdd:vision | Vision Assistant | [status] |
   | /sdd:architect | Lead Architect | [status] |
   | /sdd:designer | UI/UX Designer | [status] |
   | /sdd:retrofit | Retrofit Planner | [status] |

   ### Planning Phase
   | /sdd:plan | Project Planner | [status] |

   ### Implementation Phase
   | /sdd:build | Stage Manager | [status] |
   | /sdd:merge | Merge Manager | on-demand |
   | /sdd:feature | Feature Manager | on-demand |

   ### Testing Phase
   | /sdd:test | Project Tester | [status] |
   | /sdd:handoff | Handoff Tester | [status] |

   ### Docs & Deployment Phase
   | /sdd:docs | Technical Writer | [status] |
   | /sdd:security | Security Auditor | [status] |
   | /sdd:deploy | Project Deployer | [status] |
   | /sdd:sre | SRE | [status] |

   ### Utility
   | /sdd:map | Codebase Mapper | anytime |
</process>
