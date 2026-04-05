import { PORTAL_APP_NAME } from '../constants/app-constants';

export function createPortalStore(pageKey = 'home') {
  return {
    appName: PORTAL_APP_NAME,
    pageKey,
    ready: true,
  };
}
