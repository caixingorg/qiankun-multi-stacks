// App context bundles the main-owned runtime state that must be shared across
// the shell and every subapp. It is assembled once by createMainContext().
import { CONTRACT_VERSION } from './constants/app-contracts.js';

export function createAppContext({
  user,
  envContext,
  auth,
  permissionContext,
  requestClient,
}) {
  // 这里不再自行创建 env / permission / request 单例。
  // createMainContext() 已经把它们组装好，本函数只负责打包成一个
  // 可被 shell 与 subapp 共同消费的 Host 上下文对象。
  return {
    user,
    env: envContext && envContext.envName ? envContext.envName : 'local',
    envContext,
    auth,
    permissionContext,
    requestClient,
    contractVersion: CONTRACT_VERSION,
    permissions:
      permissionContext && Array.isArray(permissionContext.permissions)
        ? permissionContext.permissions
        : [],
  };
}
