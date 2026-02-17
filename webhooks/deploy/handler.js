/**
 * Deploy Webhook Handler
 * Processes deployment status notifications
 */

const CONFIG = {
  port: process.env.WEBHOOK_PORT || 3002,
  openclawGateway: process.env.OPENCLAW_GATEWAY || 'ws://127.0.0.1:18789',
  logFile: '/Volumes/Storage/openclaw/webhooks/deploy/events.log'
};

// Deployment platforms
const platforms = {
  vercel: handleVercel,
  netlify: handleNetlify,
  render: handleRender,
  railway: handleRailway,
  aws: handleAWS,
  fly: handleFly,
  generic: handleGeneric
};

/**
 * Handle Vercel deployment event
 */
function handleVercel(event) {
  const { type, payload } = event;
  const deployment = payload?.deployment;

  const statusMap = {
    ready: '✅ Deployed',
    building: '🔄 Building',
    queued: '⏳ Queued',
    error: '❌ Failed',
    canceled: '🚫 Cancelled'
  };

  const status = deployment?.state || 'unknown';

  return {
    type: 'vercel',
    title: `Vercel: ${payload?.name || deployment?.name || 'Unknown'}`,
    message: `Deployment ${statusMap[status] || status}`,
    details: {
      platform: 'vercel',
      project: payload?.name,
      deployment_id: deployment?.id,
      url: deployment?.url,
      status,
      branch: deployment?.meta?.githubCommitRef,
      commit: deployment?.meta?.githubCommitSha?.substring(0, 7),
      commit_message: deployment?.meta?.githubCommitMessage,
      environment: deployment?.target,
      created_at: deployment?.created
    },
    priority: status === 'error' ? 'critical' : 'normal'
  };
}

/**
 * Handle Netlify deployment event
 */
function handleNetlify(event) {
  const { state, name, url, branch, commit_ref, deploy_ssl_url } = event;

  const statusMap = {
    ready: '✅ Deployed',
    building: '🔄 Building',
    error: '❌ Failed',
    enqueued: '⏳ Queued'
  };

  return {
    type: 'netlify',
    title: `Netlify: ${name || 'Unknown'}`,
    message: `Deployment ${statusMap[state] || state}`,
    details: {
      platform: 'netlify',
      project: name,
      url: deploy_ssl_url || url,
      status: state,
      branch,
      commit: commit_ref?.substring(0, 7)
    },
    priority: state === 'error' ? 'critical' : 'normal'
  };
}

/**
 * Handle Render deployment event
 */
function handleRender(event) {
  const { service, deploy } = event;

  const statusMap = {
    live: '✅ Live',
    build_failed: '❌ Build Failed',
    deploy_failed: '❌ Deploy Failed',
    building: '🔄 Building',
    queued: '⏳ Queued'
  };

  const status = deploy?.status || 'unknown';

  return {
    type: 'render',
    title: `Render: ${service?.name || 'Unknown'}`,
    message: `Deployment ${statusMap[status] || status}`,
    details: {
      platform: 'render',
      service: service?.name,
      service_type: service?.type,
      url: service?.serviceDetails?.url,
      status,
      commit: deploy?.commit?.substring(0, 7),
      branch: deploy?.branch
    },
    priority: status.includes('failed') ? 'critical' : 'normal'
  };
}

/**
 * Handle Railway deployment event
 */
function handleRailway(event) {
  const { deployment, service } = event;

  return {
    type: 'railway',
    title: `Railway: ${service?.name || 'Unknown'}`,
    message: `Deployment ${deployment?.status || 'unknown'}`,
    details: {
      platform: 'railway',
      service: service?.name,
      deployment_id: deployment?.id,
      status: deployment?.status,
      url: deployment?.url,
      environment: deployment?.environment
    },
    priority: deployment?.status === 'FAILED' ? 'critical' : 'normal'
  };
}

/**
 * Handle AWS CodeDeploy event
 */
function handleAWS(event) {
  const { detail, detail_type } = event;

  return {
    type: 'aws_codedeploy',
    title: `AWS: ${detail?.applicationName || 'Unknown'}`,
    message: `Deployment ${detail?.status || 'unknown'}`,
    details: {
      platform: 'aws_codedeploy',
      application: detail?.applicationName,
      deployment_group: detail?.deploymentGroupName,
      deployment_id: detail?.deploymentId,
      status: detail?.status,
      region: event.region,
      time: event.time
    },
    priority: detail?.status === 'FAILED' ? 'critical' : 'normal'
  };
}

/**
 * Handle Fly.io deployment event
 */
function handleFly(event) {
  const { event_type, data } = event;

  const statusMap = {
    succeeded: '✅ Deployed',
    failed: '❌ Failed',
    running: '🔄 Running'
  };

  return {
    type: 'fly',
    title: `Fly.io: ${data?.app?.name || 'Unknown'}`,
    message: `Deployment ${statusMap[event_type] || event_type}`,
    details: {
      platform: 'fly',
      app: data?.app?.name,
      status: event_type,
      release: data?.release?.version,
      url: data?.app?.hostname ? `https://${data.app.hostname}` : null
    },
    priority: event_type === 'failed' ? 'critical' : 'normal'
  };
}

/**
 * Handle generic deployment event
 */
function handleGeneric(event) {
  return {
    type: 'generic',
    title: event.title || 'Deployment Event',
    message: event.message || 'Deployment notification received',
    details: {
      platform: event.platform || 'unknown',
      status: event.status,
      url: event.url,
      environment: event.environment,
      ...event.details
    },
    priority: event.priority || 'normal'
  };
}

/**
 * Process deploy webhook event
 */
function processEvent(platform, payload) {
  const handler = platforms[platform] || platforms.generic;

  try {
    return handler(payload);
  } catch (error) {
    return {
      type: 'error',
      title: `Error processing ${platform} deploy event`,
      message: error.message,
      priority: 'critical'
    };
  }
}

/**
 * Log event
 */
function logEvent(event) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] DEPLOY: ${event.title} - ${event.message}`);
}

/**
 * Send notification to OpenClaw
 */
async function notifyOpenClaw(processedEvent) {
  console.log('Notify OpenClaw:', JSON.stringify(processedEvent, null, 2));
  return { success: true };
}

/**
 * Detect platform from request
 */
function detectPlatform(headers, body) {
  const userAgent = headers['user-agent'] || '';
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

  if (userAgent.includes('Vercel') || bodyStr.includes('vercel')) return 'vercel';
  if (userAgent.includes('Netlify') || bodyStr.includes('netlify')) return 'netlify';
  if (bodyStr.includes('render.com')) return 'render';
  if (bodyStr.includes('railway.app')) return 'railway';
  if (bodyStr.includes('amazonaws.com') || bodyStr.includes('codedeploy')) return 'aws';
  if (bodyStr.includes('fly.io')) return 'fly';

  return 'generic';
}

// HTTP handler
function createRequestHandler() {
  return async (req, res) => {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    const payload = JSON.parse(body);
    const platform = detectPlatform(req.headers, payload);
    const processed = processEvent(platform, payload);

    logEvent(processed);
    await notifyOpenClaw(processed);

    res.writeHead(200);
    res.end(JSON.stringify({ received: true, platform, event: processed.type }));
  };
}

module.exports = {
  processEvent,
  handleVercel,
  handleNetlify,
  handleRender,
  handleRailway,
  handleAWS,
  handleFly,
  handleGeneric,
  detectPlatform,
  createRequestHandler,
  CONFIG
};
