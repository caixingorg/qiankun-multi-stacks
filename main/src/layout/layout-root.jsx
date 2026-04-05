// LayoutRoot — Shell 布局组合根
//
// 直接从 useShellStore 读取所有状态，不接受任何 props。
// 当 store 中的 visibleMenu / pageType / runtimeSummary 发生变化时，
// zustand 按需触发本组件及子组件重渲染。
import React from 'react';
import { useShellStore } from '../store/shell-store.js';
import { HeaderBar } from './header-bar.jsx';
import { Sidebar } from './sidebar.jsx';
import { ContentArea } from './content-area.jsx';

export function LayoutRoot() {
  // 从 store 订阅所有 Shell 布局所需状态
  const visibleMenu = useShellStore((s) => s.visibleMenu);
  const pageType = useShellStore((s) => s.pageType);
  const pageReason = useShellStore((s) => s.pageReason);
  const channel = useShellStore((s) => s.channel);
  const rollbackModeText = useShellStore((s) => s.rollbackModeText);
  const dedicatedApps = useShellStore((s) => s.dedicatedApps);

  // 将离散字段组合为 ContentArea 期望的 runtimeSummary 形状
  const runtimeSummary = { channel, rollbackModeText, dedicatedApps };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-950">
      <HeaderBar menuItems={visibleMenu} />
      <div className="grid min-h-[calc(100vh-72px)] grid-cols-[260px_1fr]">
        <Sidebar menuItems={visibleMenu} />
        <ContentArea pageType={pageType} pageReason={pageReason} runtimeSummary={runtimeSummary} />
      </div>
    </div>
  );
}
