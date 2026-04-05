// Manifest loading lets main resolve child-app entries from environment-
// specific JSON files instead of hardcoding deployment coordinates everywhere.
// Only localhost may fall back to the built-in dev registry.
import { validateAppRegistry } from './release-model.js';
import { appRegistry as defaultAppRegistry, setRuntimeAppRegistry } from './app-registry.js';
import { getMainConfig } from '../services/config-service.js';

export function buildAppRegistryFromManifest(manifest) {
  if (!manifest || !Array.isArray(manifest.apps)) {
    throw new Error('Invalid app manifest: missing apps array');
  }

  return validateAppRegistry(manifest.apps);
}

export async function loadRuntimeAppRegistry(fetchImpl = typeof fetch === 'function' ? fetch.bind(window) : null) {
  const mainConfig = getMainConfig();
  const allowDefaultRegistryFallback = Boolean(mainConfig.allowDefaultRegistryFallback);

  if (!mainConfig.appManifestPath || !fetchImpl) {
    if (allowDefaultRegistryFallback) {
      return setRuntimeAppRegistry(defaultAppRegistry);
    }

    throw new Error('Runtime app manifest is unavailable and default registry fallback is disabled.');
  }

  try {
    const response = await fetchImpl(mainConfig.appManifestPath);

    if (!response.ok) {
      throw new Error('Failed to load manifest: ' + response.status);
    }

    const manifest = await response.json();
    return setRuntimeAppRegistry(buildAppRegistryFromManifest(manifest));
  } catch (error) {
    if (allowDefaultRegistryFallback) {
      console.warn('[main] fallback to default app registry (dev):', error);
      return setRuntimeAppRegistry(defaultAppRegistry);
    }

    throw new Error(
      'Failed to load runtime app manifest in non-local environment: ' +
        (error && error.message ? error.message : String(error))
    );
  }
}
