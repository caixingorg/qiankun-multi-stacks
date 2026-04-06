// dynamic-mount-manager.js — Host-owned qiankun 动态挂载管理器
//
// 职责：
//   1. 通过 loadMicroApp 动态挂载已注册子应用
//   2. 用 slotKey 管理实例生命周期，避免 Host 自己散落地持有实例引用
//   3. 复用现有 registry / entry 解析 / host props 契约
//
// 边界：
//   - 不替代 registerMicroApps 的 route mount 主路径
//   - 不做 keep-alive、多实例编排或缓存恢复
//   - 只提供 Host 自己调用的 mount / update / unmount 能力
import { loadMicroApp } from 'qiankun';
import { getAppByKey } from './app-registry.js';
import { createSubappHostProps } from './create-subapp-host-props.js';

let activeDynamicMountManager = null;

export function createDynamicMountManager({
  appRegistry,
  actions,
  bus,
  sharedKernel,
  mainContext,
  governedNavigation,
  dependencyPolicy,
  logger,
  resolveRuntimeEntry,
  channelState,
  loadApp = loadMicroApp,
}) {
  // mountedApps: slotKey -> { app, microApp }
  // Host 只通过 slotKey 识别动态实例，不直接暴露底层 qiankun 实例缓存结构。
  const mountedApps = new Map();

  function getRegisteredApp(appKey) {
    const app = getAppByKey(appKey, appRegistry);

    if (!app) {
      throw new Error('Unknown dynamic mount target: ' + appKey);
    }

    return app;
  }

  async function unmountSlot(slotKey) {
    const mounted = mountedApps.get(slotKey);

    if (!mounted) {
      return false;
    }

    // 动态实例的卸载必须显式 await，保证 Host 在切换 slot 时不会残留旧实例。
    await mounted.microApp.unmount();
    mountedApps.delete(slotKey);

    if (logger && logger.info) {
      logger.info('dynamic-unmount', {
        app: mounted.app.name,
        slotKey,
      });
    }

    return true;
  }

  return {
    async mount({ slotKey, appKey, container, props = {}, singular = false } = {}) {
      if (!slotKey) {
        throw new Error('Dynamic mount requires slotKey');
      }

      if (!container) {
        throw new Error('Dynamic mount requires container');
      }

      const app = getRegisteredApp(appKey);

      // 同一个 slotKey 重挂载时，先卸载旧实例，再挂新实例。
      // 这样 Host 不需要额外判断“当前 slot 上是不是已经有 app”。
      await unmountSlot(slotKey);

      const microApp = loadApp(
        {
          name: app.name + '__dynamic__' + slotKey,
          entry: resolveRuntimeEntry(app, channelState),
          container,
          props: createSubappHostProps({
            app,
            actions,
            bus,
            sharedKernel,
            mainContext,
            governedNavigation,
            dependencyPolicy,
            mountMode: 'dynamic',
            slotKey,
            // extraProps 保留给 Host 页面注入自己的运行时场景信息，
            // 例如 hostScene、panelMode、业务筛选条件等。
            extraProps: props,
          }),
        },
        {
          singular,
          sandbox: {
            experimentalStyleIsolation: true,
          },
        }
      );

      mountedApps.set(slotKey, {
        app,
        microApp,
      });

      if (logger && logger.info) {
        logger.info('dynamic-mount', {
          app: app.name,
          slotKey,
        });
      }

      return microApp;
    },

    async update(slotKey, payload = {}) {
      const mounted = mountedApps.get(slotKey);

      if (!mounted) {
        throw new Error('Unknown dynamic mount slot: ' + slotKey);
      }

      if (typeof mounted.microApp.update === 'function') {
        // 只在底层实例支持 update() 时转发，避免强行要求所有子应用都实现 update。
        await mounted.microApp.update(payload);
        return true;
      }

      return false;
    },

    async unmount(slotKey) {
      return unmountSlot(slotKey);
    },

    async unmountAll() {
      for (const slotKey of Array.from(mountedApps.keys())) {
        await unmountSlot(slotKey);
      }
    },

    getMountedApps() {
      return Array.from(mountedApps.entries()).map(([slotKey, mounted]) => ({
        slotKey,
        appKey: mounted.app.key,
        appName: mounted.app.name,
      }));
    },
  };
}

export function setDynamicMountManager(manager) {
  // 主应用启动时写入当前 manager，供 Host 页面后续直接读取。
  activeDynamicMountManager = manager;
  return activeDynamicMountManager;
}

export function getDynamicMountManager() {
  if (!activeDynamicMountManager) {
    throw new Error('Dynamic mount manager has not been initialized by main bootstrap.');
  }

  return activeDynamicMountManager;
}

export function clearDynamicMountManager() {
  // 主应用 cleanup 时清空全局引用，避免热重载或重挂载时残留旧 manager。
  activeDynamicMountManager = null;
}
