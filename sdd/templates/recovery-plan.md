# Recovery Plan: [Project Name]

**Version**: 1.0.0
**Last Updated**: [Date]
**SRE**: SRE Session

## System Overview

[Brief description of architecture and critical components]

## Backup Strategy

### Database
- **Schedule**: [e.g., daily at 2 AM UTC]
- **Method**: [pg_dump, mongodump, etc.]
- **Retention**: [e.g., 30 days]
- **Storage**: [Where backups are stored]
- **Verification**: [How to verify backup integrity]

### File Storage
- **What**: [Uploaded files, static assets]
- **Method**: [Sync method]
- **Schedule**: [Frequency]

## Recovery Procedures

### Scenario 1: Application Crash
1. [Step 1]
2. [Step 2]
3. [Verification step]
**RTO**: [Recovery Time Objective]

### Scenario 2: Database Failure
1. [Step 1]
2. [Step 2]
3. [Verification step]
**RTO**: [Recovery Time Objective]

### Scenario 3: Full System Outage
1. [Step 1]
2. [Step 2]
3. [Verification step]
**RTO**: [Recovery Time Objective]

### Scenario 4: Bad Deployment (Rollback)
1. [Step 1]
2. [Step 2]
3. [Verification step]

## Monitoring & Alerts

### Health Endpoints
| Endpoint | Expected Response | Check Interval |
|----------|-------------------|----------------|
| /health | 200 OK | 60s |

### Alert Thresholds
| Metric | Warning | Critical |
|--------|---------|----------|
| Response time | > 500ms | > 2000ms |
| Error rate | > 1% | > 5% |
| CPU usage | > 70% | > 90% |
| Memory usage | > 75% | > 90% |

### Alert Channels
- [How alerts are delivered]

## Runbooks

### Runbook: Restart Service
```bash
[commands]
```

### Runbook: Check Logs
```bash
[commands]
```

### Runbook: Scale Up
```bash
[commands]
```

### Runbook: Database Maintenance
```bash
[commands]
```
