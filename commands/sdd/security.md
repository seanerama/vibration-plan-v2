---
name: sdd:security
description: Start a Security Auditor session to review for vulnerabilities
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
  - TodoWrite
  - AskUserQuestion
---
<objective>
Run the Security Auditor role: review the codebase for vulnerabilities
(OWASP Top 10, dependency issues, secrets exposure, auth flaws).

Produces: vibration-plan/security-report.md
</objective>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
</execution_context>

<context>
Role: security-auditor
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/vp-tools.cjs" init run-role security-auditor`
</context>

<process>
1. Load context — requires stage-manager complete. Can run parallel with technical-writer.
2. Mark role active.
3. Execute Security Auditor workflow:
   - Review code for OWASP Top 10 vulnerabilities
   - Check dependency versions for known CVEs
   - Scan for exposed secrets, hardcoded credentials
   - Review auth/authz implementation
   - Check input validation and output encoding
   - Review error handling (no sensitive data in errors)
   - Check CORS, CSP, and security headers
4. Write vibration-plan/security-report.md with findings and recommendations.
5. Complete role and auto-continue → check `vp-tools graph next` and immediately invoke the next available role (do NOT just display next steps).
</process>
