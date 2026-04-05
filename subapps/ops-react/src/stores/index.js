import { OPS_APP_NAME } from '../constants/app-constants';

export function createOpsStore(pageKey = 'home') {
  return {
    appName: OPS_APP_NAME,
    pageKey,
    ready: true,
  };
}
