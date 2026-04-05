// render-layout.jsx — Shell React 根挂载点
//
// renderLayout(permissionContext) 做两件事：
//   1. 根据当前 URL 计算菜单与页面状态，同步写入 shell-store
//   2. 首次调用时创建 React root；之后由 store 订阅驱动自动更新，
//      不再需要每次都调用 root.render()
//
// shellRoot 是模块级变量（而非函数属性），便于测试重置且对 HMR 更友好。
// LayoutRoot 被 ErrorBoundary 包裹：Layout 子组件抛出时渲染降级 UI，
// 而不是 unmount 整棵树导致 shell 消失。
import React from 'react';
import { createRoot } from 'react-dom/client';
import { mainMenuConfig } from '../navigation/menu-config.js';
import { filterMenuByPermissions } from '../navigation/menu-permission.js';
import { resolveMainPageState } from '../routes/resolve-main-page.js';
import { useShellStore } from '../store/shell-store.js';
import { ErrorBoundary } from './error-boundary.jsx';
import { LayoutRoot } from './layout-root.jsx';

// 模块级单例 root，避免函数属性的隐式全局状态问题
let shellRoot = null;

// 根据当前路径和权限上下文计算 Shell 的导航与页面状态
function getShellState(permissionContext) {
  const pageState = resolveMainPageState(window.location.pathname, permissionContext);

  return {
    visibleMenu: filterMenuByPermissions(mainMenuConfig, permissionContext),
    pageState,
  };
}

export function renderLayout(permissionContext) {
  const app = document.getElementById('app');

  if (!app) {
    return;
  }

  // 每次路由变化时重新计算 URL 相关状态并写入 store
  // store 的变化会触发订阅了 useShellStore 的 React 组件重渲染
  const { visibleMenu, pageState } = getShellState(permissionContext);
  useShellStore.getState().setShellNav({
    visibleMenu,
    pageType: pageState.pageType,
    pageReason: pageState.reason,
  });

  // React root 只在首次调用时创建，后续路由更新由 store 驱动，不重复 render
  if (!shellRoot) {
    shellRoot = createRoot(app);
    shellRoot.render(
      <ErrorBoundary>
        <LayoutRoot />
      </ErrorBoundary>
    );
  }
}
