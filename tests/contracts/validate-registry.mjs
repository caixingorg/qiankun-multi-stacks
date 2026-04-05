import { readFileSync } from 'node:fs';
import { appRegistry } from '../../main/src/runtime/app-registry.js';
import { validateAppRegistry } from '../../main/src/runtime/release-model.js';
import { buildAppRegistryFromManifest, loadRuntimeAppRegistry } from '../../main/src/runtime/load-app-manifest.js';

validateAppRegistry(appRegistry);

const localManifest = JSON.parse(readFileSync(new URL('../../main/public/config/apps/local.json', import.meta.url), 'utf8'));
const registryFromManifest = buildAppRegistryFromManifest(localManifest);

if (!Array.isArray(registryFromManifest) || registryFromManifest.length !== appRegistry.length) {
  throw new Error('manifest registry size mismatch');
}

const previousWindow = globalThis.window;
let nonLocalManifestFailureDidThrow = false;
try {
  globalThis.window = {
    __MAIN_RUNTIME_CONFIG__: {
      envName: 'production',
      appManifestPath: '/config/apps/production.json',
      allowDefaultRegistryFallback: false,
    },
    location: {
      hostname: 'prod.example.com',
      search: '',
    },
  };

  try {
    await loadRuntimeAppRegistry(async () => {
      throw new Error('manifest unreachable');
    });
  } catch (error) {
    nonLocalManifestFailureDidThrow = String(error && error.message).includes(
      'Failed to load runtime app manifest in non-local environment'
    );
  }
} finally {
  globalThis.window = previousWindow;
}

if (!nonLocalManifestFailureDidThrow) {
  throw new Error('non-local manifest failure should fail closed instead of falling back to localhost registry');
}

console.log('[contracts] app registry validation passed:', appRegistry.length, 'apps');
