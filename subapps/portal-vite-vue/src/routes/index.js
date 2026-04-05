export const portalRoutes = {
  home: '/workspace',
  detail: '/workspace/announcements',
};

function findPortalRoute(pathname = '') {
  return Object.entries(portalRoutes)
    .sort((left, right) => right[1].length - left[1].length)
    .find(([, routePath]) => pathname.endsWith(routePath));
}

export function resolvePortalPageKey(pathname = '') {
  const matchedRoute = findPortalRoute(pathname);
  return matchedRoute ? matchedRoute[0] : 'home';
}

export function buildPortalInternalPath(pathname = '', pageKey = 'home') {
  const targetPath = portalRoutes[pageKey] || portalRoutes.home;
  const matchedRoute = findPortalRoute(pathname);

  if (!matchedRoute) {
    return targetPath;
  }

  const currentRoutePath = matchedRoute[1];
  const basePath = pathname.slice(0, pathname.length - currentRoutePath.length);
  return (basePath || '') + targetPath;
}
