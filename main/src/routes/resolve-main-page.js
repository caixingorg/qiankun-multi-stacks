// resolveMainPage decides whether the shell should show one of its own pages
// or yield the content area to a child micro frontend.
import { getRuntimeAppRegistry } from '../runtime/app-registry.js';
import { canAccessRoute } from '../navigation/menu-permission.js';
import { mainRoutes } from './index.js';

function matchSubappRoute(pathname = '', appRegistry = getRuntimeAppRegistry()) {
  return appRegistry.find((app) => pathname === app.activeRule || pathname.startsWith(app.activeRule + '/')) || null;
}

export function resolveMainPageState(
  pathname = window.location.pathname,
  permissionContext,
  appRegistry = getRuntimeAppRegistry()
) {
  if (pathname === mainRoutes.home) {
    return {
      pageType: 'home',
      reason: 'home',
      app: null,
    };
  }

  if (pathname === mainRoutes.error) {
    return {
      pageType: 'error',
      reason: 'explicit-error',
      app: null,
    };
  }

  const matchedApp = matchSubappRoute(pathname, appRegistry);

  if (!matchedApp) {
    return {
      pageType: 'error',
      reason: 'not-found',
      app: null,
    };
  }

  if (permissionContext && !canAccessRoute(pathname, permissionContext)) {
    return {
      pageType: 'error',
      reason: 'forbidden',
      app: matchedApp,
    };
  }

  return {
    pageType: 'subapp',
    reason: 'subapp',
    app: matchedApp,
  };
}

export function resolveMainPage(pathname = window.location.pathname, permissionContext, appRegistry = getRuntimeAppRegistry()) {
  return resolveMainPageState(pathname, permissionContext, appRegistry).pageType;
}
