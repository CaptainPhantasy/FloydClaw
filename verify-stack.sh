#!/bin/bash
# OpenClaw + Floyd Harness Integration Verification Script
# Generated: 2026-02-15

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "OpenClaw Integration Verification"
echo "======================================"
echo ""

# 1. OpenClaw Gateway Health
echo -e "${YELLOW}1. Checking OpenClaw Gateway...${NC}"
if openclaw health 2>&1 | grep -qi "healthy\|reachable"; then
    echo -e "${GREEN}✅ Gateway healthy${NC}"
else
    echo -e "${RED}❌ Gateway not healthy${NC}"
    echo "   Run: openclaw gateway start"
fi
echo ""

# 2. Floyd Harness Health
echo -e "${YELLOW}2. Checking Floyd Harness...${NC}"
HEALTH=$(curl -s http://localhost:8000/admin/health 2>&1)
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Floyd Harness healthy${NC}"
    echo "   $HEALTH"
else
    echo -e "${RED}❌ Floyd Harness not responding${NC}"
    echo "   Run: cd /Volumes/Storage/floyd-harness && ./run.sh"
fi
echo ""

# 3. Model Configuration
echo -e "${YELLOW}3. Checking Model Configuration...${NC}"
if openclaw models status 2>&1 | grep -q "floyd-harness/glm-5"; then
    echo -e "${GREEN}✅ GLM-5 via Floyd Harness configured${NC}"
else
    echo -e "${RED}❌ Model not properly configured${NC}"
    echo "   Check: openclaw models status"
fi
echo ""

# 4. Model Connection Test
echo -e "${YELLOW}4. Testing Model Connection...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-5","messages":[{"role":"user","content":"Say OK"}],"max_tokens":5}' \
  --max-time 30 2>&1)

if echo "$RESPONSE" | grep -q "choices\|OK"; then
    echo -e "${GREEN}✅ Model responds${NC}"
    echo "   Response received from GLM-5"
else
    echo -e "${RED}❌ Model not responding${NC}"
    echo "   Response: $RESPONSE"
fi
echo ""

# 5. Security Check
echo -e "${YELLOW}5. Checking Security...${NC}"
CREDS_PERMS=$(ls -ld ~/.openclaw/credentials 2>&1 | awk '{print $1}')
if echo "$CREDS_PERMS" | grep -q "drwx------"; then
    echo -e "${GREEN}✅ Credentials directory secured (700)${NC}"
else
    echo -e "${RED}❌ Credentials directory has wrong permissions${NC}"
    echo "   Current: $CREDS_PERMS"
    echo "   Fix: chmod 700 ~/.openclaw/credentials"
fi
echo ""

# 6. API Keys Exposure Check
echo -e "${YELLOW}6. Checking API Key Security...${NC}"
if [ -f "/Volumes/Storage/floyd-harness/.env" ]; then
    if grep -q "ZAI_API_KEY=4b678" /Volumes/Storage/floyd-harness/.env 2>/dev/null; then
        echo -e "${RED}⚠️  WARNING: API keys may be exposed in .env file${NC}"
        echo "   Recommendation: Rotate API keys immediately"
        echo "   1. Generate new keys from Z.ai and DeepSeek dashboards"
        echo "   2. Update .env file with new keys"
        echo "   3. Ensure .env is in .gitignore"
    else
        echo -e "${GREEN}✅ API keys not in plain text (already secured?)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Floyd Harness .env not found${NC}"
fi
echo ""

# 7. Services Check
echo -e "${YELLOW}7. Checking System Services...${NC}"
if [ -f "$HOME/Library/LaunchAgents/com.openclaw.gateway.plist" ]; then
    echo -e "${GREEN}✅ Gateway LaunchAgent installed${NC}"
else
    echo -e "${YELLOW}⚠️  Gateway not installed as LaunchAgent${NC}"
    echo "   Recommendation: openclaw gateway install"
fi
echo ""

# 8. Memory Plugin Check
echo -e "${YELLOW}8. Checking Memory Plugin...${NC}"
if openclaw status 2>&1 | grep -q "Memory.*enabled.*unavailable"; then
    echo -e "${YELLOW}⚠️  Memory plugin enabled but unavailable${NC}"
    echo "   Check: openclaw plugins list"
elif openclaw status 2>&1 | grep -q "Memory.*enabled.*available"; then
    echo -e "${GREEN}✅ Memory plugin operational${NC}"
else
    echo -e "${YELLOW}⚠️  Memory status unknown${NC}"
fi
echo ""

# 9. Operator Token Check
echo -e "${YELLOW}9. Checking Operator Token...${NC}"
if openclaw devices list 2>&1 | grep -q "operator\|paired"; then
    echo -e "${GREEN}✅ Operator token available${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify operator token${NC}"
fi
echo ""

# Summary
echo "======================================"
echo "Verification Complete"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Fix any ❌ issues shown above"
echo "2. Rotate exposed API keys"
echo "3. Run: openclaw gateway install (for auto-start)"
echo "4. Configure channels as needed: openclaw channels login <discord|telegram|slack>"
echo ""
echo "For detailed requirements, see:"
echo "  /Volumes/Storage/openclaw/OPENCLAW_CONTROL_REQUIREMENTS.md"
