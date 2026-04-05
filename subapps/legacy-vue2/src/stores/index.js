import { LEGACY_APP_NAME } from '../constants/app-constants';

export function createLegacyStore(pageKey = 'home') {
  return {
    appName: LEGACY_APP_NAME,
    pageKey,
    ready: true,
  };
}
