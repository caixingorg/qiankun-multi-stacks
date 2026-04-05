// app-registry.js — 子应用注册表
//
// 主应用将所有子应用的路由激活规则、入口地址、回滚策略、权限码全部集中在此文件。
//
// DEV-ONLY FALLBACK：下方 entries.stable 使用硬编码 localhost 端口。
// 本文件是远端 manifest 无法加载时的安全网——不得在生产环境当主动路径使用。
// 生产 manifest 加载路径请看 load-app-manifest.js。
import {
  RollbackModes,
  validateAppRegistry
} from './release-model.js';

// 注册表是 main 决定各路由应加载哪个子应用、是否有回滚入口的唯一地方。
// permission — Shell 层在激活该应用前所需检查的权限码。
export const appRegistry = [
  {
    key: 'legacy',
    name: 'subapp-vue2-legacy',
    title: 'Legacy Vue2',
    activeRule: '/legacy',
    permission: 'legacy:view',
    defaultChildPath: '/orders/pending',
    entries: {
      stable: '//localhost:7201',
      rollback: '//localhost:7211',
    },
    rollbackMode: RollbackModes.dedicatedEntry,
    rollbackValidationPath: '/legacy?channel=rollback',
  },
  {
    key: 'wms',
    name: 'subapp-vue3-wms',
    title: 'WMS Vue3',
    activeRule: '/wms',
    permission: 'wms:view',
    defaultChildPath: '/wave/board',
    entries: {
      stable: '//localhost:7202',
      rollback: '//localhost:7202',
    },
    rollbackMode: RollbackModes.sharedEntry,
    rollbackValidationPath: '',
  },
  {
    key: 'ops',
    name: 'subapp-react-ops',
    title: 'Ops React',
    activeRule: '/ops',
    permission: 'ops:view',
    defaultChildPath: '/dashboard',
    entries: {
      stable: '//localhost:7203',
      rollback: '//localhost:7213',
    },
    rollbackMode: RollbackModes.dedicatedEntry,
    rollbackValidationPath: '/ops?channel=rollback',
  },
  {
    key: 'viteVue',
    name: 'subapp-vite-vue-portal',
    title: 'Portal Vite Vue',
    activeRule: '/vite-vue',
    permission: 'portal:view',
    defaultChildPath: '/workspace',
    entries: {
      stable: '//localhost:7301',
      rollback: '//localhost:7301',
    },
    rollbackMode: RollbackModes.sharedEntry,
    rollbackValidationPath: '',
  },
  {
    key: 'viteReact',
    name: 'subapp-vite-react-console',
    title: 'Console Vite React',
    activeRule: '/vite-react',
    permission: 'console:view',
    defaultChildPath: '/audit-log',
    entries: {
      stable: '//localhost:7302',
      rollback: '//localhost:7312',
    },
    rollbackMode: RollbackModes.dedicatedEntry,
    rollbackValidationPath: '/vite-react?channel=rollback',
  },
];

// 首次对静态注册表做格式校验，尽早梳出字段缺失等配置错误
validateAppRegistry(appRegistry);

// runtimeAppRegistry 是运行时实际使用的注册表，它可能被远端 manifest 覆盖
let runtimeAppRegistry = appRegistry;

// 获取当前运行时注册表
export function getRuntimeAppRegistry() {
  return runtimeAppRegistry;
}

// 用远端 manifest 覆盖运行时注册表（load-app-manifest.js 调用）
export function setRuntimeAppRegistry(registry) {
  runtimeAppRegistry = validateAppRegistry(registry);
  return runtimeAppRegistry;
}

// 按 key 卧展子应用描述符
export function getAppByKey(key, registry = getRuntimeAppRegistry()) {
  return registry.find((app) => app.key === key) || null;
}

// 按当前路径匹配子应用描述符（支持精确匹配和前缀匹配）
export function getAppByRoute(pathname, registry = getRuntimeAppRegistry()) {
  return registry.find((app) => pathname === app.activeRule || pathname.startsWith(app.activeRule + '/')) || null;
}

// 生成指定发布通道的入口映射表（key → entry URL）
export function getChannelEntryMap(channel, registry = getRuntimeAppRegistry()) {
  return registry.reduce((result, app) => {
    result[app.key] = app.entries[channel] || app.entries.stable;
    return result;
  }, {});
}

// 汇总回滚模式分布，供 Layout 展示回滚状态摘要
export function getRollbackSummary(registry = getRuntimeAppRegistry()) {
  // 共享入口：rollback 通道与 stable 通道共用同一个入口地址
  const sharedEntryApps = registry
    .filter((app) => app.rollbackMode === RollbackModes.sharedEntry)
    .map((app) => app.title);

  // 独立入口：rollback 通道有专属的备用入口地址
  const dedicatedRollbackApps = registry
    .filter((app) => app.rollbackMode === RollbackModes.dedicatedEntry)
    .map((app) => app.title);

  return {
    sharedEntryApps,
    dedicatedRollbackApps,
  };
}
