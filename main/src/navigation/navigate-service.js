// navigate-service.js — 导航服务
//
// 职责：将子应用的导航请求转换为 main 持有的 history 变更，
// 并在路由更新前违过共享导航守卫。
//
// 设计原则：
//   - 子应用不得直接调用 window.history.pushState
//   - 多路廉防止重复导航到相同路径
//   - 所有导航动作通过 HostEvents.hostNavigation bus 事件广播
import {
  createNavigationTarget,
  normalizeNavigationTarget
} from './navigation-targets.js';
import { HostEvents } from '../communication/events.js';
import { joinAppPath, normalizeChildPath as normalizeSubappChildPath } from '../shared/utils/path-utils.js';
import { getAppByKey, getRuntimeAppRegistry } from '../runtime/app-registry.js';

// 标准化子应用内部路径：若斠空则返回子应用默认路径
function normalizeChildPath(route, childPath) {
  return normalizeSubappChildPath(route.defaultChildPath || '', childPath);
}

// 依次执行导航守卫组，任何守卫返回的上下文将传递给下一个守卫
function runGuards(guards, context) {
  return guards.reduce((currentContext, guard) => {
    // 已被取消的导航直接跳过后续守卫
    if (currentContext.cancelled) {
      return currentContext;
    }

    const nextContext = guard(currentContext);
    return nextContext || currentContext;
  }, context);
}

export function createNavigationService({ bus, channel, getHostState }) {
  const guards = [
    // 守卫 1：重复路径拦截，防止重复导航到当前路径
    (context) => {
      const currentPath =
        window.location.pathname + window.location.search + window.location.hash;

      if (currentPath === context.fullPath) {
        return {
          ...context,
          cancelled: true,
          reason: 'duplicate-navigation',
        };
      }

      return context;
    },
    // 守卫 2：导航前广播 beforeEach 事件，供可观测链路追踪使用
    (context) => {
      const state = typeof getHostState === 'function' ? getHostState() : null;
      const userName = state && state.user ? state.user.name : 'anonymous';

      if (bus && bus.emit) {
        bus.emit(HostEvents.hostNavigationGuard, {
          stage: 'beforeEach',
          from: context.from,
          to: context.target.app,
          fullPath: context.fullPath,
          channel,
          userName,
        });
      }

      return context;
    },
  ];

  return {
    // 获取所有子应用的导航目标列表
    getRoutes() {
      return getRuntimeAppRegistry().map((app) => createNavigationTarget(app));
    },
    // 获取排除当前应用后的导航目标列表
    getTargets(currentApp) {
      return this.getRoutes().filter((route) => route.key !== currentApp);
    },
    // 执行一次全受守卫的导航
    navigate(target) {
      const normalizedTarget = normalizeNavigationTarget(target);
      const route = getAppByKey(normalizedTarget.app);

      if (!route) {
        throw new Error('Unknown navigation target: ' + normalizedTarget.app);
      }

      // 计算完整跳转路径：子应用激活路由 + 内部子路径
      const childPath = normalizeChildPath(route, normalizedTarget.childPath);
      const fullPath = joinAppPath(route.activeRule, childPath);
      const guardContext = runGuards(guards, {
        target: normalizedTarget,
        route,
        from: normalizedTarget.from || 'unknown',
        fullPath,
        cancelled: false,
        reason: '',
      });

      // 守卫取消导航：返回原因但不抛异常
      if (guardContext.cancelled) {
        return {
          ok: false,
          cancelled: true,
          reason: guardContext.reason,
          fullPath,
        };
      }

      // 将新路径写入 history，并手动派发 popstate 事件以触发 Shell 路由处理
      window.history.pushState(
        {
          from: normalizedTarget.from || 'unknown',
          to: normalizedTarget.app,
          fullPath,
        },
        '',
        fullPath
      );
      window.dispatchEvent(new PopStateEvent('popstate'));

      // 导航完成后广播事件，供日志和可观测流违使用
      if (bus && bus.emit) {
        bus.emit(HostEvents.hostNavigation, {
          from: normalizedTarget.from || 'unknown',
          to: normalizedTarget.app,
          fullPath,
          childPath,
          channel,
          title: route.title,
        });
      }

      return {
        ok: true,
        fullPath,
        childPath,
      };
    },
  };
}
