// Entry resolver chooses the actual child-app entry URL based on the current
// release channel and rollback target.
import { ReleaseChannels } from './release-model.js';
import { supportsDedicatedRollback } from './rollback-policy.js';

function shouldUseRollbackEntry(app, channelState) {
  const channel = channelState && channelState.channel
    ? channelState.channel
    : ReleaseChannels.stable;

  if (channel !== ReleaseChannels.rollback) {
    return false;
  }

  if (!supportsDedicatedRollback(app)) {
    return false;
  }

  if (channelState && channelState.rollbackApp) {
    return channelState.rollbackApp === app.key;
  }

  return true;
}

export function resolveAppEntry(app, channelState) {
  if (shouldUseRollbackEntry(app, channelState)) {
    return app.entries.rollback || app.entries.stable;
  }

  return app.entries.stable;
}

export function resolveRuntimeEntry(app, channelState) {
  const entry = resolveAppEntry(app, channelState);

  if (
    channelState &&
    channelState.channel === ReleaseChannels.stable &&
    channelState.failApp === app.key
  ) {
    return entry + '/__forced_failure__';
  }

  return entry;
}
