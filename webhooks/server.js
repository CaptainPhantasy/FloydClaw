/**
 * OpenClaw Webhook Server
 * Unified server for GitHub, CI/CD, and Deploy webhooks
 *
 * Usage:
 *   node server.js [--port 3000]
 *
 * Endpoints:
 *   POST /webhooks/github   - GitHub events
 *   POST /webhooks/cicd     - CI/CD notifications
 *   POST /webhooks/deploy   - Deployment status
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Import handlers
const githubHandler = require('./github/handler');
const cicdHandler = require('./cicd/handler');
const deployHandler = require('./deploy/handler');

// Configuration
const CONFIG = {
  port: parseInt(process.env.WEBHOOK_PORT || '7913', 10),
  host: process.env.WEBHOOK_HOST || '0.0.0.0',
  openclawGateway: process.env.OPENCLAW_GATEWAY || 'ws://127.0.0.1:18789',
  logDir: path.join(__dirname, 'logs'),
  githubSecret: process.env.GITHUB_WEBHOOK_SECRET || ''
};

// Ensure log directory exists
if (!fs.existsSync(CONFIG.logDir)) {
  fs.mkdirSync(CONFIG.logDir, { recursive: true });
}

/**
 * Logger utility
 */
const logger = {
  _write(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;

    // Console output
    console.log(logLine.trim());

    // File output
    const logFile = path.join(CONFIG.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logLine);
  },

  info(message, data) { this._write('INFO', message, data); },
  warn(message, data) { this._write('WARN', message, data); },
  error(message, data) { this._write('ERROR', message, data); },
  debug(message, data) { this._write('DEBUG', message, data); }
};

/**
 * Verify GitHub signature
 */
function verifyGitHubSignature(payload, signature) {
  if (!CONFIG.githubSecret || !signature) return true;

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', CONFIG.githubSecret);
  hmac.update(payload);
  const expected = `sha256=${hmac.digest('hex')}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

/**
 * WebSocket connection to OpenClaw Gateway
 */
let gatewayWs = null;
let gatewayReconnectTimer = null;

function connectToGateway() {
  if (gatewayWs && (gatewayWs.readyState === WebSocket.CONNECTING || gatewayWs.readyState === WebSocket.OPEN)) {
    return;
  }

  logger.info(`Connecting to OpenClaw Gateway at ${CONFIG.openclawGateway}...`);

  try {
    gatewayWs = new WebSocket(CONFIG.openclawGateway);

    gatewayWs.on('open', () => {
      logger.info('Connected to OpenClaw Gateway');
      if (gatewayReconnectTimer) {
        clearTimeout(gatewayReconnectTimer);
        gatewayReconnectTimer = null;
      }
    });

    gatewayWs.on('message', (data) => {
      logger.debug('Gateway message', { data: data.toString() });
    });

    gatewayWs.on('error', (error) => {
      logger.error('Gateway WebSocket error', { error: error.message });
    });

    gatewayWs.on('close', () => {
      logger.warn('Gateway connection closed, will reconnect in 5s...');
      gatewayWs = null;
      if (!gatewayReconnectTimer) {
        gatewayReconnectTimer = setTimeout(connectToGateway, 5000);
      }
    });
  } catch (error) {
    logger.error('Failed to connect to gateway', { error: error.message });
    if (!gatewayReconnectTimer) {
      gatewayReconnectTimer = setTimeout(connectToGateway, 5000);
    }
  }
}

/**
 * Send event to OpenClaw via gateway WebSocket
 */
async function sendToOpenClaw(event) {
  // Log the event
  logger.info('OpenClaw notification', {
    type: event.type,
    title: event.title,
    priority: event.priority
  });

  // Also write to file for backup
  const eventFile = path.join(CONFIG.logDir, 'pending-events.jsonl');
  fs.appendFileSync(eventFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...event
  }) + '\n');

  // Send via WebSocket if connected
  if (gatewayWs && gatewayWs.readyState === WebSocket.OPEN) {
    try {
      const message = JSON.stringify({
        type: 'webhook_event',
        source: 'openclaw-webhooks',
        timestamp: new Date().toISOString(),
        data: event
      });
      gatewayWs.send(message);
      logger.debug('Event sent to gateway via WebSocket');
      return true;
    } catch (error) {
      logger.error('Failed to send event via WebSocket', { error: error.message });
    }
  } else {
    logger.warn('Gateway WebSocket not connected, event logged only');
  }

  return true;
}

/**
 * Route handler for /webhooks/github
 */
async function handleGitHubRoute(req, res, body) {
  const signature = req.headers['x-hub-signature-256'];
  const eventType = req.headers['x-github-event'];

  // Verify signature
  if (!verifyGitHubSignature(body, signature)) {
    logger.warn('GitHub webhook signature verification failed');
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid signature' }));
    return;
  }

  // Process event
  try {
    const payload = JSON.parse(body);
    const processed = githubHandler.processEvent(eventType, payload);

    logger.info('GitHub event processed', {
      event: eventType,
      type: processed.type,
      title: processed.title
    });

    await sendToOpenClaw(processed);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      received: true,
      event: eventType,
      processed: processed.type
    }));
  } catch (error) {
    logger.error('GitHub event processing error', { error: error.message });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * Route handler for /webhooks/cicd
 */
async function handleCICDRoute(req, res, body) {
  try {
    const payload = JSON.parse(body);
    const provider = cicdHandler.detectProvider(req.headers);
    const processed = cicdHandler.processEvent(provider, payload);

    logger.info('CI/CD event processed', {
      provider,
      type: processed.type,
      title: processed.title
    });

    await sendToOpenClaw(processed);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      received: true,
      provider,
      processed: processed.type
    }));
  } catch (error) {
    logger.error('CI/CD event processing error', { error: error.message });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * Route handler for /webhooks/deploy
 */
async function handleDeployRoute(req, res, body) {
  try {
    const payload = JSON.parse(body);
    const platform = deployHandler.detectPlatform(req.headers, body);
    const processed = deployHandler.processEvent(platform, payload);

    logger.info('Deploy event processed', {
      platform,
      type: processed.type,
      title: processed.title
    });

    await sendToOpenClaw(processed);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      received: true,
      platform,
      processed: processed.type
    }));
  } catch (error) {
    logger.error('Deploy event processing error', { error: error.message });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * Health check endpoint
 */
function handleHealthRoute(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }));
}

/**
 * Main request handler
 */
async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Read body for POST requests
  let body = '';
  if (method === 'POST') {
    for await (const chunk of req) {
      body += chunk;
    }
  }

  // Route requests
  logger.debug('Request received', { method, path: pathname });

  switch (pathname) {
    case '/webhooks/github':
      if (method === 'POST') {
        await handleGitHubRoute(req, res, body);
      } else {
        res.writeHead(405);
        res.end('Method not allowed');
      }
      break;

    case '/webhooks/cicd':
      if (method === 'POST') {
        await handleCICDRoute(req, res, body);
      } else {
        res.writeHead(405);
        res.end('Method not allowed');
      }
      break;

    case '/webhooks/deploy':
      if (method === 'POST') {
        await handleDeployRoute(req, res, body);
      } else {
        res.writeHead(405);
        res.end('Method not allowed');
      }
      break;

    case '/health':
      handleHealthRoute(req, res);
      break;

    case '/':
    case '':
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        name: 'OpenClaw Webhook Server',
        version: '1.0.0',
        endpoints: {
          'POST /webhooks/github': 'GitHub webhook events',
          'POST /webhooks/cicd': 'CI/CD notifications',
          'POST /webhooks/deploy': 'Deployment status',
          'GET /health': 'Health check'
        }
      }));
      break;

    default:
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
  }
}

/**
 * Start server
 */
function start() {
  // Connect to gateway
  connectToGateway();

  const server = http.createServer(handleRequest);

  server.listen(CONFIG.port, CONFIG.host, () => {
    logger.info('OpenClaw Webhook Server started', {
      host: CONFIG.host,
      port: CONFIG.port,
      endpoints: [
        'POST /webhooks/github',
        'POST /webhooks/cicd',
        'POST /webhooks/deploy',
        'GET /health'
      ]
    });

    console.log(`
┌──────────────────────────────────────────────────────────────────────────────┐
│  OpenClaw Webhook Server                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  Listening: http://${CONFIG.host}:${CONFIG.port}
│                                                                              │
│  Endpoints:                                                                  │
│    POST /webhooks/github   → GitHub events (PR, issues, push)               │
│    POST /webhooks/cicd     → CI/CD notifications                            │
│    POST /webhooks/deploy   → Deployment status                              │
│    GET  /health            → Health check                                   │
│                                                                              │
│  Logs: ${CONFIG.logDir}
└──────────────────────────────────────────────────────────────────────────────┘
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('Interrupted, shutting down...');
    server.close(() => {
      process.exit(0);
    });
  });

  return server;
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' || args[i] === '-p') {
      CONFIG.port = parseInt(args[++i], 10);
    }
    if (args[i] === '--host' || args[i] === '-h') {
      CONFIG.host = args[++i];
    }
  }
}

// Start if run directly
if (require.main === module) {
  parseArgs();
  start();
}

module.exports = { start, CONFIG, handleRequest };
