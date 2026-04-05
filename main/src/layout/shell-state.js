// buildRuntimeSummary creates the small runtime status view model shown by the
// shell. Lives in layout/ because it directly feeds the shell component tree.
import { getReleasePolicySummary } from '../runtime/rollback-policy.js';

export function buildRuntimeSummary({ appRegistry, channel, rollbackSummary }) {
  const releasePolicySummary = getReleasePolicySummary(appRegistry);

  return {
    channel,
    rollbackModeText: rollbackSummary.sharedEntryApps.length
      ? 'Current rollback policy: shared entry for ' + rollbackSummary.sharedEntryApps.join(', ') + '.'
      : 'Current rollback policy: dedicated rollback entries configured.',
    dedicatedApps: releasePolicySummary
      .filter((item) => item.supportsDedicatedRollback)
      .map((item) => item.title)
      .join(', '),
  };
}
