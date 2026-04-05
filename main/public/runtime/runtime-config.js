(function attachMainRuntimeConfig() {
  function isLocalHost(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  }

  var params = new URLSearchParams(window.location.search);
  var hostname = window.location.hostname || '';
  var localRuntime = isLocalHost(hostname);
  var debugMode = localRuntime && params.get('debug') === '1';
  var declaredEnv = window.__MAIN_DEPLOY_ENV__;
  var env = declaredEnv || (localRuntime ? 'local' : 'production');
  if (!declaredEnv && debugMode && params.get('env')) {
    env = params.get('env');
  }
  var allowDebugQueryOverrides = debugMode;
  var channel = allowDebugQueryOverrides && params.get('channel') === 'rollback' ? 'rollback' : 'stable';

  var configMap = {
    local: {
      envName: 'local',
      apiBaseUrl: '/api',
      appManifestPath: '/config/apps/local.json',
    },
    test: {
      envName: 'test',
      apiBaseUrl: '/api',
      appManifestPath: '/config/apps/test.json',
    },
    staging: {
      envName: 'staging',
      apiBaseUrl: '/api',
      appManifestPath: '/config/apps/staging.json',
    },
    production: {
      envName: 'production',
      apiBaseUrl: '/api',
      appManifestPath: '/config/apps/production.json',
    },
  };

  var config = configMap[env] || configMap.local;

  window.__MAIN_RUNTIME_CONFIG__ = {
    envName: config.envName,
    apiBaseUrl: config.apiBaseUrl,
    releaseChannel: channel,
    appManifestPath: config.appManifestPath,
    releasePolicySource: 'manifest',
    debugMode: debugMode,
    allowDebugQueryOverrides: allowDebugQueryOverrides,
    allowManualRollbackSwitch: allowDebugQueryOverrides,
    allowForcedFailure: allowDebugQueryOverrides,
    allowDefaultRegistryFallback: localRuntime,
    // feature flags 由运行时配置提供，不在主应用代码里硬编码。
    // 前端 CI/CD 或配置中心可按环境覆盖此对象。
    featureFlags: {
      enableOpsCenter: true,
      enableLegacyOrderMigration: true,
      enableWmsWavePicking: true,
      enablePortalWorkbench: true,
      enableReactConsole: true,
    },
  };
})();
