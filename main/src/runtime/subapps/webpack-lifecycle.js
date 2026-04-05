// createWebpackSubapp — 封装 webpack 构建子应用的 qiankun 生命周期胶水
//
// 职责：
//   - 在 bootstrap / mount / unmount 三个阶段调用调用方提供的钩子
//   - 统一创建 cleanupBag 和 hostBridge，确保资源不泄漏
//   - mount 或 unmount 抛出异常时通过 hostBridge 上报错误，再向上重抛
//
// 注意：currentContext 仅在 mount 成功后才被赋值；unmount 完成后清空，
// 防止因 mount 失败导致 unmount 阶段访问到脏数据。
import { createCleanup } from './cleanup.js';
import { createBridge } from './bridge.js';

export function createWebpackSubapp({
  appId,
  activeSubApp,
  onBootstrap,
  onMount,
  onUnmount
}) {
  // currentContext 保存本次 mount 期间创建的上下文，unmount 时读取
  let currentContext = null;

  return {
    // ── bootstrap：子应用首次加载时触发，只执行一次 ──────────────────────────
    async bootstrap() {
      console.log('[' + appId + '] bootstrap');
      if (typeof onBootstrap === 'function') {
        await onBootstrap();
      }
    },

    // ── mount：每次路由激活该子应用时触发 ────────────────────────────────────
    async mount(props) {
      console.log('[' + appId + '] mount', props);

      // cleanupBag 收集本次 mount 期间注册的所有监听器/定时器，unmount 时统一释放
      const cleanupBag = createCleanup();
      // hostBridge 将 qiankun props 封装为子应用能调用的 Host 能力接口
      const hostBridge = createBridge(props, appId);

      // 注册 qiankun 全局状态监听，通知 Host 该子应用已激活
      hostBridge.registerGlobalState(cleanupBag, activeSubApp);
      // 注册 Host Broadcast 监听，子应用可接收 Host 广播消息
      hostBridge.registerHostBroadcast(cleanupBag, (payload) => {
        console.log('[' + appId + '] bus message from host:', payload);
      });
      // 告知 Host 本子应用已完成挂载
      hostBridge.emitMounted();

      currentContext = {
        appId,
        activeSubApp,
        cleanupBag,
        hostBridge,
        props
      };

      try {
        if (typeof onMount === 'function') {
          await onMount(currentContext);
        }
      } catch (error) {
        // mount 失败：先上报错误，再尝试 flush cleanupBag，最后重抛
        let pendingError = error;
        hostBridge.emitRuntimeError({
          stage: 'mount',
          error,
        });
        try {
          cleanupBag.flush();
        } catch (flushError) {
          hostBridge.emitRuntimeError({
            stage: 'mount-cleanup',
            error: flushError,
          });
          pendingError = pendingError || flushError;
        }
        currentContext = null;
        throw pendingError;
      }
    },

    // ── unmount：路由离开该子应用时触发 ─────────────────────────────────────
    async unmount() {
      console.log('[' + appId + '] unmount');

      let pendingError = null;

      try {
        if (typeof onUnmount === 'function' && currentContext) {
          await onUnmount(currentContext);
        }
      } catch (error) {
        // 上报 unmount 阶段错误，但不阻断后续 cleanupBag flush
        if (currentContext && currentContext.hostBridge) {
          currentContext.hostBridge.emitRuntimeError({
            stage: 'unmount',
            error,
          });
        }
        pendingError = error;
      }

      // 无论 unmount 钩子是否成功，都必须 flush cleanupBag 以释放所有资源
      if (currentContext && currentContext.cleanupBag) {
        try {
          currentContext.cleanupBag.flush();
        } catch (flushError) {
          if (currentContext.hostBridge) {
            currentContext.hostBridge.emitRuntimeError({
              stage: 'unmount-cleanup',
              error: flushError,
            });
          }
          pendingError = pendingError || flushError;
        }
      }

      // 清空 currentContext，防止下次 mount 前被误读
      currentContext = null;

      if (pendingError) {
        throw pendingError;
      }
    }
  };
}

// 别名，向后兼容旧调用方
export const createWebpackMicroApp = createWebpackSubapp;
