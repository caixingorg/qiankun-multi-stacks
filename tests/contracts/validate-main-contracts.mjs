import {
  CONTEXT_CONTRACT,
  CONTRACT_VERSION,
  ERROR_CONTRACT,
  MENU_CONTRACT,
  PERMISSION_CONTRACT,
  ROUTE_CONTRACT,
} from '../../main/src/shared/constants/app-contracts.js';
import { AUTH_MODEL } from '../../main/src/shared/constants/auth-model.js';
import { appRegistry } from '../../main/src/runtime/app-registry.js';
import { resolveAppEntry } from '../../main/src/runtime/resolve-app-entry.js';
import { createSharedKernel } from '../../main/src/shared/shared-kernel.js';

const testUser = { id: 'test-u-001', name: 'test-user', displayName: 'Test User' };
const testEnvContext = { envName: 'test', apiBaseUrl: '/api' };
const testPermissionContext = { permissions: ['main:view'] };
const testRequestClient = { request: () => Promise.resolve({ ok: true }) };
const hostContext = {
  user: testUser,
  envContext: testEnvContext,
  permissionContext: testPermissionContext,
  requestClient: testRequestClient,
  contractVersion: CONTRACT_VERSION,
};

const sharedKernel = createSharedKernel(hostContext);

if (MENU_CONTRACT.owner !== 'main') {
  throw new Error('menu contract owner mismatch');
}

if (ROUTE_CONTRACT.owner !== 'main+subapp') {
  throw new Error('route contract owner mismatch');
}

if (PERMISSION_CONTRACT.owner !== 'main') {
  throw new Error('permission contract owner mismatch');
}

if (!Array.isArray(CONTEXT_CONTRACT.requiredKeys) || !CONTEXT_CONTRACT.requiredKeys.includes('contractVersion')) {
  throw new Error('context contract missing required keys');
}

if (!ERROR_CONTRACT.subappRuntimeError) {
  throw new Error('error contract missing subapp runtime error event');
}

if (!sharedKernel.getContractVersion || sharedKernel.getContractVersion() !== CONTRACT_VERSION) {
  throw new Error('shared kernel contract version mismatch');
}

if (sharedKernel.getEnvContext() !== testEnvContext) {
  throw new Error('shared kernel envContext should preserve host context identity');
}

if (sharedKernel.getPermissionContext() !== testPermissionContext) {
  throw new Error('shared kernel permissionContext should preserve host context identity');
}

if (typeof sharedKernel.request !== 'function') {
  throw new Error('shared kernel request accessor missing');
}

for (const app of appRegistry) {
  if (!app.key || !app.activeRule || !app.entries || !app.entries.stable) {
    throw new Error('app registry missing required contract fields for ' + JSON.stringify(app));
  }
}

if (!AUTH_MODEL || AUTH_MODEL.loginOwner !== 'main') {
  throw new Error('auth model mismatch');
}

const legacyApp = appRegistry.find((app) => app.key === 'legacy');
const opsApp = appRegistry.find((app) => app.key === 'ops');

if (!legacyApp || !opsApp) {
  throw new Error('app registry missing rollback contract samples');
}

const legacyScopedEntry = resolveAppEntry(legacyApp, {
  channel: 'rollback',
  rollbackApp: 'ops',
});

if (legacyScopedEntry !== legacyApp.entries.stable) {
  throw new Error('rollbackApp scoping failed: unrelated dedicated app should stay on stable entry');
}

const opsScopedEntry = resolveAppEntry(opsApp, {
  channel: 'rollback',
  rollbackApp: 'ops',
});

if (opsScopedEntry !== opsApp.entries.rollback) {
  throw new Error('rollbackApp scoping failed: targeted app should use rollback entry');
}

console.log('[contracts] main contracts validation passed');
