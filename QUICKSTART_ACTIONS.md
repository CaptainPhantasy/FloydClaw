# OpenClaw Quick Start Action Checklist
**Generated:** 2026-02-15
**Priority:** Execute in order

---

## ✅ CURRENT STATUS

Your OpenClaw is **OPERATIONAL** with:
- Gateway running at ws://127.0.0.1:18789
- Floyd Harness proxy healthy at http://localhost:8000/v1
- GLM-5 model configured (200k context, 131k output)
- Operator token with admin access

**You can start using OpenClaw immediately, but should address security issues first.**

---

## 🔥 CRITICAL (Do Now - 5 minutes)

### 1. Fix Credentials Directory Permissions
```bash
chmod 700 ~/.openclaw/credentials
ls -la ~/.openclaw/ | grep credentials
# Verify: drwx------ (not drwxr-xr-x)
```

### 2. Rotate Exposed API Keys

Your Z.ai and DeepSeek API keys are exposed in `/Volumes/Storage/floyd-harness/.env`.

**⚠️ DO THIS IMMEDIATELY:**

1. **Generate new Z.ai API key:**
   - Log into Z.ai dashboard
   - Navigate to API Keys section
   - Generate new key
   - Copy the new key

2. **Generate new DeepSeek API key:**
   - Log into DeepSeek platform
   - Navigate to API Keys section
   - Generate new key
   - Copy the new key

3. **Update Floyd Harness .env:**
   ```bash
   cd /Volumes/Storage/floyd-harness
   nano .env
   # Replace ZAI_API_KEY=... with new key
   # Replace DEEPSEEK_API_KEY=... with new key
   # Save and exit (Ctrl+O, Enter, Ctrl+X)
   ```

4. **Restart Floyd Harness:**
   ```bash
   # Kill existing process
   pkill -f "uvicorn app.main:app"

   # Restart
   cd /Volumes/Storage/floyd-harness
   ./run.sh &
   ```

5. **Verify it's running:**
   ```bash
   curl http://localhost:8000/admin/health
   # Should return: {"status":"healthy","service":"floyd-harness"}
   ```

### 3. Add .env to .gitignore
```bash
cd /Volumes/Storage/floyd-harness
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
echo "logs/*.db" >> .gitignore
git add .gitignore
git commit -m "Add sensitive files to gitignore"
```

---

## ⚡ HIGH PRIORITY (Today - 15 minutes)

### 4. Install OpenClaw as System Service
```bash
# Install gateway as LaunchAgent (auto-starts on boot)
openclaw gateway install

# Install node service
openclaw node install

# Verify installation
launchctl list | grep openclaw
```

### 5. Run Verification Script
```bash
/Volumes/Storage/openclaw/verify-stack.sh
```

All checks should show ✅ except possibly memory plugin (investigate separately).

### 6. Test Full Integration
```bash
# Test OpenClaw status
openclaw status

# Test model configuration
openclaw models status

# Test a simple query through the stack
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Hello, this is a test"}],
    "max_tokens": 20
  }'
```

---

## 📊 MEDIUM PRIORITY (This Week)

### 7. Configure Channels (As Needed)

Only configure the channels you'll actually use:

**Discord Bot:**
```bash
# You'll need: Bot Token from Discord Developer Portal
openclaw channels login discord --verbose
```

**Telegram Bot:**
```bash
# You'll need: Bot Token from @BotFather
openclaw channels login telegram --verbose
```

**Slack App:**
```bash
# You'll need: Slack App OAuth tokens
openclaw channels login slack --verbose
```

**WhatsApp Web:**
```bash
# Will show QR code to scan with phone
openclaw channels login whatsapp --verbose
```

### 8. Enable Memory Plugin
```bash
# Check plugin status
openclaw plugins list

# If memory plugin is disabled:
openclaw plugins enable memory-core

# If not installed:
# Check docs: https://docs.openclaw.ai/plugins/memory
```

### 9. Set Up Monitoring
```bash
# Create monitoring alias for quick checks
echo "alias oclaw-health='openclaw status && curl -s http://localhost:8000/admin/health | jq && openclaw models status'" >> ~/.zshrc

# Reload shell
source ~/.zshrc

# Now you can run: oclaw-health
```

---

## 📈 LOW PRIORITY (This Month)

### 10. Configure Fallback Models
```bash
# Add DeepSeek as fallback (already in Floyd Harness, but configure in OpenClaw too)
openclaw models fallbacks list
openclaw models fallbacks add floyd-harness/deepseek-chat
```

### 11. Set Up Remote Access (Optional)
```bash
# If you need to access OpenClaw from other machines
openclaw config set tailscale.enabled true
openclaw config set gateway.mode "tailscale"
# Requires Tailscale installed and configured
```

### 12. Create Custom MCP Tools (Advanced)
```bash
# Add custom tools to Floyd Harness
# See: /Volumes/Storage/floyd-harness/README.md
# Section: "How to Add Custom MCP Tools"
```

---

## 🎯 SUCCESS CRITERIA

You'll know everything is working when:

- [x] `openclaw status` shows healthy gateway
- [x] `curl http://localhost:8000/admin/health` returns healthy
- [x] `openclaw models status` shows floyd-harness/glm-5
- [x] Test query returns a response from GLM-5
- [x] `ls -la ~/.openclaw/credentials` shows `drwx------`
- [x] New API keys are generated and old ones revoked
- [x] `.env` is in `.gitignore`
- [x] Gateway LaunchAgent is installed
- [x] Verification script shows all ✅

---

## 🆘 TROUBLESHOOTING

### Floyd Harness Won't Start
```bash
# Check for port conflicts
lsof -i :8000

# If something else is using port 8000:
kill -9 <PID>

# Or use a different port:
cd /Volumes/Storage/floyd-harness
PORT=8001 ./run.sh
```

### OpenClaw Gateway Not Starting
```bash
# Check logs
openclaw logs --follow

# Restart gateway
openclaw gateway restart

# If that fails, reset (keeps config):
openclaw gateway stop
openclaw gateway start
```

### Model Not Responding
```bash
# Check if Floyd Harness is running
curl http://localhost:8000/admin/health

# Check if API key is valid
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-5","messages":[{"role":"user","content":"test"}]}'

# If you get 401/403, your API key is invalid
# Regenerate from Z.ai dashboard
```

### Can't Connect to Channels
```bash
# Check channel status
openclaw status --deep

# Re-login to channel
openclaw channels login discord --verbose

# Check credentials directory permissions
ls -ld ~/.openclaw/credentials
# Should be: drwx------ (700)
```

---

## 📚 DOCUMENTATION

- **Full Requirements:** `/Volumes/Storage/openclaw/OPENCLAW_CONTROL_REQUIREMENTS.md`
- **Verification Script:** `/Volumes/Storage/openclaw/verify-stack.sh`
- **OpenClaw Docs:** https://docs.openclaw.ai/
- **Floyd Harness README:** `/Volumes/Storage/floyd-harness/README.md`

---

## 🔐 CREDENTIALS SUMMARY

| Item | Location | Status |
|------|----------|--------|
| Gateway Token | `~/.openclaw/openclaw.json` | ✅ Active |
| Operator Token | `~/.openclaw/identity/device-auth.json` | ✅ Active |
| Z.ai API Key | `floyd-harness/.env` | ⚠️ **ROTATE NOW** |
| DeepSeek API Key | `floyd-harness/.env` | ⚠️ **ROTATE NOW** |

---

**Last Updated:** 2026-02-15
**Next Review:** After completing critical items
