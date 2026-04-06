// create-subapp-host-props.js — Host 注入 props 统一构造器
//
// 目标：
//   1. route mount 和 dynamic mount 共用同一套 props shape
//   2. Host 仍然是 props 所有者，子应用只消费，不参与拼装
//   3. dynamic mount 允许附加少量 Host 自己的运行时元数据（如 slotKey）

function createDynamicMountActions(actions) {
  if (!actions) {
    return actions;
  }

  return {
    ...actions,
    setGlobalState(payload = {}) {
      const nextPayload = { ...payload };

      // dynamic mount 不允许子应用改写 route 语义下的 activeSubApp。
      // Host 如果需要表达动态实例状态，应使用 slotKey / extraProps 等
      // Host-owned 元数据，而不是复用全局 route 激活字段。
      if ('activeSubApp' in nextPayload) {
        delete nextPayload.activeSubApp;
      }

      // payload 被剥空时直接短路，避免无意义写入 globalState。
      if (!Object.keys(nextPayload).length) {
        return true;
      }

      if (typeof actions.setGlobalState === 'function') {
        return actions.setGlobalState(nextPayload);
      }

      return true;
    },
  };
}

export function createSubappHostProps({
  app,
  actions,
  bus,
  sharedKernel,
  mainContext,
  governedNavigation,
  dependencyPolicy,
  mountMode = 'route',
  slotKey = '',
  extraProps = {},
}) {
  // 统一输出给子应用的 Host props 结构。
  // route mount 与 dynamic mount 只在 mountMode / slotKey / actions 代理上有差异，
  // 其余平台能力（sharedKernel、navigation、context）必须保持一致。
  return {
    fromHost: mountMode === 'dynamic' ? 'qiankun dynamic host' : 'qiankun host',
    mountMode,
    slotKey,
    actions: mountMode === 'dynamic' ? createDynamicMountActions(actions) : actions,
    bus,
    sharedKernel,
    userContext: mainContext.user,
    envContext: mainContext.envContext,
    permissionContext: mainContext.permissionContext,
    contractVersion: mainContext.contractVersion,
    navigation: governedNavigation,
    dependencyPolicy,
    appName: app.name,
    ...extraProps,
  };
}
