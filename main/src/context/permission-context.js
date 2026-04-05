// Permission context holds the global permission list owned by main.
// 权限列表唯一来源是 context/index.js（从登录接口或 SSO 返回的数据构建）。
// default 参数设为空数组，避免与 index.js 中的声明产生两处维护的歧义。
export function createPermissionContext(permissions = []) {
  return {
    permissions,
  };
}

export function hasPermission(permissionContext, permission) {
  const permissions = permissionContext && Array.isArray(permissionContext.permissions)
    ? permissionContext.permissions
    : [];

  return permissions.includes(permission);
}
