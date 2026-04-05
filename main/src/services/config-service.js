// config-service.js — 运行时配置解析
//
// 优先级（高→低）：
//   1. window.__MAIN_RUNTIME_CONFIG__（runtime-config.js 写入）
//   2. URL 查询参数调试模式（仅本地且 ?debug=1）
//   3. hostname 自动测识环境（localhost → local，其他 → production）
//
// 设计原则：配置必须不依赖构建产物里的硬编码内容，
// 不同环境只需注入不同的运行时配置文件即可实现环境切换。
import { ENVIRONMENTS, ReleaseChannels as RELEASE_CHANNELS, RELEASE_MODEL } from '../runtime/release-model.js';

// 统一处理 search 入参：字符串直接使用，默认取 window.location.search
function getSearchInput(search) {
  if (typeof search === 'string') {
    return search;
  }

  if (typeof window !== 'undefined' && window.location) {
    return window.location.search;
  }

  return '';
}

// 读取 runtime-config.js 写入的运行时配置对象
function getWindowRuntimeConfig() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.__MAIN_RUNTIME_CONFIG__ || null;
}

function getRuntimeHostname() {
  if (typeof window === 'undefined' || !window.location) {
    return 'localhost';
  }

  return window.location.hostname || 'localhost';
}

// 判断当前导航地址是否为本地开发环境
function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export function getMainConfig(search) {
  const runtimeConfig = getWindowRuntimeConfig();

  // 优先读取 runtime-config.js 注入的配置，这样环境切换不需重新构建主应用
  if (runtimeConfig) {
    return {
      envName: runtimeConfig.envName || RELEASE_MODEL.defaultEnvironment,
      releaseChannel: runtimeConfig.releaseChannel || RELEASE_CHANNELS.stable,
      apiBaseUrl: runtimeConfig.apiBaseUrl || '/api',
      appManifestPath: runtimeConfig.appManifestPath || '/config/apps/local.json',
      releasePolicySource: runtimeConfig.releasePolicySource || 'manifest',
      allowDebugQueryOverrides: Boolean(runtimeConfig.allowDebugQueryOverrides),
      allowManualRollbackSwitch: Boolean(runtimeConfig.allowManualRollbackSwitch),
      allowForcedFailure: Boolean(runtimeConfig.allowForcedFailure),
      allowDefaultRegistryFallback: Boolean(runtimeConfig.allowDefaultRegistryFallback),
    };
  }

  // 回退路径：runtime-config.js 没有运行（如单测环境），通过 hostname + URL 参数推断环境
  const hostname = getRuntimeHostname();
  const debugRuntime = typeof window === 'undefined' || isLocalHost(hostname);
  const searchInput = getSearchInput(search);
  const params = new URLSearchParams(searchInput);
  // ?debug=1 且在本地时开启调试模式，允许 URL 参数覆盖环境/通道
  const debugMode = debugRuntime && params.get('debug') === '1';
  const fallbackEnv = debugMode
    ? (params.get('env') || RELEASE_MODEL.defaultEnvironment)
    : (debugRuntime ? ENVIRONMENTS.local : ENVIRONMENTS.production);
  // 仅当 debugMode 且 ?channel=rollback 时才切到回滚通道
  const releaseChannel = debugMode && params.get('channel') === RELEASE_CHANNELS.rollback
    ? RELEASE_CHANNELS.rollback
    : RELEASE_CHANNELS.stable;

  // 环境到配置的映射表
  const environmentMap = {
    [ENVIRONMENTS.local]: { apiBaseUrl: '/api', appManifestPath: '/config/apps/local.json' },
    [ENVIRONMENTS.test]: { apiBaseUrl: '/api', appManifestPath: '/config/apps/test.json' },
    [ENVIRONMENTS.staging]: { apiBaseUrl: '/api', appManifestPath: '/config/apps/staging.json' },
    [ENVIRONMENTS.production]: { apiBaseUrl: '/api', appManifestPath: '/config/apps/production.json' },
  };

  const envName = environmentMap[fallbackEnv] ? fallbackEnv : ENVIRONMENTS.local;
  const resolvedEnvironment = environmentMap[envName] || environmentMap[ENVIRONMENTS.local];

  return {
    envName,
    releaseChannel,
    apiBaseUrl: resolvedEnvironment.apiBaseUrl,
    appManifestPath: resolvedEnvironment.appManifestPath,
    releasePolicySource: 'manifest',
    debugMode,
    allowDebugQueryOverrides: debugMode,
    allowManualRollbackSwitch: debugMode,
    allowForcedFailure: debugMode,
    allowDefaultRegistryFallback: debugMode || envName === ENVIRONMENTS.local,
  };
}
