import { assertMainContract } from '../../main/src/shared/host-adapters/assert-main-contract.js';

const mockProps = {
  userContext: { id: 'u-001', name: 'tester' },
  envContext: { envName: 'local', apiBaseUrl: '/api', releaseChannel: 'stable' },
  permissionContext: { permissions: ['main:view'] },
  navigation: {},
  sharedKernel: {},
  dependencyPolicy: {},
  contractVersion: 'v1',
};

assertMainContract(mockProps);

console.log('[contracts] bridge contracts validation passed');
