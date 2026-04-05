// Env context resolves the effective environment from runtime config and keeps
// that decision in one place for the rest of main.
import { getMainConfig } from '../services/config-service.js';

export function createEnvContext() {
  return getMainConfig();
}
