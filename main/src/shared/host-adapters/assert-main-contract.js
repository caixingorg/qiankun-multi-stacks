import { CONTEXT_CONTRACT, CONTRACT_VERSION } from '../constants/app-contracts.js';

export function assertMainContract(props) {
  const missingKeys = CONTEXT_CONTRACT.requiredKeys.filter((key) => !(key in (props || {})));

  if (missingKeys.length) {
    throw new Error('Main contract missing keys: ' + missingKeys.join(', '));
  }

  if (props.contractVersion !== CONTRACT_VERSION) {
    throw new Error(
      'Main contract version mismatch: expected ' +
      CONTRACT_VERSION +
      ', got ' +
      String(props.contractVersion)
    );
  }

  return true;
}
