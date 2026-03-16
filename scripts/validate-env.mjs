#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const requireEnvFiles = process.argv.includes('--require-env-files');

const errors = [];
const notices = [];

function readEnvFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseEnv(content) {
  return content.split(/\r?\n/).reduce((acc, rawLine) => {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      return acc;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      return acc;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^(["'])(.*)\1$/, '$2');
    acc[key] = value;
    return acc;
  }, {});
}

function loadConfig(label, envPath, examplePath) {
  if (fs.existsSync(envPath)) {
    notices.push(`[validate-env] ${label}: using ${path.relative(rootDir, envPath)}`);
    return {
      label,
      source: envPath,
      values: parseEnv(readEnvFile(envPath)),
      fromExample: false,
    };
  }

  if (!requireEnvFiles && fs.existsSync(examplePath)) {
    notices.push(
      `[validate-env] ${label}: ${path.relative(rootDir, envPath)} not found, falling back to ${path.relative(rootDir, examplePath)}`,
    );
    return {
      label,
      source: examplePath,
      values: parseEnv(readEnvFile(examplePath)),
      fromExample: true,
    };
  }

  errors.push(
    `[validate-env] ${label}: missing required env file ${path.relative(rootDir, envPath)}`,
  );
  return {
    label,
    source: envPath,
    values: {},
    fromExample: false,
  };
}

function addError(message) {
  errors.push(`[validate-env] ${message}`);
}

function normalizePathname(pathname) {
  return pathname.replace(/\/+$/, '');
}

function validateRequired(label, values, key) {
  const value = values[key]?.trim();
  if (!value) {
    addError(`${label}: ${key} is required`);
  }
  return value || '';
}

function validatePort(label, value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    addError(`${label}: PORT must be an integer between 1 and 65535`);
  }
}

function validateApiUrl(label, value) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    addError(`${label}: VITE_API_BASE_URL must be a valid http(s) URL`);
    return;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    addError(`${label}: VITE_API_BASE_URL must use http or https`);
  }

  if (!normalizePathname(parsed.pathname).endsWith('/api')) {
    addError(`${label}: VITE_API_BASE_URL must end with /api`);
  }
}

function validateOptionalUrl(label, key, value) {
  if (!value) {
    return;
  }

  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      addError(`${label}: ${key} must use http or https when provided`);
    }
  } catch {
    addError(`${label}: ${key} must be a valid http(s) URL when provided`);
  }
}

const apiConfig = loadConfig(
  'api-server',
  path.join(rootDir, 'api-server/.env'),
  path.join(rootDir, 'api-server/.env.example'),
);
const adminConfig = loadConfig(
  'admin-web',
  path.join(rootDir, 'admin-web/.env'),
  path.join(rootDir, 'admin-web/.env.example'),
);
const appConfig = loadConfig(
  'app-uni',
  path.join(rootDir, 'app-uni/.env'),
  path.join(rootDir, 'app-uni/.env.example'),
);

const apiPort = validateRequired('api-server', apiConfig.values, 'PORT');
if (apiPort) {
  validatePort('api-server', apiPort);
}

const databaseUrl = validateRequired('api-server', apiConfig.values, 'DATABASE_URL');
if (databaseUrl && !databaseUrl.startsWith('mysql://')) {
  addError('api-server: DATABASE_URL must start with mysql://');
}

const githubOwner = apiConfig.values.GITHUB_OWNER?.trim() || '';
const githubRepo = apiConfig.values.GITHUB_REPO?.trim() || '';
const githubToken = apiConfig.values.GITHUB_TOKEN?.trim() || '';
if ((githubOwner && !githubRepo) || (!githubOwner && githubRepo)) {
  addError('api-server: GITHUB_OWNER and GITHUB_REPO must be set together');
}
if (githubToken && (!githubOwner || !githubRepo)) {
  addError('api-server: GITHUB_TOKEN requires both GITHUB_OWNER and GITHUB_REPO');
}

const apiAdminToken = apiConfig.values.ADMIN_TOKEN?.trim() || '';
const adminApiBaseUrl = validateRequired('admin-web', adminConfig.values, 'VITE_API_BASE_URL');
if (adminApiBaseUrl) {
  validateApiUrl('admin-web', adminApiBaseUrl);
}

const appApiBaseUrl = validateRequired('app-uni', appConfig.values, 'VITE_API_BASE_URL');
if (appApiBaseUrl) {
  validateApiUrl('app-uni', appApiBaseUrl);
}

const adminToken = adminConfig.values.VITE_ADMIN_TOKEN?.trim() || '';
if (apiAdminToken && adminToken !== apiAdminToken) {
  addError(
    'admin-web: VITE_ADMIN_TOKEN must match api-server ADMIN_TOKEN when admin auth is enabled',
  );
}

validateOptionalUrl('smoke-test', 'APP_BASE_URL', process.env.APP_BASE_URL?.trim() || '');
validateOptionalUrl('smoke-test', 'ADMIN_BASE_URL', process.env.ADMIN_BASE_URL?.trim() || '');
validateOptionalUrl('smoke-test', 'API_BASE_URL', process.env.API_BASE_URL?.trim() || '');

function log(message) {
  process.stdout.write(`${message}\n`);
}

notices.forEach(log);

if (errors.length > 0) {
  errors.forEach((message) => console.error(message));
  process.exit(1);
}

if (apiConfig.fromExample || adminConfig.fromExample || appConfig.fromExample) {
  log('[validate-env] ok (validated with one or more .env.example fallbacks)');
} else {
  log('[validate-env] ok');
}
