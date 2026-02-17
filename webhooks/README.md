# OpenClaw Webhook Handlers

Webhook receivers for GitHub, CI/CD, and deploy events.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  WEBHOOK INFRASTRUCTURE                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│  github/     → PR/Issue/Push event handlers                                  │
│  cicd/       → CI/CD pipeline notifications                                  │
│  deploy/     → Deployment status hooks                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Endpoints

| Path | Purpose | Method |
|------|---------|--------|
| `/webhooks/github` | GitHub events (PR, issues, push) | POST |
| `/webhooks/cicd` | CI/CD pipeline notifications | POST |
| `/webhooks/deploy` | Deployment status updates | POST |

## GitHub Webhook Events

Supported events:
- `push` - Code pushed to repository
- `pull_request` - PR opened, closed, synchronized
- `issues` - Issue opened, closed, labeled
- `release` - Release published

## Setup

1. Configure GitHub webhook URL in repository settings
2. Set webhook secret via environment variable
3. Start webhook server: `node server.js`

## Integration with OpenClaw

Webhooks can trigger:
- Agent notifications via channels
- Cron job execution
- System events

---
Generated: 2026-02-16
