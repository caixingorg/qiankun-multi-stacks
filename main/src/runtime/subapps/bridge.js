// bridge.js — Host 能力桥接层
//
// createBridge(props, appId) 将 qiankun 注入的 props 打包为子应用可调用的
// 标准化接口——子应用不需要知道 props 的具体字段名，只需调用 bridge 方法。
//
// 和 bridge 打交道的能力：sharedKernel、导航、依赖策略、qiankun 全局状态、Bus 事件
import {
  getDependencyPolicy,
  getHostNavigation,
  getHostSharedKernel,
} from './props.js';
import { HostEvents, SubappEvents } from '../../communication/events.js';

export function createBridge(props, appId) {
  // 从 props 中提取三个子应用最常用的能力对象
  const sharedKernel = getHostSharedKernel(props);
  const navigation = getHostNavigation(props);
  const dependencyPolicy = getDependencyPolicy(props);

  return {
    sharedKernel,
    navigation,
    dependencyPolicy,

    // 注册 qiankun GlobalState 监听，并将当前子应用名写入全局状态
    registerGlobalState(cleanupBag, activeSubApp) {
      if (!(props.actions && props.actions.onGlobalStateChange)) {
        return;
      }

      const off = props.actions.onGlobalStateChange((state, prev) => {
        console.log('[' + appId + '] global state changed:', state, prev);
      }, true);

      cleanupBag.add(() => off && off());
      props.actions.setGlobalState({ activeSubApp });
    },

    // 注册 Host 广播监听，以便 Host 将全局消息下发到子应用
    registerHostBroadcast(cleanupBag, handler) {
      if (!(props.bus && props.bus.on)) {
        return;
      }

      const off = props.bus.on(HostEvents.hostBroadcast, handler);
      cleanupBag.add(() => off && off());
    },

    // 向 Host 发布子应用已完成挂载事件
    emitMounted() {
      if (props.bus && props.bus.emit) {
        props.bus.emit(SubappEvents.mounted, {
          app: appId,
          message: 'mounted'
        });
      }
    },

    // 向 Host 上报运行时错误，供 Host 决定是否触发回滚
    emitRuntimeError({ stage = 'unknown', error, extra = {} } = {}) {
      if (!(props.bus && props.bus.emit)) {
        return;
      }

      props.bus.emit(SubappEvents.runtimeError, {
        app: props.appName || appId,
        stage,
        scope: 'subapp-runtime',
        message: error && error.message ? error.message : String(error),
        ...extra,
      });
    }
  };
}

// 别名，向后兼容旧调用方
export const createHostBridge = createBridge;
