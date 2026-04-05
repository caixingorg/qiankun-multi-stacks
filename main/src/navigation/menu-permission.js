// Permission helpers keep menu visibility and route access checks aligned.
import { hasPermission } from '../context/permission-context.js';
import { routePermissionMap } from './menu-config.js';

export function filterMenuByPermissions(menuItems, permissionContext) {
  return menuItems.filter((item) => {
    if (!item.permission) {
      return true;
    }

    return hasPermission(permissionContext, item.permission);
  });
}

export function canAccessRoute(pathname, permissionContext) {
  const routePath = Object.keys(routePermissionMap).find((item) => pathname === item || pathname.startsWith(item + '/'));

  if (!routePath) {
    return true;
  }

  return hasPermission(permissionContext, routePermissionMap[routePath]);
}
