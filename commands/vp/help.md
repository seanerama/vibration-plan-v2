---
name: vp:help
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
   | /vp:start | Begin a new or existing project workflow |
   | /vp:status | Show current workflow state |
   | /vp:next | Show what to do next |
   | /vp:help | This help page |

   ### Design Phase
   | Command | Role | Status |
   |---------|------|--------|
   | /vp:vision | Vision Assistant | [status] |
   | /vp:architect | Lead Architect | [status] |
   | /vp:designer | UI/UX Designer | [status] |
   | /vp:retrofit | Retrofit Planner | [status] |

   ### Planning Phase
   | /vp:plan | Project Planner | [status] |

   ### Implementation Phase
   | /vp:build | Stage Manager | [status] |
   | /vp:merge | Merge Manager | on-demand |
   | /vp:feature | Feature Manager | on-demand |

   ### Testing Phase
   | /vp:test | Project Tester | [status] |
   | /vp:handoff | Handoff Tester | [status] |

   ### Docs & Deployment Phase
   | /vp:docs | Technical Writer | [status] |
   | /vp:security | Security Auditor | [status] |
   | /vp:deploy | Project Deployer | [status] |
   | /vp:sre | SRE | [status] |

   ### Utility
   | /vp:map | Codebase Mapper | anytime |
</process>
