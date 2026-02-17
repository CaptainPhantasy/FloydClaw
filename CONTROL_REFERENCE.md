# OpenClaw Control Reference Card
**Generated:** 2026-02-15
**For:** Claude AI Management of OpenClaw

---

## 🔑 AUTHENTICATION TOKENS

### Gateway Authentication Token
```
Token: 69163b3e56a611a889134579c845c0eee727418a8b3d3f25e6fef704b57f0986
Location: ~/.openclaw/openclaw.json → gateway.auth.token
Usage: WebSocket connection to ws://127.0.0.1:18789
Scope: Gateway access only
```

**WebSocket Connection Example:**
```javascript
const ws = new WebSocket('ws://127.0.0.1:18789', {
  headers: {
    'Authorization': 'Bearer 69163b3e56a611a889134579c845c0eee727418a8b3d3f25e6fef704b57f0986'
  }
});
```

**HTTP API Example:**
```bash
curl -H "Authorization: Bearer 69163b3e56a611a889134579c845c0eee727418a8b3d3f25e6fef704b57f0986" \
  http://127.0.0.1:18789/api/status
```

---

### Operator Token (CLI Control)
```
Token: Y3jr-g3km4utCp33k5GIKLGhDBaN3u_5aH3MtAFKQvE
Location: ~/.openclaw/identity/device-auth.json → tokens.operator
Usage: Full CLI automation, API access, remote control
Scopes: operator.admin, operator.approvals, operator.pairing
```

**API Access Example:**
```bash
# List all channels
curl -H "Authorization: Bearer Y3jr-g3km4utCp33k5GIKLGhDBaN3u_5aH3MtAFKQvE" \
  http://127.0.0.1:18789/api/channels

# Send message
curl -X POST \
  -H "Authorization: Bearer Y3jr-g3km4utCp33k5GIKLGhDBaN3u_5aH3MtAFKQvE" \
  -H "Content-Type: application/json" \
  -d '{"channel":"discord","target":"#general","message":"Test"}' \
  http://127.0.0.1:18789/api/message/send

# Rotate token (generates new one)
openclaw devices rotate-token operator
```

---

## 📡 ENDPOINTS

### OpenClaw Gateway
- **WebSocket:** `ws://127.0.0.1:18789`
- **Dashboard:** `http://127.0.0.1:18789/`
- **Health Check:** `http://127.0.0.1:18789/health`
- **API Base:** `http://127.0.0.1:18789/api/`

### Floyd Harness Proxy
- **Base URL:** `http://127.0.0.1:8000/v1`
- **Health:** `http://127.0.0.1:8000/admin/health`
- **Stats:** `http://127.0.0.1:8000/admin/stats?hours=24`
- **Models:** `http://127.0.0.1:8000/v1/models`
- **Chat:** `http://127.0.0.1:8000/v1/chat/completions`
- **Tools:** `http://127.0.0.1:8000/admin/tools`
- **Config:** `http://127.0.0.1:8000/admin/config`

---

## 🤖 MODEL CONFIGURATION

### Primary Model
```
Provider: floyd-harness
Model: glm-5
Context: 200,000 tokens
Max Output: 131,072 tokens
Reasoning: Yes (thinking mode)
Input: text, image
```

### Using the Model
```bash
# Via OpenClaw CLI
openclaw agent --message "Hello"

# Via Floyd Harness Direct
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Your prompt"}],
    "temperature": 0.1,
    "max_tokens": 4096
  }'
```

### Model Management Commands
```bash
openclaw models status              # Check configuration
openclaw models list                # List all models
openclaw models set <model_id>      # Change primary model
openclaw models fallbacks list      # Check fallbacks
openclaw models fallbacks add <id>  # Add fallback
```

---

## 🔧 COMMON OPERATIONS

### Health Checks
```bash
# Full system health
openclaw status && \
curl -s http://localhost:8000/admin/health | jq && \
openclaw models status

# Quick check
openclaw health

# Deep check (includes channels)
openclaw status --deep
```

### Service Management
```bash
openclaw gateway start      # Start gateway
openclaw gateway stop       # Stop gateway
openclaw gateway restart    # Restart gateway
openclaw gateway status     # Check status

openclaw node start         # Start node service
openclaw node stop          # Stop node service
```

### Configuration Management
```bash
# Get config value
openclaw config get <path>
# Example: openclaw config get gateway.port

# Set config value
openclaw config set <path> <value>
# Example: openclaw config set gateway.port 18789

# Edit config file directly
nano ~/.openclaw/openclaw.json
```

### Channel Management
```bash
# Login to channel
openclaw channels login <channel> --verbose

# List channels
openclaw channels list

# Check channel status
openclaw status --deep

# Logout from channel
openclaw channels logout <channel>
```

### Session Management
```bash
# List active sessions
openclaw sessions list

# Clear session
openclaw sessions clear <session_id>

# Session details
openclaw sessions get <session_id>
```

### Logs & Debugging
```bash
# Real-time logs
openclaw logs --follow

# Recent logs
openclaw logs --tail 100

# Gateway logs
cat ~/.openclaw/logs/gateway.log

# Floyd Harness logs
tail -f /Volumes/Storage/floyd-harness/logs/floyd-harness.log
```

---

## 🛡️ SECURITY OPERATIONS

### Token Management
```bash
# List all tokens
openclaw devices list

# Rotate operator token (generates new one)
openclaw devices rotate-token operator

# Pair new device
openclaw pairing start

# Revoke device
openclaw devices revoke <device_id>
```

### Security Audit
```bash
# Basic audit
openclaw security audit

# Deep audit
openclaw security audit --deep

# Fix common issues
chmod 700 ~/.openclaw/credentials
```

---

## 📊 MONITORING

### OpenClaw Metrics
```bash
# Status overview
openclaw status --all

# Memory usage
openclaw memory status

# Agent health
openclaw agents list
```

### Floyd Harness Metrics
```bash
# Usage stats (last 24 hours)
curl -s http://localhost:8000/admin/stats?hours=24 | jq

# Cache performance
curl -s http://localhost:8000/admin/stats/cache | jq

# Token usage by app
curl -s http://localhost:8000/admin/stats?hours=168 | jq '.by_app_model'

# Clear cache
curl -X POST http://localhost:8000/admin/cache/clear
```

---

## 🚨 TROUBLESHOOTING COMMANDS

### Diagnose Issues
```bash
# Run doctor
openclaw doctor

# Check logs
openclaw logs --follow

# Verify configuration
openclaw models status
openclaw config get models.providers.floyd-harness

# Test connections
curl http://localhost:8000/admin/health
openclaw health
```

### Reset Operations
```bash
# Reset local state (keeps config)
openclaw reset

# Reset specific agent
openclaw agents reset <agent_id>

# Full uninstall (removes everything except CLI)
openclaw uninstall
```

### Emergency Recovery
```bash
# Kill all OpenClaw processes
pkill -f openclaw

# Restart from scratch
openclaw gateway stop
openclaw gateway start --force

# Restore from backup
tar -xzf ~/openclaw-config-backup-YYYYMMDD.tar.gz -C ~
```

---

## 🔄 BACKUP & RESTORE

### Backup
```bash
# Backup all OpenClaw configs
tar -czf ~/openclaw-backup-$(date +%Y%m%d).tar.gz \
  -C ~ .openclaw/

# Backup Floyd Harness (exclude .env with keys)
tar -czf ~/floyd-backup-$(date +%Y%m%d).tar.gz \
  -C /Volumes/Storage floyd-harness/ \
  --exclude='floyd-harness/.env' \
  --exclude='floyd-harness/logs/*.log' \
  --exclude='floyd-harness/logs/*.db'
```

### Restore
```bash
# Restore OpenClaw
cd ~
tar -xzf ~/openclaw-backup-YYYYMMDD.tar.gz

# Restore Floyd Harness
cd /Volumes/Storage
tar -xzf ~/floyd-backup-YYYYMMDD.tar.gz
cd floyd-harness
# Don't forget to recreate .env with your API keys!
```

---

## 📁 FILE LOCATIONS

```
OpenClaw Binary:          /opt/homebrew/bin/openclaw
Main Config:              ~/.openclaw/openclaw.json
Agent Config:             ~/.openclaw/agents/main/agent/
Model Config:             ~/.openclaw/agents/main/agent/models.json
Auth Profiles:            ~/.openclaw/agents/main/agent/auth-profiles.json
Device Auth:              ~/.openclaw/identity/device-auth.json
Credentials:              ~/.openclaw/credentials/
Logs:                     ~/.openclaw/logs/
Sessions:                 ~/.openclaw/agents/main/sessions/

Floyd Harness:            /Volumes/Storage/floyd-harness/
Floyd Config:             /Volumes/Storage/floyd-harness/.env
Floyd Logs:               /Volumes/Storage/floyd-harness/logs/
```

---

## 🌐 API ENDPOINTS REFERENCE

### OpenClaw REST API
```
GET  /health                      - Health check
GET  /api/status                  - System status
GET  /api/channels                - List channels
POST /api/message/send            - Send message
GET  /api/sessions                - List sessions
GET  /api/agents                  - List agents
POST /api/agent/<id>/message      - Send to agent
```

### Floyd Harness REST API
```
GET  /admin/health                - Health check
GET  /admin/stats?hours=24        - Usage statistics
GET  /admin/stats/cache           - Cache statistics
POST /admin/cache/clear           - Clear cache
GET  /admin/tools                 - List MCP tools
GET  /admin/config                - Show config (sanitized)
GET  /v1/models                   - List models
POST /v1/chat/completions         - Chat completion
```

---

## 💡 QUICK ALIASES

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# OpenClaw aliases
alias oclaw-status='openclaw status && curl -s http://localhost:8000/admin/health | jq'
alias oclaw-logs='openclaw logs --follow'
alias oclaw-health='openclaw health'
alias oclaw-models='openclaw models status'

# Floyd Harness aliases
alias floyd-health='curl -s http://localhost:8000/admin/health | jq'
alias floyd-stats='curl -s http://localhost:8000/admin/stats?hours=24 | jq'
alias floyd-tools='curl -s http://localhost:8000/admin/tools | jq'

# Combined aliases
alias check-all='oclaw-status && floyd-health && floyd-stats'
```

Then reload:
```bash
source ~/.zshrc  # or source ~/.bashrc
```

---

## 🎯 COMMON WORKFLOWS

### Workflow 1: Daily Health Check
```bash
# Run verification
/Volumes/Storage/openclaw/verify-stack.sh

# Check usage
floyd-stats

# Check logs for errors
openclaw logs --tail 100 | grep -i error
```

### Workflow 2: Adding a Channel
```bash
# 1. Login to channel
openclaw channels login discord --verbose

# 2. Verify connection
openclaw status --deep

# 3. Test message
openclaw message send --channel discord --target "#test" --message "Test"
```

### Workflow 3: Debugging Model Issues
```bash
# 1. Check model config
openclaw models status

# 2. Test Floyd Harness
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-5","messages":[{"role":"user","content":"test"}]}'

# 3. Check Floyd logs
tail -100 /Volumes/Storage/floyd-harness/logs/floyd-harness.log

# 4. Check OpenClaw logs
openclaw logs --tail 100
```

### Workflow 4: Updating Configuration
```bash
# 1. Backup current config
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup

# 2. Make changes
openclaw config set <path> <value>

# 3. Restart gateway
openclaw gateway restart

# 4. Verify
openclaw status
```

---

## 🔐 SECURITY CHECKLIST

Before production use, ensure:

- [ ] API keys rotated (not using exposed keys)
- [ ] Credentials directory: `chmod 700 ~/.openclaw/credentials`
- [ ] `.env` in `.gitignore`
- [ ] No sensitive data in git history: `git log --all -- .env`
- [ ] Gateway not exposed to public internet
- [ ] Operator token stored securely
- [ ] Regular security audits: `openclaw security audit --deep`

---

**Document Version:** 1.0
**Last Updated:** 2026-02-15
**Next Review:** After any configuration changes
