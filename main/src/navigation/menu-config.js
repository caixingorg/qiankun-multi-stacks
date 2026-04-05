// Menu config is derived from app-registry so route paths, titles, and
// permission codes have a single source of truth. Adding or removing a
// subapp from app-registry.mjs automatically updates the shell menu.
import { appRegistry } from '../runtime/app-registry.js';

export const mainMenuConfig = appRegistry.map((app) => ({
  key: app.key,
  title: app.title,
  path: app.activeRule,
  permission: app.permission,
}));

export const routePermissionMap = mainMenuConfig.reduce((result, item) => {
  result[item.path] = item.permission;
  return result;
}, {});
