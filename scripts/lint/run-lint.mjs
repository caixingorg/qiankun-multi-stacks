import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const includeRoots = [
  'main',
  'subapps',
  'tests',
  'scripts'
];

const codeExtensions = new Set(['.js', '.mjs', '.jsx', '.css']);
const violations = [];
const forbiddenGlobalCssSelectors = [
  ':root',
  'html',
  'body',
];

function shouldSkipDir(dirname) {
  return dirname === 'node_modules' || dirname === 'dist' || dirname === '.git';
}

function collectFiles(startDir, results = []) {
  if (!statSync(startDir).isDirectory()) {
    return results;
  }

  for (const entry of readdirSync(startDir)) {
    const fullPath = path.join(startDir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (!shouldSkipDir(entry)) {
        collectFiles(fullPath, results);
      }
      continue;
    }

    if (codeExtensions.has(path.extname(fullPath))) {
      results.push(fullPath);
    }
  }

  return results;
}

function normalize(filePath) {
  return filePath.replace(rootDir + path.sep, '');
}

function isAllowedRawRuntimeVendor(filePath) {
  return (
    filePath.endsWith('runtime-vendor.global.js') ||
    filePath.endsWith('runtime-vendor.fallback.js') ||
    filePath.includes(path.join('main', 'src', 'runtime', 'runtime-vendor')) ||
    filePath.includes(path.join('shared', 'host-adapters')) ||
    filePath.endsWith(path.join('src', 'bridge', 'host-api.js'))
  );
}

function isAllowedRawEventString(filePath) {
  return (
    filePath.includes(path.join('main', 'src', 'contracts')) ||
    filePath.includes(path.join('shared', 'constants', 'app-contracts.js')) ||
    filePath.endsWith(path.join('src', 'bridge', 'host-api.js'))
  );
}

function inspectFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const relativePath = normalize(filePath);

  if (relativePath === 'scripts/lint/run-lint.mjs') {
    return;
  }

  if (relativePath.startsWith('subapps/') && relativePath.endsWith('.css')) {
    const lines = content.split('\n');

    for (const selector of forbiddenGlobalCssSelectors) {
      const hit = lines.find((line) => line.trim().startsWith(selector + ' ') || line.trim() === selector || line.trim().startsWith(selector + '{'));
      if (hit) {
        violations.push(relativePath + ': subapp styles may not declare global selector "' + selector + '"');
      }
    }
  }

  if (
    content.includes('window.HostRuntimeVendor') &&
    !isAllowedRawRuntimeVendor(filePath)
  ) {
    violations.push(
      relativePath + ': direct window.HostRuntimeVendor access is not allowed outside runtime-vendor definitions'
    );
  }

  const rawEvents = ['host:broadcast', 'host:navigation', 'host:navigation:guard', 'subapp:notify'];
  for (const rawEvent of rawEvents) {
    if (content.includes(rawEvent) && !isAllowedRawEventString(filePath)) {
      violations.push(
        relativePath + ': raw platform event string "' + rawEvent + '" should come from contracts'
      );
    }
  }

  if (content.includes("/packages/platform-contracts/src'") || content.includes('/packages/platform-contracts/src"')) {
    violations.push(relativePath + ': relative import to packages/platform-contracts is not allowed; use main/src/contracts');
  }

  if (content.includes("/packages/micro-app-sdk/src'") || content.includes('/packages/micro-app-sdk/src"')) {
    violations.push(relativePath + ': relative import to packages/micro-app-sdk is not allowed; use main/src/runtime/micro-app');
  }

  if (content.includes("/packages/runtime-vendor/src'") || content.includes('/packages/runtime-vendor/src"')) {
    violations.push(relativePath + ': relative import to packages/runtime-vendor is not allowed; use main/src/runtime/runtime-vendor or main/src/shared/host-adapters');
  }

  if (relativePath.startsWith('subapps/') && content.includes('main/src/')) {
    violations.push(relativePath + ': subapps may not directly import main/src/*; use local bridge files under src/bridge');
  }
}

for (const includeRoot of includeRoots) {
  const fullPath = path.join(rootDir, includeRoot);
  for (const filePath of collectFiles(fullPath)) {
    inspectFile(filePath);
  }
}

if (violations.length) {
  console.error('[lint] Violations found:');
  violations.forEach((violation, index) => {
    console.error(String(index + 1) + '.', violation);
  });
  process.exit(1);
}

console.log('[lint] Architecture lint passed');
