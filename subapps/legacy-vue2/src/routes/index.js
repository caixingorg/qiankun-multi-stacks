export const legacyRoutes = {
  home: '/orders/pending',
  detail: '/orders/history',
};

function findLegacyRoute(pathname = '') {
  return Object.entries(legacyRoutes)
    .sort((left, right) => right[1].length - left[1].length)
    .find(([, routePath]) => pathname.endsWith(routePath));
}

export function resolveLegacyPageKey(pathname = '') {
  const matchedRoute = findLegacyRoute(pathname);
  return matchedRoute ? matchedRoute[0] : 'home';
}

export function buildLegacyInternalPath(pathname = '', pageKey = 'home') {
  const targetPath = legacyRoutes[pageKey] || legacyRoutes.home;
  const matchedRoute = findLegacyRoute(pathname);

  if (!matchedRoute) {
    return targetPath;
  }

  const currentRoutePath = matchedRoute[1];
  const basePath = pathname.slice(0, pathname.length - currentRoutePath.length);
  return (basePath || '') + targetPath;
}
