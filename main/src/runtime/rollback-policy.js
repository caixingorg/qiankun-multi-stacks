// Rollback policy helpers describe which apps support dedicated rollback and
// which still share one stable entry.
import { RollbackModes } from './release-model.js';

export function supportsDedicatedRollback(app) {
  return app && app.rollbackMode === RollbackModes.dedicatedEntry;
}

export function supportsSharedEntryRollback(app) {
  return app && app.rollbackMode === RollbackModes.sharedEntry;
}

export function getReleasePolicySummary(appRegistry) {
  return appRegistry.map((app) => ({
    key: app.key,
    title: app.title,
    rollbackMode: app.rollbackMode,
    supportsDedicatedRollback: supportsDedicatedRollback(app),
    supportsSharedEntryRollback: supportsSharedEntryRollback(app),
    rollbackValidationPath: app.rollbackValidationPath || ''
  }));
}
