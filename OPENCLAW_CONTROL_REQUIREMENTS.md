# OpenClaw Control Requirements Document
**Generated:** 2026-02-15
**OpenClaw Version:** 2026.2.14
**Installation Type:** Binary (Homebrew)
**Status:** ⚠️ Partially Configured - Needs Setup

---

## Executive Summary

Your OpenClaw installation is **already configured** to use your Floyd AI Proxy Harness as the primary model provider. However, several critical items need attention for full operational control.

**✅ What's Working:**
- OpenClaw gateway running at `ws://127.0.0.1:18789`
- Floyd Harness proxy healthy at `http://localhost:8000/v1`
- GLM-5 model configured as primary (200k context, 131k output)
- Operator token available with admin scopes

**⚠️ What Needs Attention:**
- Security vulnerabilities (credentials directory permissions)
- Memory plugin unavailable
- No channels configured (Discord/Telegram/Slack)
- Gateway not running as system service
- Potential API key exposure in Floyd Harness

---

## Phase 1: Authentication & Access Control

### 1.1 OpenClaw API Tokens

You have **TWO** tokens for CLI control:

#### A. Gateway Authentication Token
```
Location: ~/.openclaw/openclaw.json → gateway.auth.token
Token: 69163b3e56a611a889134579c845c0eee727418a8b3d3f25e6fef704b57f0986
Purpose: WebSocket gateway authentication
Usage: Connect to ws://127.0.0.1:18789 with this token in auth header
```

**Verification Command:**
```bash
# Test gateway connection with token
curl -H "Authorization: Bearer 69163b3e56a611a889134579c845c0eee727418a8b3d3f25e6fef704b57f0986" \
  http://127.0.0.1:18789/health
```

#### B. Operator Token (CLI Control)
```
Location: ~/.openclaw/identity/device-auth.json → tokens.operator
Token: Y3jr-g3km4utCp33k5GIKLGhDBaN3u_5aH3MtAFKQvE
Scopes:
  - operator.admin (full CLI control)
  - operator.approvals (manage approval lists)
  - operator.pairing (device pairing)
Purpose: CLI automation, remote control, API access
```

**Verification Command:**
```bash
# Test operator token - should return device info
openclaw devices list
```

### 1.2 Floyd Harness Authentication

```
Location: /Volumes/Storage/floyd-harness/.env
Base URL: http://127.0.0.1:8000/v1
API Key (OpenClaw uses): local-harness

⚠️ CRITICAL: Real provider keys exposed in .env file:
  - ZAI_API_KEY=4b678e923c2e48e18f7856fc6feff6b5.RjmxZh9xVbb7LXVH
  - DEEPSEEK_API_KEY=sk-e7ecc670770a402fadc5a0ddf9ffdeaa
```

**Verification Command:**
```bash
# Test Floyd Harness proxy
curl http://localhost:8000/admin/health
# Expected: {"status":"healthy","service":"floyd-harness"}
```

---

## Phase 2: Configuration Items to Gather

### 2.1 OpenClaw Configuration Files

| File | Location | Purpose | Status |
|------|----------|---------|--------|
| **Main Config** | `~/.openclaw/openclaw.json` | Gateway, models, agents | ✅ Present |
| **Agent Models** | `~/.openclaw/agents/main/agent/models.json` | Model provider configs | ✅ Present |
| **Auth Profiles** | `~/.openclaw/agents/main/agent/auth-profiles.json` | OAuth tokens per provider | ✅ Present |
| **Device Auth** | `~/.openclaw/identity/device-auth.json` | Operator tokens | ✅ Present |
| **Sessions** | `~/.openclaw/agents/main/sessions/sessions.json` | Active session state | ✅ Present |
| **Credentials** | `~/.openclaw/credentials/` | Channel credentials (WhatsApp, etc.) | ⚠️ Empty, 755 permissions |

**Gather Command:**
```bash
# Backup all OpenClaw configs
tar -czf ~/openclaw-config-backup-$(date +%Y%m%d).tar.gz \
  -C ~ .openclaw/openclaw.json \
  -C ~ .openclaw/agents/main/agent/ \
  -C ~ .openclaw/identity/ \
  -C ~ .openclaw/credentials/
```

### 2.2 Floyd Harness Configuration

| File | Location | Purpose | Status |
|------|----------|---------|--------|
| **Environment** | `/Volumes/Storage/floyd-harness/.env` | API keys, settings | ✅ Present |
| **Config Template** | `/Volumes/Storage/floyd-harness/.env.template` | Configuration template | ✅ Present |
| **Main App** | `/Volumes/Storage/floyd-harness/app/main.py` | FastAPI application | ✅ Present |
| **Logs** | `/Volumes/Storage/floyd-harness/logs/` | Usage logs, SQLite DB | ✅ Present |

**Gather Command:**
```bash
# Backup Floyd Harness configs (sanitize API keys first!)
cd /Volumes/Storage/floyd-harness
cp .env .env.backup
sed -i '' 's/API_KEY=.*/API_KEY=REDACTED/g' .env.backup
tar -czf ~/floyd-harness-backup-$(date +%Y%m%d).tar.gz \
  .env.template README.md app/
```

### 2.3 System Integration Points

| Item | Current Value | Needed For |
|------|---------------|------------|
| **Node Version** | 25.6.1 | OpenClaw runtime |
| **Python Version** | 3.9 (system) | Floyd Harness |
| **Gateway Port** | 18789 | WebSocket connections |
| **Dashboard URL** | http://127.0.0.1:18789/ | Control UI |
| **Floyd Proxy Port** | 8000 | OpenAI-compatible API |

---

## Phase 3: Security Audit & Fixes

### 3.1 Critical Security Issues

#### 🔴 ISSUE 1: Credentials Directory World-Readable
```
Current: /Users/douglastalley/.openclaw/credentials (mode 755)
Risk: Other users can read channel credentials
Fix: chmod 700 /Users/douglastalley/.openclaw/credentials
```

**Fix Command:**
```bash
chmod 700 ~/.openclaw/credentials
ls -la ~/.openclaw/ | grep credentials
# Should show: drwx------ (700)
```

#### 🔴 ISSUE 2: API Keys Exposed in Plain Text
```
Location: /Volumes/Storage/floyd-harness/.env
Risk: Git history, file system access exposes real keys
Keys Exposed:
  - Z.ai API key (GLM-5 access)
  - DeepSeek API key (fallback provider)
```

**Fix Strategy:**
1. **Rotate Keys Immediately** (generate new keys from provider dashboards)
2. **Use Environment Variables** (never commit .env to git)
3. **Add to .gitignore**:
   ```bash
   echo ".env" >> /Volumes/Storage/floyd-harness/.gitignore
   echo "*.key" >> /Volumes/Storage/floyd-harness/.gitignore
   ```
4. **Use Secret Management**:
   ```bash
   # Option A: macOS Keychain
   security add-generic-password -a "zai-api" -s "floyd-harness" -w "YOUR_KEY"

   # Option B: Environment variable in shell profile
   echo 'export ZAI_API_KEY="your_key_here"' >> ~/.zshrc
   ```

#### ⚠️ ISSUE 3: Reverse Proxy Headers Not Trusted
```
Current: gateway.trustedProxies = empty
Risk: If you expose dashboard through reverse proxy, auth could be bypassed
Fix: Only needed if using nginx/cloudflared tunnel
```

**Fix Command (if using reverse proxy):**
```bash
# Example for nginx on same machine
openclaw config set gateway.trustedProxies '["127.0.0.1"]'
```

### 3.2 Security Best Practices Checklist

- [ ] Rotate Z.ai API key
- [ ] Rotate DeepSeek API key
- [ ] Add `.env` to `.gitignore`
- [ ] Fix credentials directory permissions (`chmod 700`)
- [ ] Verify `.env` not in git history (`git log --all -- .env`)
- [ ] If committed, use BFG Repo-Cleaner to remove from history
- [ ] Consider using environment variables instead of `.env` file
- [ ] Enable 2FA on Z.ai and DeepSeek accounts
- [ ] Set up API key usage alerts with providers

---

## Phase 4: OpenClaw Setup Checklist

### 4.1 Core Setup (REQUIRED)

- [ ] **Verify Gateway Health**
  ```bash
  openclaw status
  openclaw health
  ```

- [ ] **Test Floyd Harness Connection**
  ```bash
  curl http://localhost:8000/admin/health
  curl http://localhost:8000/v1/models
  ```

- [ ] **Test OpenClaw → Floyd Connection**
  ```bash
  # Should show floyd-harness/glm-5 as configured
  openclaw models status
  ```

- [ ] **Fix Security Issues** (see Phase 3.1)
  ```bash
  chmod 700 ~/.openclaw/credentials
  ```

- [ ] **Enable Memory Plugin** (currently unavailable)
  ```bash
  openclaw plugins list
  openclaw plugins enable memory-core  # or install if needed
  ```

### 4.2 Channel Setup (OPTIONAL - based on use case)

Decide which channels you need:

- [ ] **Discord Bot**
  - Requires: Discord Bot Token, Application ID
  - Command: `openclaw channels login discord --verbose`

- [ ] **Telegram Bot**
  - Requires: Telegram Bot Token (from @BotFather)
  - Command: `openclaw channels login telegram --verbose`

- [ ] **Slack App**
  - Requires: Slack App OAuth tokens, Signing Secret
  - Command: `openclaw channels login slack --verbose`

- [ ] **WhatsApp Web**
  - Requires: QR code scan from phone
  - Command: `openclaw channels login whatsapp --verbose`

### 4.3 Service Setup (RECOMMENDED)

- [ ] **Install Gateway as LaunchAgent** (auto-start on boot)
  ```bash
  openclaw gateway install
  # Creates: ~/Library/LaunchAgents/com.openclaw.gateway.plist
  ```

- [ ] **Install Node Service as LaunchAgent**
  ```bash
  openclaw node install
  ```

### 4.4 Advanced Configuration (OPTIONAL)

- [ ] **Configure Fallback Models**
  ```bash
  openclaw models fallbacks add floyd-harness/deepseek-chat
  ```

- [ ] **Set Up Remote Access** (Tailscale)
  ```bash
  openclaw config set tailscale.enabled true
  openclaw config set gateway.mode "tailscale"
  ```

- [ ] **Configure Memory Backend**
  ```bash
  openclaw memory configure --backend sqlite  # or redis, etc.
  ```

- [ ] **Set Up Webhooks**
  ```bash
  openclaw webhooks add https://your-server.com/webhook
  ```

---

## Phase 5: API Access for Programmatic Control

### 5.1 Using Operator Token for API Calls

```bash
# Example: Get all configured channels
curl -H "Authorization: Bearer Y3jr-g3km4utCp33k5GIKLGhDBaN3u_5aH3MtAFKQvE" \
  http://127.0.0.1:18789/api/channels

# Example: Send a message
curl -X POST \
  -H "Authorization: Bearer Y3jr-g3km4utCp33k5GIKLGhDBaN3u_5aH3MtAFKQvE" \
  -H "Content-Type: application/json" \
  -d '{"channel":"discord","target":"#general","message":"Hello from API!"}' \
  http://127.0.0.1:18789/api/message/send
```

### 5.2 WebSocket Connection (Real-time Control)

```javascript
// Example Node.js script
const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:18789', {
  headers: {
    'Authorization': 'Bearer 69163b3e56a611a889134579c845c0eee727418a8b3d3f25e6fef704b57f0986'
  }
});

ws.on('open', () => {
  console.log('Connected to OpenClaw gateway');

  // Subscribe to events
  ws.send(JSON.stringify({
    type: 'subscribe',
    events: ['message', 'agent_response']
  }));
});

ws.on('message', (data) => {
  console.log('Received:', JSON.parse(data));
});
```

### 5.3 CLI Automation Examples

```bash
# Script: Check all systems health
#!/bin/bash
echo "=== OpenClaw Health ==="
openclaw health

echo -e "\n=== Floyd Harness Health ==="
curl -s http://localhost:8000/admin/health | jq

echo -e "\n=== Model Status ==="
openclaw models status

echo -e "\n=== Active Sessions ==="
openclaw sessions list

# Script: Rotate tokens (requires operator.admin scope)
#!/bin/bash
openclaw devices rotate-token operator
# New token will be printed - save it!
```

---

## Phase 6: Integration Verification

### 6.1 End-to-End Test

Run this test to verify the full stack:

```bash
#!/bin/bash
# File: /Volumes/Storage/openclaw/verify-stack.sh

set -e

echo "1. Checking OpenClaw Gateway..."
openclaw health | grep -q "healthy" && echo "✅ Gateway healthy"

echo "2. Checking Floyd Harness..."
curl -s http://localhost:8000/admin/health | grep -q "healthy" && echo "✅ Floyd Harness healthy"

echo "3. Checking Model Configuration..."
openclaw models status | grep -q "floyd-harness/glm-5" && echo "✅ GLM-5 configured"

echo "4. Testing Model Connection..."
RESPONSE=$(curl -s -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-5","messages":[{"role":"user","content":"test"}]}')
echo "$RESPONSE" | grep -q "choices" && echo "✅ Model responds"

echo "5. Checking Security..."
ls -la ~/.openclaw/credentials | grep -q "drwx------" && echo "✅ Credentials secured"

echo -e "\n🎉 All systems operational!"
```

**Run it:**
```bash
chmod +x /Volumes/Storage/openclaw/verify-stack.sh
./verify-stack.sh
```

### 6.2 Load Test (Optional)

```bash
# Test concurrent requests through Floyd Harness
ab -n 100 -c 10 -p payload.json -T application/json \
  http://localhost:8000/v1/chat/completions

# Where payload.json contains:
# {"model":"glm-5","messages":[{"role":"user","content":"hello"}]}
```

---

## Phase 7: Monitoring & Observability

### 7.1 OpenClaw Monitoring

```bash
# Real-time logs
openclaw logs --follow

# Status dashboard
openclaw status --all

# Security audit
openclaw security audit --deep
```

### 7.2 Floyd Harness Monitoring

```bash
# Usage statistics (last 24 hours)
curl http://localhost:8000/admin/stats?hours=24 | jq

# Cache performance
curl http://localhost:8000/admin/stats/cache | jq

# All registered MCP tools
curl http://localhost:8000/admin/tools | jq

# Current configuration (sanitized)
curl http://localhost:8000/admin/config | jq
```

### 7.3 Log Locations

| Component | Log Location | Rotation |
|-----------|--------------|----------|
| OpenClaw Gateway | `~/.openclaw/logs/gateway.log` | Auto (10MB) |
| OpenClaw Agent | `~/.openclaw/agents/main/logs/` | Auto |
| Floyd Harness | `/Volumes/Storage/floyd-harness/logs/floyd-harness.log` | 10MB, 7 days |
| Floyd Usage DB | `/Volumes/Storage/floyd-harness/logs/usage.db` | Manual |

---

## Phase 8: Disaster Recovery

### 8.1 Backup Strategy

**Daily Backup Script:**
```bash
#!/bin/bash
# File: /Volumes/Storage/openclaw/backup-daily.sh

BACKUP_DIR="/Volumes/Storage/openclaw/backups"
DATE=$(date +%Y%m%d)

mkdir -p "$BACKUP_DIR"

# OpenClaw configs
tar -czf "$BACKUP_DIR/openclaw-$DATE.tar.gz" -C ~ .openclaw/

# Floyd Harness configs (without API keys)
cd /Volumes/Storage/floyd-harness
tar -czf "$BACKUP_DIR/floyd-harness-$DATE.tar.gz" \
  --exclude='.env' \
  --exclude='*.db' \
  --exclude='logs/*.log' \
  app/ README.md .env.template requirements.txt

# Keep only last 7 days
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup complete: $BACKUP_DIR"
```

**Automate with cron:**
```bash
# Run daily at 2 AM
crontab -e
# Add: 0 2 * * * /Volumes/Storage/openclaw/backup-daily.sh
```

### 8.2 Recovery Procedure

```bash
# If OpenClaw config is corrupted:
cd ~
rm -rf .openclaw
tar -xzf /Volumes/Storage/openclaw/backups/openclaw-YYYYMMDD.tar.gz

# If Floyd Harness needs rebuild:
cd /Volumes/Storage/floyd-harness
./run.sh  # Reinstalls venv and dependencies

# If API keys compromised:
# 1. Generate new keys from provider dashboards
# 2. Update .env file
# 3. Restart Floyd Harness: pkill -f uvicorn && ./run.sh
```

---

## Phase 9: Next Steps

### Immediate Actions (Today)

1. **Fix Security Issues**
   - [ ] `chmod 700 ~/.openclaw/credentials`
   - [ ] Rotate Z.ai API key
   - [ ] Rotate DeepSeek API key
   - [ ] Add `.env` to `.gitignore`

2. **Verify Integration**
   - [ ] Run `verify-stack.sh` script
   - [ ] Test with simple prompt through OpenClaw

3. **Enable Services**
   - [ ] `openclaw gateway install` (auto-start on boot)
   - [ ] `openclaw node install`

### Short-term (This Week)

4. **Configure Channels** (as needed)
   - [ ] Discord bot setup
   - [ ] Telegram bot setup
   - [ ] WhatsApp Web pairing

5. **Enable Memory**
   - [ ] Investigate why memory plugin is unavailable
   - [ ] Install/configure memory backend

6. **Set Up Monitoring**
   - [ ] Create monitoring dashboard script
   - [ ] Configure log rotation

### Long-term (This Month)

7. **Advanced Features**
   - [ ] Configure fallback models
   - [ ] Set up remote access (Tailscale)
   - [ ] Create custom MCP tools for Floyd Harness
   - [ ] Integrate with CI/CD pipelines

8. **Documentation**
   - [ ] Document your specific use cases
   - [ ] Create runbooks for common operations
   - [ ] Set up alerting for failures

---

## Appendix A: Quick Reference Commands

```bash
# OpenClaw Status
openclaw status                    # Basic status
openclaw status --all              # Detailed status
openclaw health                    # Health check
openclaw logs --follow             # Real-time logs

# Model Management
openclaw models status             # Show configured models
openclaw models list               # List available models
openclaw models set floyd-harness/glm-5  # Set primary model

# Channel Management
openclaw channels login discord    # Login to Discord
openclaw channels list             # List all channels
openclaw status --deep             # Deep channel status

# Configuration
openclaw config get models.providers.floyd-harness.baseUrl  # Get config
openclaw config set gateway.port 18789  # Set config

# Security
openclaw security audit            # Basic audit
openclaw security audit --deep     # Deep audit
chmod 700 ~/.openclaw/credentials  # Fix permissions

# Services
openclaw gateway install           # Install LaunchAgent
openclaw gateway start             # Start gateway
openclaw gateway stop              # Stop gateway
openclaw gateway restart           # Restart gateway

# Tokens
openclaw devices list              # List paired devices
openclaw devices rotate-token operator  # Rotate operator token

# Floyd Harness
curl http://localhost:8000/admin/health          # Health check
curl http://localhost:8000/admin/stats?hours=24  # Usage stats
curl http://localhost:8000/admin/tools           # MCP tools
```

---

## Appendix B: File Locations Summary

```
OpenClaw Binary:        /opt/homebrew/bin/openclaw
OpenClaw Config:        ~/.openclaw/openclaw.json
OpenClaw Models:        ~/.openclaw/agents/main/agent/models.json
OpenClaw Auth:          ~/.openclaw/identity/device-auth.json
OpenClaw Credentials:   ~/.openclaw/credentials/
OpenClaw Logs:          ~/.openclaw/logs/

Floyd Harness:          /Volumes/Storage/floyd-harness/
Floyd Config:           /Volumes/Storage/floyd-harness/.env
Floyd Logs:             /Volumes/Storage/floyd-harness/logs/

Gateway URL:            ws://127.0.0.1:18789
Dashboard URL:          http://127.0.0.1:18789/
Floyd Proxy URL:        http://127.0.0.1:8000/v1
```

---

## Appendix C: Token/Key Inventory

| Token/Key | Location | Scope | Status | Action Needed |
|-----------|----------|-------|--------|---------------|
| Gateway Auth Token | `~/.openclaw/openclaw.json` | Gateway WebSocket | ✅ Active | None |
| Operator Token | `~/.openclaw/identity/device-auth.json` | CLI Admin | ✅ Active | None |
| Z.ai API Key | `floyd-harness/.env` | GLM-5 Access | ⚠️ Exposed | **ROTATE** |
| DeepSeek API Key | `floyd-harness/.env` | Fallback Provider | ⚠️ Exposed | **ROTATE** |

---

**Document Status:** ✅ Complete
**Next Review:** After security fixes and channel setup
**Maintained By:** Claude (OpenClaw Operations Expert)

---

## Evidence Sources

- OpenClaw Configuration: `~/.openclaw/openclaw.json` (observed)
- OpenClaw Status: `openclaw status` command output (observed)
- Floyd Harness Health: `curl http://localhost:8000/admin/health` (observed)
- Floyd Harness Config: `/Volumes/Storage/floyd-harness/.env` (observed)
- OpenClaw CLI Help: `openclaw --help`, `openclaw models --help` (observed)
- OpenClaw Docs: https://docs.openclaw.ai/ (referenced)
- Floyd Harness README: `/Volumes/Storage/floyd-harness/README.md` (observed)
