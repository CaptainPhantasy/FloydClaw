/**
 * CI/CD Webhook Handler
 * Processes CI/CD pipeline notifications (GitHub Actions, Jenkins, etc.)
 */

const CONFIG = {
  port: process.env.WEBHOOK_PORT || 3001,
  openclawGateway: process.env.OPENCLAW_GATEWAY || 'ws://127.0.0.1:18789',
  logFile: '/Volumes/Storage/openclaw/webhooks/cicd/events.log'
};

// CI/CD provider handlers
const providers = {
  github_actions: handleGitHubActions,
  jenkins: handleJenkins,
  circleci: handleCircleCI,
  generic: handleGeneric
};

/**
 * Handle GitHub Actions workflow event
 */
function handleGitHubActions(event) {
  const { action, workflow_job, workflow_run, repository, sender } = event;

  const statusMap = {
    queued: '⏳ Queued',
    in_progress: '🔄 Running',
    completed: workflow_run?.conclusion === 'success' ? '✅ Success' : '❌ Failed',
    success: '✅ Success',
    failure: '❌ Failed',
    cancelled: '🚫 Cancelled'
  };

  const status = workflow_run?.status || workflow_job?.status || 'unknown';
  const conclusion = workflow_run?.conclusion;

  return {
    type: 'github_actions',
    title: `GitHub Actions: ${repository?.name || 'Unknown'}`,
    message: `Workflow ${statusMap[conclusion || status] || status}`,
    details: {
      provider: 'github_actions',
      repository: repository?.full_name,
      workflow: workflow_run?.name || workflow_job?.name,
      status,
      conclusion,
      branch: workflow_run?.head_branch,
      commit: workflow_run?.head_sha?.substring(0, 7),
      url: workflow_run?.html_url,
      sender: sender?.login,
      duration: workflow_run?.run_started_at ?
        calculateDuration(workflow_run.run_started_at, workflow_run?.updated_at) : null
    },
    priority: conclusion === 'failure' ? 'high' : 'normal'
  };
}

/**
 * Handle Jenkins webhook event
 */
function handleJenkins(event) {
  const { name, build, url } = event;

  const statusMap = {
    SUCCESS: '✅ Success',
    FAILURE: '❌ Failed',
    UNSTABLE: '⚠️ Unstable',
    ABORTED: '🚫 Aborted',
    BUILDING: '🔄 Building'
  };

  const status = build?.status || 'unknown';

  return {
    type: 'jenkins',
    title: `Jenkins: ${name}`,
    message: `Build #${build?.number} - ${statusMap[status] || status}`,
    details: {
      provider: 'jenkins',
      job: name,
      build_number: build?.number,
      status,
      url,
      duration: build?.duration,
      parameters: build?.parameters
    },
    priority: status === 'FAILURE' ? 'high' : 'normal'
  };
}

/**
 * Handle CircleCI webhook event
 */
function handleCircleCI(event) {
  const { pipeline, workflow, project } = event;

  return {
    type: 'circleci',
    title: `CircleCI: ${project?.name || 'Unknown'}`,
    message: `Pipeline ${pipeline?.status || 'unknown'}`,
    details: {
      provider: 'circleci',
      project: project?.name,
      pipeline_id: pipeline?.id,
      workflow: workflow?.name,
      status: workflow?.status,
      branch: pipeline?.vcs?.branch,
      commit: pipeline?.vcs?.revision?.substring(0, 7)
    },
    priority: workflow?.status === 'failed' ? 'high' : 'normal'
  };
}

/**
 * Handle generic CI/CD event
 */
function handleGeneric(event) {
  return {
    type: 'generic',
    title: event.title || 'CI/CD Event',
    message: event.message || 'Pipeline notification received',
    details: {
      provider: event.provider || 'unknown',
      ...event.details
    },
    priority: event.priority || 'normal'
  };
}

/**
 * Calculate duration between timestamps
 */
function calculateDuration(start, end) {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Process CI/CD webhook event
 */
function processEvent(provider, payload) {
  const handler = providers[provider] || providers.generic;

  try {
    return handler(payload);
  } catch (error) {
    return {
      type: 'error',
      title: `Error processing ${provider} event`,
      message: error.message,
      priority: 'high'
    };
  }
}

/**
 * Log event
 */
function logEvent(event) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] CI/CD: ${event.title} - ${event.message}`);
}

/**
 * Send notification to OpenClaw
 */
async function notifyOpenClaw(processedEvent) {
  console.log('Notify OpenClaw:', JSON.stringify(processedEvent, null, 2));
  return { success: true };
}

/**
 * Detect provider from request headers
 */
function detectProvider(headers) {
  const userAgent = headers['user-agent'] || '';

  if (userAgent.includes('GitHub-Hookshot')) return 'github_actions';
  if (userAgent.includes('Jenkins')) return 'jenkins';
  if (userAgent.includes('CircleCI')) return 'circleci';

  return 'generic';
}

// HTTP handler
function createRequestHandler() {
  return async (req, res) => {
    const provider = detectProvider(req.headers);

    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    const payload = JSON.parse(body);
    const processed = processEvent(provider, payload);

    logEvent(processed);
    await notifyOpenClaw(processed);

    res.writeHead(200);
    res.end(JSON.stringify({ received: true, provider, event: processed.type }));
  };
}

module.exports = {
  processEvent,
  handleGitHubActions,
  handleJenkins,
  handleCircleCI,
  handleGeneric,
  detectProvider,
  createRequestHandler,
  CONFIG
};
