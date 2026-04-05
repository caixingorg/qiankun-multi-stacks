export const wmsRoutes = {
  home: '/wave/board',
  detail: '/wave/tasks',
};

function findWmsRoute(pathname = '') {
  return Object.entries(wmsRoutes)
    .sort((left, right) => right[1].length - left[1].length)
    .find(([, routePath]) => pathname.endsWith(routePath));
}

export function resolveWmsPageKey(pathname = '') {
  const matchedRoute = findWmsRoute(pathname);
  return matchedRoute ? matchedRoute[0] : 'home';
}

export function buildWmsInternalPath(pathname = '', pageKey = 'home') {
  const targetPath = wmsRoutes[pageKey] || wmsRoutes.home;
  const matchedRoute = findWmsRoute(pathname);

  if (!matchedRoute) {
    return targetPath;
  }

  const currentRoutePath = matchedRoute[1];
  const basePath = pathname.slice(0, pathname.length - currentRoutePath.length);
  return (basePath || '') + targetPath;
}
