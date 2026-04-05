// shell-store.js — Shell 全局状态仓库
//
// 职责：集中管理 Shell 层所有运行时状态，替代原本散落在 main.js 局部变量里
// 的 runtimeSummary / hostState.activeSubApp 等字段。
//
// 状态分为两组：
//   ① URL 驱动状态（visibleMenu / pageType / pageReason）
//      — 由 render-layout.jsx 在每次 popstate 或首次渲染时写入
//   ② 运行时摘要（channel / rollbackModeText / dedicatedApps）
//      — 由 main.js 在启动时初始化，在运行时错误回调中局部更新
//
// 所有 Layout 组件通过 useShellStore() hook 订阅，zustand 按需触发
// 组件重渲染，main.js 调用 getState() 动作写入即可，无需再手动 renderShell()。
import { create } from 'zustand';

export const useShellStore = create((set) => ({
  // ── ① URL 驱动状态 ─────────────────────────────────────────────────────────
  // 当前路径下对应的可见菜单项（已经过权限过滤）
  visibleMenu: [],
  // Shell 自有页面类型：'subapp' | 'home' | 'error'
  pageType: 'home',
  // 错误页面原因描述（pageType 为 'error' 时使用）
  pageReason: '',

  // ── ② 运行时摘要 ───────────────────────────────────────────────────────────
  // 当前发布通道：'stable' | 'rollback'
  channel: 'stable',
  // 供 RuntimeStatusCard 展示的回滚策略文案
  rollbackModeText: '',
  // 拥有独立回滚入口的子应用名单（逗号分隔字符串）
  dedicatedApps: '',

  // ── ③ 子应用激活状态 ────────────────────────────────────────────────────────
  // 当前激活的子应用 name（来自 app-registry 的 name 字段）
  activeSubApp: '',

  // ── Actions ─────────────────────────────────────────────────────────────────

  // 启动时将 buildRuntimeSummary() 的结果写入 store（只调用一次）
  initRuntimeSummary({ channel, rollbackModeText, dedicatedApps }) {
    set({ channel, rollbackModeText, dedicatedApps });
  },

  // popstate / 首次渲染时由 render-layout.jsx 更新导航与页面状态
  setShellNav({ visibleMenu, pageType, pageReason }) {
    set({ visibleMenu, pageType, pageReason });
  },

  // 运行时局部更新摘要（用于错误回调、手动回滚切换等场景）
  // 接受 { channel, rollbackModeText, dedicatedApps } 的任意子集
  // zustand set() 默认做 shallow merge，无需手动展开 state
  updateRuntimeSummary(partial) {
    set(partial);
  },

  // qiankun beforeLoad 回调中记录当前激活子应用
  setActiveSubApp(name) {
    set({ activeSubApp: name });
  },
}));
