export const opsRoutes = {
  home: '/dashboard',
  detail: '/dashboard/insights',
};

function findOpsRoute(pathname = '') {
  return Object.entries(opsRoutes)
    .sort((left, right) => right[1].length - left[1].length)
    .find(([, routePath]) => pathname.endsWith(routePath));
}

export function resolveOpsPageKey(pathname = '') {
  const matchedRoute = findOpsRoute(pathname);
  return matchedRoute ? matchedRoute[0] : 'home';
}

export function buildOpsInternalPath(pathname = '', pageKey = 'home') {
  const targetPath = opsRoutes[pageKey] || opsRoutes.home;
  const matchedRoute = findOpsRoute(pathname);

  if (!matchedRoute) {
    return targetPath;
  }

  const currentRoutePath = matchedRoute[1];
  const basePath = pathname.slice(0, pathname.length - currentRoutePath.length);
  return (basePath || '') + targetPath;
}
