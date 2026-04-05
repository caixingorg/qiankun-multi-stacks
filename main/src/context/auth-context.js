// Auth context records who owns login state, permission ownership, and token
// injection in the current template.
export function createAuthContext(userContext, envContext) {
  const token =
    typeof window !== 'undefined' && window.__MAIN_AUTH_TOKEN__
      ? String(window.__MAIN_AUTH_TOKEN__)
      : '';
  const hasAuthenticatedUser =
    Boolean(userContext) &&
    userContext.authenticated !== false &&
    userContext.id !== 'anonymous';

  return {
    loginState: hasAuthenticatedUser && token ? 'authenticated' : 'anonymous',
    loginOwner: 'main',
    permissionOwner: 'main',
    tokenInjectionOwner: 'main-request-client',
    sessionId: token ? 'session-token-present' : 'session-missing-token',
    envName: envContext && envContext.envName ? envContext.envName : 'local',
  };
}
