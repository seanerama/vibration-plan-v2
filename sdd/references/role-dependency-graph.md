# Role Dependency Graph

## New Project Path

```
Vision Assistant (optional)
    │
    ├──→ Lead Architect ──┬──→ Project Planner ──→ Stage Manager(s) ──┬──→ Project Tester ──→ Project Deployer ──→ SRE
    │                     │                                           │                       ↑
    └──→ UI/UX Designer ──┘                   Merge Manager ←── (if conflicts)   Security Auditor ──┘
                                              Feature Manager ←── (if requests)   Technical Writer
                                                                                  Handoff Tester
```

## Existing Project Path

```
Retrofit Planner ──→ Project Planner ──→ (same as above from here)
```

## Role Dependencies

| Role | Depends On | Can Parallel With | Blocks |
|------|-----------|-------------------|--------|
| Vision Assistant | — | — | Lead Architect |
| Lead Architect | Vision Assistant* | UI/UX Designer | Project Planner |
| UI/UX Designer | — | Lead Architect | — |
| Retrofit Planner | — | — | Project Planner |
| Project Planner | LA or RP | — | Stage Manager |
| Stage Manager | Project Planner | Other Stage Managers | Project Tester |
| Merge Manager | Stage Manager† | — | — |
| Feature Manager | Project Planner† | — | — |
| Project Tester | Stage Manager | Handoff Tester | Project Deployer |
| Handoff Tester | Stage Manager | Project Tester | — |
| Technical Writer | Stage Manager | Security Auditor | — |
| Security Auditor | Stage Manager | Technical Writer | — |
| Codebase Mapper | — | — | — |
| Project Deployer | Project Tester | — | SRE |
| SRE | Project Deployer | — | — |

*Optional dependency — can skip with confirmation
†Event-triggered — only invoked when needed

## Phases

1. **Design**: VA, LA, UXD, RP
2. **Planning**: PP
3. **Implementation**: SM, MM, FM
4. **Testing**: PT, HT
5. **Docs & Deploy**: TW, SA, CM, PD, SRE
