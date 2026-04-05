// handle-runtime-rollback.js — 运行时错误回滚决策器
//
// 职责：判断一个运行时错误是应该仅上报，还是应该触发自动回滚跳转。
//
// 自动回滚触发条件（全部满足）：
//   1. 当前处于 stable 通道
//   2. 有当前激活的子应用
//   3. 该子应用配置了独立回滚入口（dedicatedEntry 模式）
//   4. URL 中尚未包含 autoRollback=1（防止回滚循环）
import { ReleaseChannels, RollbackModes } from './release-model.js';

// 判断 URL 中是否已标记自动回滚（防止回滚循环 内>1次跳转）
export function hasAutoRollbackMarker(search = window.location.search) {
  const params = new URLSearchParams(search);
  return params.get('autoRollback') === '1';
}

// 将当前页面重定向到回滚通道 URL
export function redirectToRollback(app) {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set('channel', 'rollback');
  nextUrl.searchParams.set('autoRollback', '1');
  nextUrl.searchParams.set('rollbackApp', app.key);
  nextUrl.searchParams.delete('failApp');
  window.location.replace(nextUrl.toString());
}

export function handleRuntimeRollback({
  event,
  errorReporter,
  channel,
  currentApp,
  envName = 'unknown',
  supportsDedicatedRollback,
  getHasAutoRollbackMarker = hasAutoRollbackMarker,
  updateRuntimeSummary,
  redirect = redirectToRollback,
}) {
  // 首先将错误上报到日志/监控
  const hasRollbackMarker = getHasAutoRollbackMarker();

  errorReporter.report(event, {
    scope: 'main-micro-app',
    stage: 'global-uncaught',
    channel,
    activeSubApp: currentApp ? currentApp.name : '',
    envName,
    severity: 'error',
  });

  // 满足所有条件时自动跳转到回滚通道
  if (
    channel === ReleaseChannels.stable &&
    currentApp &&
    supportsDedicatedRollback(currentApp) &&
    !hasRollbackMarker
  ) {
    updateRuntimeSummary({
      channel,
      rollbackModeText: 'Detected runtime load error in ' + currentApp.title + '. Auto switching to rollback channel.',
      dedicatedApps: '',
    });
    redirect(currentApp);
    return;
  }

  // 不满足自动回滚条件：更新 Shell 提示文案，引导用户手动处理
  updateRuntimeSummary({
    channel,
    rollbackModeText:
      currentApp && currentApp.rollbackMode === RollbackModes.sharedEntry
        ? 'Detected runtime load error in ' + currentApp.title + '. This app still uses shared-entry, so switch channel manually with ?channel=rollback.'
        : hasRollbackMarker
          ? 'Detected runtime load error after rollback marker. Auto rollback will not run again to avoid redirect loops.'
          : 'Detected runtime load error. Auto rollback is only enabled for dedicated-entry apps and runs once to avoid redirect loops.',
    dedicatedApps: '',
  });
}

// 别名，向后兼容旧调用方
export const handleMainRuntimeError = handleRuntimeRollback;
