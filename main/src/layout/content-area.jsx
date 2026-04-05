// content-area.jsx — Shell 内容区域
//
// 决定当前应展示哪种内容：
//   - 'subapp'  → 露出 #subapp-viewport DOM 节点，qiankun 将子应用挂载到此
//   - 'error'   → 展示 Shell 自持的错误页
//   - 其他     → 展示首页
import React from 'react';
import { Card } from '../components/ui/card.jsx';
import { ErrorPage } from '../pages/error-page.jsx';
import { HomePage } from '../pages/home-page.jsx';
import { RuntimeStatusCard } from './runtime-status-card.jsx';

// 根据页面类型渲染 Shell 自持页面
function renderMainPage(pageType, pageReason) {
  if (pageType === 'error') {
    return <ErrorPage reason={pageReason} />;
  }

  return <HomePage />;
}

export function ContentArea({ pageType, pageReason, runtimeSummary }) {
  // 只有 pageType === 'subapp' 时才显示子应用容器
  const showSubappViewport = pageType === 'subapp';

  return (
    <main className="p-6">
      {/* 页面头部信息卡片区 */}
      <section className="mb-4 grid grid-cols-[1.2fr_1fr] gap-4">
        <Card title="Main App Responsibility">
          Application shell, app registry, route dispatch, context, navigation, communication,
          and runtime safeguards.
        </Card>
        <Card title="Current Status">
          The project has been migrated to the main/subapps structure and now uses unified root
          commands for build and validation.
        </Card>
      </section>
      {/* 运行时摘要卡片（通道/回滚状态） */}
      <section className="mb-4">
        <RuntimeStatusCard
          channel={runtimeSummary.channel}
          rollbackModeText={runtimeSummary.rollbackModeText}
          dedicatedApps={runtimeSummary.dedicatedApps}
        />
      </section>
      {showSubappViewport ? (
        // 子应用挂载点：qiankun 将子应用 DOM 插入到 #subapp-viewport
        <section
          id="subapp-viewport"
          className="min-h-[320px] rounded-2xl border border-slate-200 bg-white p-[18px] shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
        />
      ) : (
        // Shell 自持页面（首页或错误页）
        <section className="min-h-[320px] rounded-2xl border border-slate-200 bg-white p-[18px] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          {renderMainPage(pageType, pageReason)}
        </section>
      )}
    </main>
  );
}
