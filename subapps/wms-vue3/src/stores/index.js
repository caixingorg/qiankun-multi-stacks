import { WMS_APP_NAME } from '../constants/app-constants';

export function createWmsStore(pageKey = 'home') {
  return {
    appName: WMS_APP_NAME,
    pageKey,
    ready: true,
  };
}
