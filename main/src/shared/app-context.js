// App context bundles the main-owned runtime state that must be shared across
// the shell and every subapp. It is assembled once by createMainContext().
import { CONTRACT_VERSION } from './constants/app-contracts.js';

export function createAppContext({
  user,
  envContext,
  auth,
  permissionContext,
  requestClient,
}) {
  return {
    user,
    env: envContext && envContext.envName ? envContext.envName : 'local',
    envContext,
    auth,
    permissionContext,
    requestClient,
    contractVersion: CONTRACT_VERSION,
    permissions:
      permissionContext && Array.isArray(permissionContext.permissions)
        ? permissionContext.permissions
        : [],
  };
}
