// Main context is the composition root for user, auth, env, and permissions.
import { createAuthContext } from './auth-context.js';
import { createEnvContext } from './env-context.js';
import { createPermissionContext } from './permission-context.js';
import { createUserContext } from './user-context.js';
import { createRequestClient } from '../services/request-client.js';
import { createAppContext } from '../shared/app-context.js';

export function createMainContext() {
  const user = createUserContext();
  const envContext = createEnvContext();
  const permissionContext = createPermissionContext([
    'main:view',
    'legacy:view',
    'wms:view',
    'ops:view',
    'portal:view',
    'console:view',
  ]);
  const auth = createAuthContext(user, envContext);
  const requestClient = createRequestClient({
    envContext,
    userContext: user,
  });

  return createAppContext({
    user,
    envContext,
    auth,
    permissionContext,
    requestClient,
  });
}
