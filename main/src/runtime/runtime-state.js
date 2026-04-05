// resolveRuntimeState parses runtime query params used by rollback and failure
// simulation flows.
import { ReleaseChannels } from './release-model.js';
import { getMainConfig } from '../services/config-service.js';

export function resolveRuntimeState(search = window.location.search, runtimeConfig = getMainConfig(search)) {
  const params = new URLSearchParams(search);
  const requestedChannel = params.get('channel');
  const autoRollback = params.get('autoRollback') === '1';
  const allowManualRollbackSwitch = runtimeConfig && runtimeConfig.allowManualRollbackSwitch;
  const allowForcedFailure = runtimeConfig && runtimeConfig.allowForcedFailure;
  const channel = (autoRollback || allowManualRollbackSwitch) && requestedChannel === ReleaseChannels.rollback
    ? ReleaseChannels.rollback
    : ReleaseChannels.stable;

  return {
    channel,
    rollbackApp: autoRollback || allowManualRollbackSwitch ? (params.get('rollbackApp') || '') : '',
    autoRollback,
    failApp: allowForcedFailure ? (params.get('failApp') || '') : ''
  };
}

export const resolveChannelState = resolveRuntimeState;
