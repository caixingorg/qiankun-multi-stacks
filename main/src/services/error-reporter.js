// createRuntimeErrorReporter is a thin wrapper over the logger so runtime
// failures keep one reporting shape. Lives in services/ alongside logger.js.
export function createRuntimeErrorReporter(logger) {
  return {
    report(error, context = {}) {
      if (logger && logger.error) {
        const rawMessage = error && error.message ? error.message : String(error);
        logger.error('runtime-error', {
          scope: context.scope || 'main-runtime',
          stage: context.stage || 'unknown',
          channel: context.channel || 'stable',
          activeSubApp: context.activeSubApp || '',
          envName: context.envName || 'unknown',
          severity: context.severity || 'error',
          rawMessage,
          ...context,
        });
      }
    },
  };
}

export const createErrorReporter = createRuntimeErrorReporter;
