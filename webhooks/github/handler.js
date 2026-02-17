/**
 * GitHub Webhook Handler
 * Processes GitHub webhook events and routes to OpenClaw
 *
 * Supported events: push, pull_request, issues, release
 */

const crypto = require('crypto');

// Configuration
const CONFIG = {
  port: process.env.WEBHOOK_PORT || 3000,
  secret: process.env.GITHUB_WEBHOOK_SECRET || '',
  openclawGateway: process.env.OPENCLAW_GATEWAY || 'ws://127.0.0.1:18789',
  logFile: '/Volumes/Storage/openclaw/webhooks/github/events.log'
};

// Event type handlers
const handlers = {
  push: handlePush,
  pull_request: handlePullRequest,
  issues: handleIssues,
  release: handleRelease
};

/**
 * Verify GitHub webhook signature
 */
function verifySignature(payload, signature) {
  if (!CONFIG.secret) return true;

  const hmac = crypto.createHmac('sha256', CONFIG.secret);
  hmac.update(payload);
  const expected = `sha256=${hmac.digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * Handle push event
 */
function handlePush(event) {
  const { repository, sender, commits, ref } = event;
  const branch = ref.replace('refs/heads/', '');
  const commitCount = commits?.length || 0;

  return {
    type: 'push',
    title: `Push to ${repository.name}/${branch}`,
    message: `${sender.login} pushed ${commitCount} commit(s) to ${branch}`,
    details: {
      repository: repository.full_name,
      branch,
      commits: commits?.map(c => ({ message: c.message, author: c.author.name })),
      sender: sender.login,
      url: repository.html_url
    },
    priority: 'normal'
  };
}

/**
 * Handle pull request event
 */
function handlePullRequest(event) {
  const { action, pull_request, repository, sender } = event;
  const pr = pull_request;

  const actionMessages = {
    opened: `opened PR #${pr.number}: ${pr.title}`,
    closed: `${pr.merged ? 'merged' : 'closed'} PR #${pr.number}`,
    synchronize: `updated PR #${pr.number}`,
    review_requested: `requested review on PR #${pr.number}`
  };

  return {
    type: 'pull_request',
    title: `PR ${action}: ${repository.name}`,
    message: `${sender.login} ${actionMessages[action] || action}`,
    details: {
      repository: repository.full_name,
      pr_number: pr.number,
      pr_title: pr.title,
      pr_url: pr.html_url,
      action,
      merged: pr.merged,
      sender: sender.login,
      base: pr.base.ref,
      head: pr.head.ref
    },
    priority: action === 'opened' ? 'high' : 'normal'
  };
}

/**
 * Handle issues event
 */
function handleIssues(event) {
  const { action, issue, repository, sender } = event;

  return {
    type: 'issue',
    title: `Issue ${action}: ${repository.name}`,
    message: `${sender.login} ${action} issue #${issue.number}: ${issue.title}`,
    details: {
      repository: repository.full_name,
      issue_number: issue.number,
      issue_title: issue.title,
      issue_url: issue.html_url,
      action,
      labels: issue.labels?.map(l => l.name),
      sender: sender.login
    },
    priority: action === 'opened' ? 'high' : 'normal'
  };
}

/**
 * Handle release event
 */
function handleRelease(event) {
  const { action, release, repository, sender } = event;

  return {
    type: 'release',
    title: `Release ${action}: ${repository.name}`,
    message: `${sender.login} ${action} release ${release.tag_name}: ${release.name || release.tag_name}`,
    details: {
      repository: repository.full_name,
      tag: release.tag_name,
      name: release.name,
      prerelease: release.prerelease,
      draft: release.draft,
      url: release.html_url,
      body: release.body?.substring(0, 500),
      sender: sender.login
    },
    priority: 'high'
  };
}

/**
 * Process webhook event
 */
function processEvent(eventType, payload) {
  const handler = handlers[eventType];

  if (!handler) {
    return {
      type: 'unknown',
      title: `Unknown event: ${eventType}`,
      message: `Received unhandled event type: ${eventType}`,
      priority: 'low'
    };
  }

  try {
    return handler(payload);
  } catch (error) {
    return {
      type: 'error',
      title: `Error processing ${eventType}`,
      message: error.message,
      priority: 'high'
    };
  }
}

/**
 * Log event to file
 */
function logEvent(event) {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, ...event }) + '\n';
  // Append to log file (would use fs.appendFileSync in production)
  console.log(`[${timestamp}] ${event.type}: ${event.title}`);
}

/**
 * Send notification to OpenClaw
 */
async function notifyOpenClaw(processedEvent) {
  // This would send to OpenClaw gateway via WebSocket
  // For now, just log the notification
  console.log('Notify OpenClaw:', JSON.stringify(processedEvent, null, 2));
  return { success: true };
}

// HTTP server handler (for use with Express, http, etc.)
function createRequestHandler() {
  return async (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const eventType = req.headers['x-github-event'];

    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    // Verify signature
    if (!verifySignature(body, signature)) {
      res.writeHead(401);
      res.end('Invalid signature');
      return;
    }

    // Process event
    const payload = JSON.parse(body);
    const processed = processEvent(eventType, payload);

    // Log and notify
    logEvent(processed);
    await notifyOpenClaw(processed);

    // Respond
    res.writeHead(200);
    res.end(JSON.stringify({ received: true, event: processed.type }));
  };
}

module.exports = {
  processEvent,
  handlePush,
  handlePullRequest,
  handleIssues,
  handleRelease,
  verifySignature,
  createRequestHandler,
  CONFIG
};
