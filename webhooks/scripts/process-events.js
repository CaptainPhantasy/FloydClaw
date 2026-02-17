#!/usr/bin/env node
/**
 * Webhook Event Processor
 * Processes pending webhook events and sends notifications via OpenClaw
 *
 * Usage: node process-events.js
 *
 * This script is designed to be run as a cron job every 6 hours.
 * It reads pending events from logs/pending-events.jsonl and:
 * 1. Groups them by type and priority
 * 2. Generates a summary
 * 3. Sends to OpenClaw
 * 4. Archives processed events
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const PENDING_FILE = path.join(LOGS_DIR, 'pending-events.jsonl');
const ARCHIVE_DIR = path.join(LOGS_DIR, 'archive');

// Ensure archive directory exists
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

/**
 * Read pending events
 */
function readPendingEvents() {
  if (!fs.existsSync(PENDING_FILE)) {
    return [];
  }

  const content = fs.readFileSync(PENDING_FILE, 'utf8');
  const lines = content.trim().split('\n').filter(Boolean);

  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

/**
 * Group events by type
 */
function groupEvents(events) {
  const groups = {
    github: { push: [], pull_request: [], issue: [], release: [], other: [] },
    cicd: [],
    deploy: [],
    errors: []
  };

  for (const event of events) {
    if (event.type === 'error') {
      groups.errors.push(event);
      continue;
    }

    if (event.type === 'push' || event.type === 'pull_request' || event.type === 'issue' || event.type === 'release') {
      groups.github[event.type] ? groups.github[event.type].push(event) : groups.github.other.push(event);
    } else if (event.type?.includes('github') || event.type?.includes('jenkins') || event.type?.includes('circle') || event.type?.includes('ci')) {
      groups.cicd.push(event);
    } else if (event.type?.includes('deploy') || event.type?.includes('vercel') || event.type?.includes('netlify') || event.type?.includes('render')) {
      groups.deploy.push(event);
    }
  }

  return groups;
}

/**
 * Generate summary report
 */
function generateSummary(groups, total) {
  const lines = [];

  lines.push('╔══════════════════════════════════════════════════════════════════════════╗');
  lines.push('║                    WEBHOOK EVENTS SUMMARY                                ║');
  lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
  lines.push(`║  Total Events: ${total.toString().padEnd(58)}║`);
  lines.push('╠══════════════════════════════════════════════════════════════════════════╣');

  // GitHub events
  const ghTotal = groups.github.push.length + groups.github.pull_request.length +
                  groups.github.issue.length + groups.github.release.length +
                  groups.github.other.length;
  if (ghTotal > 0) {
    lines.push('║  GitHub Events:                                                          ║');
    lines.push(`║    Push:        ${groups.github.push.length.toString().padEnd(47)}║`);
    lines.push(`║    Pull Request:${groups.github.pull_request.length.toString().padEnd(47)}║`);
    lines.push(`║    Issues:      ${groups.github.issue.length.toString().padEnd(47)}║`);
    lines.push(`║    Releases:    ${groups.github.release.length.toString().padEnd(47)}║`);
  }

  // CI/CD events
  if (groups.cicd.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
    lines.push(`║  CI/CD Events: ${groups.cicd.length.toString().padEnd(50)}║`);
    const failed = groups.cicd.filter(e => e.priority === 'high' || e.priority === 'critical').length;
    if (failed > 0) {
      lines.push(`║    ⚠️  Failed/Warning: ${failed.toString().padEnd(42)}║`);
    }
  }

  // Deploy events
  if (groups.deploy.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
    lines.push(`║  Deploy Events: ${groups.deploy.length.toString().padEnd(49)}║`);
    const failed = groups.deploy.filter(e => e.priority === 'critical').length;
    const success = groups.deploy.filter(e => e.priority === 'normal').length;
    lines.push(`║    ✅ Successful: ${success.toString().padEnd(46)}║`);
    if (failed > 0) {
      lines.push(`║    ❌ Failed:     ${failed.toString().padEnd(46)}║`);
    }
  }

  // Errors
  if (groups.errors.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
    lines.push(`║  ⚠️  Processing Errors: ${groups.errors.length.toString().padEnd(41)}║`);
  }

  lines.push('╚══════════════════════════════════════════════════════════════════════════╝');

  return lines.join('\n');
}

/**
 * Archive processed events
 */
function archiveEvents(events) {
  if (events.length === 0) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archiveFile = path.join(ARCHIVE_DIR, `events-${timestamp}.jsonl`);

  fs.writeFileSync(archiveFile, events.map(e => JSON.stringify(e)).join('\n') + '\n');

  // Clear pending file
  fs.writeFileSync(PENDING_FILE, '');

  console.log(`Archived ${events.length} events to ${archiveFile}`);
}

/**
 * Main processor
 */
function processEvents() {
  console.log('Processing webhook events...');
  console.log(`Reading from: ${PENDING_FILE}`);

  const events = readPendingEvents();

  if (events.length === 0) {
    console.log('No pending events to process.');
    return;
  }

  console.log(`Found ${events.length} pending events`);

  const groups = groupEvents(events);
  const summary = generateSummary(groups, events.length);

  console.log('\n' + summary);

  // Archive processed events
  archiveEvents(events);

  // Return summary for OpenClaw integration
  return {
    total: events.length,
    groups: {
      github: groups.github.push.length + groups.github.pull_request.length +
              groups.github.issue.length + groups.github.release.length,
      cicd: groups.cicd.length,
      deploy: groups.deploy.length,
      errors: groups.errors.length
    },
    summary
  };
}

// Run if executed directly
if (require.main === module) {
  const result = processEvents();
  if (result) {
    console.log('\nProcessing complete.');
    console.log(JSON.stringify(result, null, 2));
  }
}

module.exports = { processEvents, readPendingEvents, groupEvents, generateSummary };
