// main.js — 主应用 Shell 编排入口
// 职责：加载运行时配置、渲染 Shell 布局、注册子应用、处理导航与运行时错误。
// 这是唯一允许调用 qiankun start() 的地方，所有子应用的生命周期从此处流出。

// ─── qiankun 核心 API ────────────────────────────────────────────────────────
import {
  addGlobalUncaughtErrorHandler,
  initGlobalState,
  start,
} from 'qiankun';

// ─── 通信层 ──────────────────────────────────────────────────────────────────
import { HostEvents, SubappEvents } from './communication/events.js';

// ─── 运行时注册表 ─────────────────────────────────────────────────────────────
import { getAppByRoute, getRollbackSummary } from './runtime/app-registry.js';

// ─── 基础设施 ────────────────────────────────────────────────────────────────
import { createEventBus } from './communication/event-bus.js';
import { createMainContext } from './context/index.js';
import { createLogger } from './services/logger.js';
import { createRuntimeErrorReporter } from './services/error-reporter.js';

// ─── 布局 & Shell 状态 ───────────────────────────────────────────────────────
import { renderLayout } from './layout/render-layout.jsx';
import { buildRuntimeSummary } from './layout/shell-state.js';

// ─── 导航 ────────────────────────────────────────────────────────────────────
import { createNavigationService } from './navigation/navigate-service.js';

// ─── 运行时策略 ───────────────────────────────────────────────────────────────
import { dependencyPolicy } from './shared/constants/dependency-policy.js';
import { loadRuntimeAppRegistry } from './runtime/load-app-manifest.js';
import { resolveRuntimeState } from './runtime/runtime-state.js';
import { resolveRuntimeEntry } from './runtime/resolve-app-entry.js';
import { supportsDedicatedRollback } from './runtime/rollback-policy.js';
import { registerSubapps } from './runtime/register-subapps.js';
import { handleRuntimeRollback } from './runtime/handle-runtime-rollback.js';
import {
  clearDynamicMountManager,
  createDynamicMountManager,
  setDynamicMountManager,
} from './runtime/dynamic-mount-manager.js';

// ─── 共享内核（暴露给子应用的能力面） ──────────────────────────────────────────
import { createSharedKernel } from './shared/shared-kernel.js';

// ─── Shell 状态仓库（zustand） ───────────────────────────────────────────────
import { useShellStore } from './store/shell-store.js';

import './styles/globals.css';

const hostLogger = createLogger('main-app');
const hostErrorReporter = createRuntimeErrorReporter(hostLogger);

async function bootstrapMain() {
  // ── 1. 加载运行时子应用注册表（优先远程 manifest；仅 localhost 允许回退 dev 默认值） ──
  const appRegistry = await loadRuntimeAppRegistry();

  // ── 2. 解析发布通道（stable / rollback），决定本次使用哪套入口 ──────────────
  const channelState = resolveRuntimeState();
  const channel = channelState.channel;

  // ── 3. 初始化基础设施：事件总线、日志、错误上报 ───────────────────────────
  const bus = createEventBus();
  const logger = hostLogger;
  const errorReporter = hostErrorReporter;

  // ── 4. 构建主应用上下文（用户、环境、认证、权限列表） ─────────────────────
  //    This object is the single source of truth for shell and subapp context.
  const mainContext = createMainContext();

  // ── 5. 构建 SharedKernel（注入预建实例，避免内部重复构造） ────────────────
  //    Shell 与所有子应用通过 getEnvContext() / getPermissionContext() 拿到
  //    同一个对象引用，不会出现多实例导致的状态不一致问题。
  const sharedKernel = createSharedKernel({
    user: mainContext.user,
    envContext: mainContext.envContext,
    permissionContext: mainContext.permissionContext,
    requestClient: mainContext.requestClient,
    contractVersion: mainContext.contractVersion,
  });

  // ── 6. qiankun 全局状态（仅用于子应用轻量级感知当前激活应用） ─────────────
  //    所有权归 main，子应用只读，不得直接修改。
  //    注意：hostState 不包含 activeSubApp 可变字段——该字段由 zustand store
  //    （Shell UI 数据源）和 actions.setGlobalState（子应用感知）分别维护，
  //    不需要第三个可变引用。
  const hostState = {
    user: mainContext.user,
    channel,
  };

  // 根据当前路径从注册表中找到对应子应用描述符
  function resolveCurrentApp() {
    return getAppByRoute(window.location.pathname, appRegistry);
  }

  const actions = initGlobalState(hostState);

  // ── 7. 导航服务（封装 pushState / bus 联动，禁止子应用直接操作 history） ──
  const governedNavigation = createNavigationService({
    bus,
    channel,
    getHostState() {
      return hostState;
    },
  });

  const dynamicMountManager = setDynamicMountManager(
    createDynamicMountManager({
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
    })
  );

  // ── 8. 构建初始运行时摘要，写入 shell-store ────────────────────────────────
  //    store 成为所有 Layout 组件的单一数据源；后续变更通过 store action 写入，
  //    订阅了 useShellStore 的组件会自动重渲染，无需再调用 renderShell()。
  const initialSummary = buildRuntimeSummary({
    appRegistry,
    channel,
    rollbackSummary: getRollbackSummary(appRegistry),
  });
  useShellStore.getState().initRuntimeSummary(initialSummary);

  // renderShell：重新计算 URL 相关状态（菜单/页面类型）并写入 store；
  // 首次调用时同时创建 React root。之后 store 变化由 React 自动处理。
  function renderShell() {
    renderLayout(mainContext.permissionContext);
  }

  // updateRuntimeSummary：只更新运行时摘要字段，不涉及 URL 状态，
  // 直接写 store 即可，无需调用 renderShell()。
  function updateRuntimeSummary(partialSummary) {
    useShellStore.getState().updateRuntimeSummary(partialSummary);
  }

  // ── 9. 首次渲染 Shell（创建 React root，计算初始菜单/页面状态） ───────────
  renderShell();

  // ── 10. 注册监听器，并统一收集卸载函数 ──────────────────────────────────
  //    所有监听器必须在此处登记，确保 bootstrapMain 可被重入（如测试场景）
  //    或在需要时执行干净的卸载路径。
  const shellCleanups = [];

  // 路由变化时重渲染（qiankun 无路由库时依赖 popstate）
  const onPopstate = () => renderShell();
  window.addEventListener('popstate', onPopstate);
  shellCleanups.push(() => window.removeEventListener('popstate', onPopstate));

  // 子应用主动通知 Host（仅记录日志，Host 不做响应）
  shellCleanups.push(
    bus.on(HostEvents.subappNotify, (payload) => {
      logger.info('subapp-notify', payload);
    })
  );

  // Host 接收自身发出的导航指令回执（用于调试链路追踪）
  shellCleanups.push(
    bus.on(HostEvents.hostNavigation, (payload) => {
      logger.info('host-navigation', payload);
    })
  );

  // 子应用运行时错误：记录日志并更新 Shell 提示文案
  shellCleanups.push(
    bus.on(SubappEvents.runtimeError, (payload) => {
      errorReporter.report(new Error(payload.message || 'Unknown subapp runtime error'), {
        scope: payload.scope || 'subapp-runtime',
        stage: payload.stage || 'unknown',
        channel,
        activeSubApp: payload.app || useShellStore.getState().activeSubApp,
        envName: mainContext.envContext.envName,
        severity: 'error',
      });
      updateRuntimeSummary({
        rollbackModeText:
          'Recent subapp runtime error: ' +
          payload.app +
          ' failed during ' +
          payload.stage +
          '. Check host logs before deciding whether rollback is required.',
      });
    })
  );

  // ── 11. 向 qiankun 注册全部子应用 ───────────────────────────────────────
  registerSubapps({
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
    onBeforeLoad(app) {
      logger.info('before-load', { app: app.name });
      // shell-store — Shell UI 组件订阅此字段（唯一可变状态来源）
      useShellStore.getState().setActiveSubApp(app.name);
      // qiankun globalState — 子应用通过 actions.onGlobalStateChange 只读感知
      return actions.setGlobalState({ activeSubApp: app.name });
    },
  });

  // ── 12. 全局未捕获错误处理：main 决定是否触发回滚 ───────────────────────
  addGlobalUncaughtErrorHandler((event) => {
    handleRuntimeRollback({
      event,
      errorReporter,
      channel,
      currentApp: resolveCurrentApp(),
      envName: mainContext.envContext.envName,
      supportsDedicatedRollback,
      updateRuntimeSummary,
    });
  });

  // ── 13. 启动 qiankun ─────────────────────────────────────────────────────
  //    沙箱使用样式隔离模式；prefetch 关闭，由子应用自行控制加载时机。
  start({
    sandbox: {
      experimentalStyleIsolation: true,
    },
    prefetch: false,
  });

  // 返回清理函数，供测试或热重载场景调用
  return async () => {
    await dynamicMountManager.unmountAll();
    clearDynamicMountManager();
    shellCleanups.forEach((fn) => fn());
  };
}

bootstrapMain().catch((err) => {
  const runtimeConfig =
    typeof window !== 'undefined' && window.__MAIN_RUNTIME_CONFIG__
      ? window.__MAIN_RUNTIME_CONFIG__
      : {};
  hostErrorReporter.report(err, {
    scope: 'main-startup',
    stage: 'bootstrap',
    channel: runtimeConfig.releaseChannel || 'stable',
    envName: runtimeConfig.envName || 'unknown',
    severity: 'fatal',
  });

  // 启动链路任意阶段抛出时，向 #app 写入静态降级页，避免用户看到裸白屏。
  // 此处不依赖任何已初始化的模块（logger / bus 可能尚未就绪），只用 console 和原生 DOM。
  console.error('[main] Fatal startup error:', err);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100vh;' +
      'font-family:sans-serif;text-align:center;color:#64748b">' +
      '<div>' +
      '<p style="font-size:18px;font-weight:600;margin-bottom:8px">应用加载失败</p>' +
      '<p style="font-size:13px;margin-bottom:16px">请刷新页面重试，或联系系统管理员</p>' +
      '<button onclick="window.location.reload()" style="padding:8px 20px;font-size:13px;' +
      'background:#1e293b;color:#fff;border:none;border-radius:6px;cursor:pointer">刷新页面</button>' +
      '</div></div>';
  }
});
