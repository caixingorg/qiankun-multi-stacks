import { getMainConfig } from '../../main/src/services/config-service.js';

const localConfig = getMainConfig('?debug=1&env=local&channel=stable');
const testConfig = getMainConfig('?debug=1&env=test&channel=rollback');

if (localConfig.envName !== 'local') {
  throw new Error('local config env mismatch');
}

if (testConfig.envName !== 'test') {
  throw new Error('test config env mismatch');
}

if (testConfig.releaseChannel !== 'rollback') {
  throw new Error('release channel mismatch');
}

if (testConfig.apiBaseUrl !== '/api') {
  throw new Error('test api base url mismatch');
}

if (localConfig.appManifestPath !== '/config/apps/local.json') {
  throw new Error('local manifest path mismatch');
}

if (testConfig.appManifestPath !== '/config/apps/test.json') {
  throw new Error('test manifest path mismatch');
}

if (testConfig.releasePolicySource !== 'manifest') {
  throw new Error('release policy source mismatch');
}

if (!localConfig.allowManualRollbackSwitch || !localConfig.allowForcedFailure) {
  throw new Error('local debug runtime flags mismatch');
}

if (!localConfig.allowDefaultRegistryFallback) {
  throw new Error('local runtime should allow default registry fallback');
}

const productionSafeConfig = getMainConfig('?channel=rollback');

if (productionSafeConfig.releaseChannel !== 'stable') {
  throw new Error('channel should stay stable without debug flag');
}

const previousWindow = globalThis.window;
try {
  globalThis.window = {
    __MAIN_RUNTIME_CONFIG__: {
      envName: 'production',
      apiBaseUrl: '/api',
      releaseChannel: 'stable',
      appManifestPath: '/config/apps/production.json',
      releasePolicySource: 'manifest',
      allowDebugQueryOverrides: false,
      allowManualRollbackSwitch: false,
      allowForcedFailure: false,
      allowDefaultRegistryFallback: false,
    },
    location: {
      hostname: 'prod.example.com',
      search: '',
    },
  };

  const injectedProductionConfig = getMainConfig();

  if (injectedProductionConfig.allowDefaultRegistryFallback) {
    throw new Error('production runtime should not allow default registry fallback');
  }
} finally {
  globalThis.window = previousWindow;
}

console.log('[contracts] config model validation passed');
