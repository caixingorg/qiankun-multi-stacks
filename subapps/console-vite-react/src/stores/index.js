import { CONSOLE_APP_NAME } from '../constants/app-constants';

export function createConsoleStore(pageKey = 'home') {
  return {
    appName: CONSOLE_APP_NAME,
    pageKey,
    ready: true,
  };
}
