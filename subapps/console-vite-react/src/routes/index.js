export const consoleRoutes = {
  home: '/audit-log',
  detail: '/audit-log/alerts',
};

function findConsoleRoute(pathname = '') {
  return Object.entries(consoleRoutes)
    .sort((left, right) => right[1].length - left[1].length)
    .find(([, routePath]) => pathname.endsWith(routePath));
}

export function resolveConsolePageKey(pathname = '') {
  const matchedRoute = findConsoleRoute(pathname);
  return matchedRoute ? matchedRoute[0] : 'home';
}

export function buildConsoleInternalPath(pathname = '', pageKey = 'home') {
  const targetPath = consoleRoutes[pageKey] || consoleRoutes.home;
  const matchedRoute = findConsoleRoute(pathname);

  if (!matchedRoute) {
    return targetPath;
  }

  const currentRoutePath = matchedRoute[1];
  const basePath = pathname.slice(0, pathname.length - currentRoutePath.length);
  return (basePath || '') + targetPath;
}
