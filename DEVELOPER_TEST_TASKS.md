# Developer-Centric Test Tasks for OpenClaw

**Purpose:** Test OpenClaw capabilities across development workflows
**Generated:** 2026-02-17
**Context:** Testing OpenClaw with FloydClaw 6-agent system operational

---

## Task Categories

### 1. CORE INFRASTRUCTURE TESTS

#### Task 1.1: Gateway Health Monitoring
**Objective:** Verify OpenClaw gateway health monitoring setup
**Description:** Implement automated health checks for the OpenClaw gateway running on ws://127.0.0.1:18789

**Steps:**
1. Create a health check endpoint in the gateway (if not exists)
2. Implement cron job to check health every 5 minutes
3. Configure alerting on failure
4. Test by manually stopping gateway and observing alert trigger

**Success Criteria:**
- Health check returns status within 2 seconds
- Alert triggers within 1 minute of gateway failure
- System recovers automatically when gateway restarts

**OpenClaw Command:** `openclaw gateway status`

---

#### Task 1.2: Floyd Harness API Integration
**Objective:** Test API proxy reliability through Floyd Harness
**Description:** Verify Floyd Harness at http://localhost:8000/v1 is properly routing to GLM-5

**Steps:**
1. Send 100 concurrent test requests to Floyd Harness
2. Measure response times (P50, P95, P99)
3. Test with various prompt lengths (100, 1000, 5000 tokens)
4. Verify 200k context window is respected
5. Test error handling with invalid API keys

**Success Criteria:**
- 95% of requests succeed under 2 second threshold
- Context window correctly handles 200k tokens
- Error responses are properly formatted
- Load tests show graceful degradation under stress

**Test Command:**
```bash
# Simple test
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-5","messages":[{"role":"user","content":"test"}],"max_tokens":20}'

# Load test
for i in {1..100}; do
  curl -s -w "\n%{http_code}\n" -X POST http://localhost:8000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{"model":"glm-5","messages":[{"role":"user","content":"test '$i'"}],"max_tokens":20}' &
done
```

---

### 2. MULTI-AGENT ORCHESTRATION TESTS

#### Task 2.1: Main Agent Coordination
**Objective:** Test main agent's ability to spawn and coordinate sub-agents
**Description:** Use main agent to orchestrate a multi-agent development task

**Test Scenario:**
1. Open session with main agent
2. Request: "Main, coordinate a feature build for a simple REST API endpoint"
3. Observe agent spawning behavior
4. Verify dev agent receives task
5. Verify test agent validates code
6. Verify docs agent generates documentation
7. Verify deploy agent provides deployment instructions

**Success Criteria:**
- Main agent spawns exactly 4 sub-agents (dev, test, docs, deploy)
- Each agent completes their assigned task
- Main agent aggregates all results into final output
- Total time to complete: < 5 minutes
- All agent communications visible in logs

**OpenClaw Command:** `openclaw agents spawn main`

---

#### Task 2.2: Cross-Agent Communication
**Objective:** Test communication between different agents
**Description:** Create a scenario where dev agent needs test agent's validation results

**Test Scenario:**
1. Start session with dev agent
2. Request code refactoring task
3. Dev agent completes refactor
4. Request: "Get test agent to validate these changes"
5. Verify test agent receives and validates
6. Return results to dev agent

**Success Criteria:**
- Handoff between agents is seamless
- Test agent has context from dev agent's code
- Validation results are accurate
- Total handoff time: < 30 seconds

---

### 3. MEMORY & KNOWLEDGE MANAGEMENT TESTS

#### Task 3.1: LanceDB Memory Recall
**Objective:** Test LanceDB memory plugin functionality
**Description:** Store and recall information across agent sessions

**Test Steps:**
1. Store project-specific knowledge:
   - Legacy AI service definitions
   - Cloud Generalist migration patterns
   - FloydClaw agent configurations
2. Test recall in same session
3. Test recall in new session
4. Test semantic search queries
5. Test memory expiration and retention policies

**Success Criteria:**
- Knowledge stored in < 1 second
- Recall latency < 500ms
- Semantic search returns relevant results
- Cross-session recall works correctly
- Memory respects retention policies

**OpenClaw Commands:**
```bash
# Enable memory
openclaw plugins enable memory-core

# Store knowledge (via agent)
"Main, store that Legacy AI provides 6 core services"

# Recall knowledge (via agent)
"Main, what are Legacy AI's core services?"
```

---

#### Task 3.2: Pattern Storage
**Objective:** Test SUPERCACHE pattern storage and retrieval
**Description:** Create reusable patterns for common development tasks

**Test Patterns to Store:**
1. REST API endpoint template
2. React component boilerplate
3. Docker service configuration
4. GitHub workflow template

**Steps:**
1. Use main agent to create patterns
2. Store in SUPERCACHE vault tier
3. Retrieve patterns in new session
4. Apply pattern to new task
5. Measure time saved vs. creating from scratch

**Success Criteria:**
- Pattern stored successfully
- Pattern retrieval < 100ms
- Pattern application reduces development time by 50%+
- Patterns are versioned and trackable

---

### 4. BROWSER AUTOMATION TESTS

#### Task 4.1: Browser Profile Automation
**Objective:** Test CDP browser automation for 5 configured profiles
**Description:** Automate web interaction tasks using browser profiles

**Test Tasks:**
1. **Chrome (default) profile:**
   - Navigate to Legacy AI website
   - Extract service offerings
   - Verify page loads correctly

2. **OpenClaw profile:**
   - Navigate to Floyd Harness health endpoint
   - Check response status
   - Log result

3. **Dev-profile:**
   - Navigate to local development server
   - Test API endpoint
   - Capture response times

4. **Marketing-profile:**
   - Navigate to social media
   - Check for engagement metrics
   - Automated content posting

5. **Deploy-profile:**
   - Navigate to deployment dashboard
   - Check deployment status
   - Verify rollback functionality

**Success Criteria:**
- Each profile successfully launches CDP browser
- All navigation tasks complete successfully
- Browser properly handles authentication
- Screenshot capture works
- Profile-specific settings (cookies, localStorage) are isolated

**OpenClaw Command:**
```bash
# List profiles
openclaw browser list

# Start specific profile
openclaw browser start --browser-profile dev-profile

# Check profile status
openclaw browser status --profile dev-profile
```

---

#### Task 4.2: E2E Testing with Browser
**Objective:** Test end-to-end workflows using browser automation
**Description:** Create complete user journey tests

**Test Scenario - Legacy AI Contact Form:**
1. Launch marketing-profile
2. Navigate to https://legacy-ai-website.firebaseapp.com/contact.html
3. Fill contact form with test data
4. Submit form
5. Verify EmailJS receives submission
6. Capture screenshot of success state

**Test Scenario - Cloud Generalist Consultation:**
1. Launch deploy-profile
2. Navigate to https://cloudgeneralist.solutions/
3. Click "Schedule a Consultation"
4. Fill consultation form
5. Verify form submission
6. Check database for new lead

**Success Criteria:**
- E2E test completes in < 30 seconds
- All form fields populated correctly
- Submission verified successfully
- Screenshots captured at key points
- Test is repeatable (same result on multiple runs)

---

### 5. WEBHOOK & AUTOMATION TESTS

#### Task 5.1: GitHub Webhook Handler
**Objective:** Test GitHub event processing through webhooks
**Description:** Verify webhook server correctly processes GitHub events

**Test Events:**
1. **Push Event:**
   - Create test repository
   - Push commit
   - Verify webhook receives push event
   - Check event payload
   - Verify agent notification

2. **Pull Request Event:**
   - Create PR
   - Verify webhook receives PR event
   - Check code review agent is triggered
   - Verify review comments posted

3. **Release Event:**
   - Create GitHub release
   - Verify webhook receives release
   - Check docs agent generates release notes
   - Verify deployment agent is notified

**Success Criteria:**
- Webhook receives all event types correctly
- Event payload is parsed accurately
- Agents are triggered appropriately
- Processing time < 5 seconds per event
- Failed events are retried properly

**Test Commands:**
```bash
# Start webhook server
cd /Volumes/Storage/openclaw/webhooks
node server.js

# Send test event
curl -X POST http://localhost:3000/webhooks/github \
  -H "Content-Type: application/json" \
  -d @test-github-event.json
```

---

#### Task 5.2: CI/CD Webhook Processing
**Objective:** Test CI/CD notification handling
**Description:** Verify build and deployment notifications work correctly

**Test Scenarios:**
1. **Build Success:**
   - Trigger GitHub Actions workflow
   - Verify webhook receives success notification
   - Check deploy agent status

2. **Build Failure:**
   - Intentionally break build
   - Verify webhook receives failure notification
   - Check alert escalation to main agent

3. **Deployment Success:**
   - Deploy to staging
   - Verify webhook processes deployment
   - Check automated testing agent runs tests
   - Verify production deployment approved

**Success Criteria:**
- All CI/CD states handled correctly
- Deploy agent receives deployment notifications
- Test agent runs automated tests
- Approval workflow enforces manual confirmation
- Rollback functionality tested and works

---

### 6. CHANNEL INTEGRATION TESTS

#### Task 6.1: Discord Bot Integration
**Objective:** Test Discord bot functionality for notifications and interaction
**Description:** Configure and test Discord bot for OpenClaw notifications

**Test Scenarios:**
1. **Health Notifications:**
   - Stop Floyd Harness
   - Verify Discord receives health alert
   - Restart Floyd Harness
   - Verify Discord receives recovery notification

2. **Agent Status Updates:**
   - Spawn dev agent
   - Verify Discord shows agent activity
   - Complete agent task
   - Verify Discord shows completion

3. **Command Interface:**
   - Send Discord command to check status
   - Verify bot responds with current status
   - Send command to list agents
   - Verify bot responds with agent list

**Success Criteria:**
- Discord bot connects and stays online
- Notifications are received within 10 seconds
- Commands respond within 5 seconds
- Bot handles concurrent messages
- Error messages are clear and helpful

**OpenClaw Commands:**
```bash
# Configure Discord
openclaw channels login discord --verbose

# Test bot connection
openclaw status --deep
```

---

#### Task 6.2: Slack Integration
**Objective:** Test Slack workspace integration
**Description:** Configure Slack app for team notifications

**Test Scenarios:**
1. **Deployment Announcements:**
   - Deploy to production
   - Verify Slack receives deployment message
   - Check message includes deployment details

2. **Error Alerts:**
   - Trigger error in system
   - Verify Slack receives alert
   - Check alert includes troubleshooting steps

3. **Mention-Based Commands:**
   - @mention bot in channel
   - Send status command
   - Verify bot responds with thread reply

**Success Criteria:**
- Slack app authorized correctly
- Message formatting is clean
- Commands work from any channel
- Thread replies maintain context
- Bot respects Slack rate limits

---

### 7. CRON JOB SCHEDULING TESTS

#### Task 7.1: Health Check Cron Job
**Objective:** Test automated health check scheduling
**Description:** Verify cron jobs execute on schedule

**Test Steps:**
1. List all configured cron jobs
2. Manually trigger health-check job
3. Verify job executes
4. Check logs for execution record
5. Verify health endpoint is called
6. Verify results are stored

**Success Criteria:**
- Cron job list shows all 8 configured jobs
- Manual trigger executes immediately
- Logs show execution timestamp
- Health check results are accurate
- Failed jobs trigger alerts

**OpenClaw Commands:**
```bash
# List cron jobs
openclaw cron list

# Manually trigger job
openclaw cron trigger --job health-check

# View job logs
openclaw logs --job health-check
```

---

#### Task 7.2: Scheduled Backup Job
**Objective:** Test automated backup execution
**Description:** Verify daily backup job runs successfully

**Test Steps:**
1. Trigger daily-backup job manually
2. Verify backup file is created
3. Check backup file integrity
4. Test restore from backup
5. Verify backup retention policy
6. Check notification on failure

**Success Criteria:**
- Backup completes in < 2 minutes
- Backup file is valid and readable
- Restore process works correctly
- Old backups are rotated per retention policy
- Failed backups trigger alerts
- Backup size is reasonable

---

### 8. CODE QUALITY & TESTING TESTS

#### Task 8.1: Automated Code Review Workflow
**Objective:** Test multi-agent code review process
**Description:** Implement automated code review using dev + test agents

**Test Scenario:**
1. Create pull request with test code
2. Dev agent reviews code quality
3. Test agent reviews test coverage
4. Both agents provide feedback
5. Main agent consolidates feedback
6. Address feedback and update PR

**Success Criteria:**
- Dev agent catches code quality issues
- Test agent validates test coverage
- Feedback is specific and actionable
- Consolidated feedback is prioritized
- Updated PR passes all checks

**Agent Workflow:**
```
Main Agent
├─► Spawns Dev Agent
│   └─► Reviews code structure, style, best practices
│
├─► Spawns Test Agent
│   └─► Reviews test coverage, edge cases
│
└─► Consolidates feedback
    └─► Returns prioritized action items
```

---

#### Task 8.2: Automated Regression Testing
**Objective:** Test automated test execution on code changes
**Description:** Configure test agent to run on every PR

**Test Steps:**
1. Create test suite with multiple scenarios
2. Push changes to trigger PR
3. Verify test agent runs automatically
4. Check test results in PR comments
5. Verify failed tests block merge
6. Fix failing tests and verify pass

**Success Criteria:**
- Tests run automatically on PR creation
- Test results appear in PR within 2 minutes
- Failed tests prevent merge
- Passed tests allow merge
- Test coverage is reported
- Flaky tests are identified

---

### 9. DOCUMENTATION AUTOMATION TESTS

#### Task 9.1: API Documentation Generation
**Objective:** Test automated API documentation from code
**Description:** Use docs agent to generate and maintain API docs

**Test Steps:**
1. Create new API endpoint
2. Request docs agent generate documentation
3. Verify documentation includes:
   - Endpoint URL
   - HTTP methods
   - Request/response schemas
   - Authentication requirements
   - Error responses
4. Update endpoint signature
5. Verify docs are updated automatically

**Success Criteria:**
- Documentation is generated in < 30 seconds
- All required sections are present
- Code examples are accurate
- Documentation is formatted consistently
- Updates reflect code changes

---

#### Task 9.2: Changelog Generation
**Objective:** Test automated changelog from git commits
**Description:** Generate release notes automatically

**Test Steps:**
1. Merge multiple commits
2. Request docs agent generate changelog
3. Verify changelog includes:
   - Breaking changes
   - New features
   - Bug fixes
   - Credits
4. Format changelog for release
5. Publish release notes

**Success Criteria:**
- Changelog captures all commits
- Categorizes changes correctly
- Version number is accurate
- Format is consistent
- Generation time < 1 minute

---

### 10. PERFORMANCE & SCALABILITY TESTS

#### Task 10.1: Concurrent Agent Sessions
**Objective:** Test system performance with multiple concurrent agents
**Description:** Stress test OpenClaw with concurrent agent operations

**Test Scenarios:**
1. Spawn 3 agents simultaneously
2. Send complex tasks to each
3. Measure response times
4. Monitor resource usage (CPU, memory)
5. Test with 6 concurrent agents
6. Test with 10 concurrent agents

**Success Criteria:**
- System handles 6 concurrent agents without degradation
- Response times remain < 5 seconds with 3 agents
- Response times < 10 seconds with 6 agents
- Resource usage stays within limits
- No deadlocks or race conditions
- All agents complete tasks successfully

---

#### Task 10.2: Memory & Database Performance
**Objective:** Test LanceDB and SUPERCACHE performance under load
**Description:** Stress test memory and caching systems

**Test Steps:**
1. Store 1000 knowledge entries
2. Run 100 concurrent recall queries
3. Measure query latency
4. Test semantic search accuracy
5. Measure storage size growth
6. Test cache eviction policies

**Success Criteria:**
- Storage completes in < 10 seconds for 1000 entries
- Query latency P95 < 100ms
- Semantic search accuracy > 90%
- Memory usage grows linearly
- Cache eviction works correctly
- No data corruption under load

---

## TEST EXECUTION ORDER

### Phase 1: Foundation (Immediate)
1. Task 1.1 - Gateway Health Monitoring
2. Task 1.2 - Floyd Harness API Integration
3. Task 7.1 - Health Check Cron Job

### Phase 2: Multi-Agent (Week 1)
4. Task 2.1 - Main Agent Coordination
5. Task 2.2 - Cross-Agent Communication
6. Task 3.1 - LanceDB Memory Recall
7. Task 3.2 - Pattern Storage

### Phase 3: Automation (Week 2)
8. Task 4.1 - Browser Profile Automation
9. Task 5.1 - GitHub Webhook Handler
10. Task 6.1 - Discord Bot Integration
11. Task 7.2 - Scheduled Backup Job

### Phase 4: Advanced (Week 3-4)
12. Task 4.2 - E2E Testing with Browser
13. Task 5.2 - CI/CD Webhook Processing
14. Task 6.2 - Slack Integration
15. Task 8.1 - Automated Code Review Workflow
16. Task 8.2 - Automated Regression Testing
17. Task 9.1 - API Documentation Generation
18. Task 9.2 - Changelog Generation
19. Task 10.1 - Concurrent Agent Sessions
20. Task 10.2 - Memory & Database Performance

---

## SUCCESS METRICS

Track these metrics for each task:

```
┌─────────────────────────┬──────────────┬─────────────────┐
│ Metric                │ Target       │ Actual         │
├─────────────────────────┼──────────────┼─────────────────┤
│ Task Completion Rate   │ 95%          │ _____          │
│ Average Completion Time │ < 10 min      │ _____          │
│ Agent Coordination     │ Seamless       │ _____          │
│ Memory Recall Accuracy │ > 90%         │ _____          │
│ Automation Reliability  │ 99%           │ _____          │
│ Test Coverage         │ > 80%         │ _____          │
│ Documentation Quality │ Complete       │ _____          │
└─────────────────────────┴──────────────┴─────────────────┘
```

---

## NOTES & LOGGING

For each task, document:
1. Start time and end time
2. Any errors encountered
3. Workarounds used
4. OpenClaw commands used
5. Agent interactions observed
6. Results and observations

**Log Template:**
```markdown
## Task X.Y: [Task Name]

**Date:** YYYY-MM-DD
**Start:** HH:MM:SS
**End:** HH:MM:SS
**Duration:** X minutes

### Execution Steps
1. [Step 1 details]
2. [Step 2 details]
...

### Issues Encountered
- [Issue 1]
- [Issue 2]

### Workarounds
- [Workaround 1]

### OpenClaw Commands Used
```bash
[commands]
```

### Agent Interactions
- Main Agent: [observations]
- Dev Agent: [observations]
- Test Agent: [observations]
- [etc.]

### Results
- [Success criteria met/not met]
- [Metrics recorded]
- [Lessons learned]
```

---

## NEXT STEPS AFTER TESTING

Once all tasks are complete:
1. Generate comprehensive test report
2. Update OpenClaw configuration based on findings
3. Create agent performance optimization patterns
4. Document best practices for multi-agent workflows
5. Plan production deployment strategy

---

**Generated for OpenClaw testing by FLOYD SUPERCACHE**
**Version:** 1.0
**Last Updated:** 2026-02-17
