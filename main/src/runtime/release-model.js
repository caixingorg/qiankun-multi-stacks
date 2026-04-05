// release-model.js — 发布通道与回滚模式的常量与校验函数
//
// 本文件是所有涉及御中发布/回滚逻辑的唯一词汇来源。
// 原 shared/constants/release-model.js 的内容已并入此处，消除了重复定义。

// 发布通道：Stable 为正常流量，Rollback 为备用入口
export const ReleaseChannels = {
  stable: 'stable',
  rollback: 'rollback'
};

// 回滚模式：
//   dedicatedEntry — 子应用有独立的回滚入口地址
//   sharedEntry    — rollback 通道与 stable 共用同一入口
export const RollbackModes = {
  dedicatedEntry: 'dedicated-entry',
  sharedEntry: 'shared-entry'
};

// 校验发布通道字符串
export function isValidReleaseChannel(channel) {
  return Object.values(ReleaseChannels).includes(channel);
}

// 校验回滚模式字符串
export function isValidRollbackMode(mode) {
  return Object.values(RollbackModes).includes(mode);
}

// 校验单条子应用描述符的必要字段
export function validateAppRegistryItem(app) {
  if (!app || typeof app !== 'object') {
    throw new Error('Invalid app registry item: expected object');
  }

  const requiredStringFields = ['key', 'name', 'title', 'activeRule'];

  for (const field of requiredStringFields) {
    if (!app[field] || typeof app[field] !== 'string') {
      throw new Error('Invalid app registry item: missing field "' + field + '"');
    }
  }

  if (!app.entries || typeof app.entries !== 'object') {
    throw new Error('Invalid app registry item "' + app.key + '": missing entries');
  }

  if (!app.entries.stable || typeof app.entries.stable !== 'string') {
    throw new Error('Invalid app registry item "' + app.key + '": missing stable entry');
  }

  if (app.entries.rollback && typeof app.entries.rollback !== 'string') {
    throw new Error('Invalid app registry item "' + app.key + '": rollback entry must be a string');
  }

  if (!isValidRollbackMode(app.rollbackMode)) {
    throw new Error('Invalid app registry item "' + app.key + '": unknown rollback mode');
  }

  return app;
}

// 批量校验注册表数组，确保 key 不重复且每条目满足最小字段要求
export function validateAppRegistry(registry) {
  if (!Array.isArray(registry)) {
    throw new Error('App registry must be an array');
  }

  const seenKeys = new Set();

  registry.forEach((app) => {
    validateAppRegistryItem(app);

    if (seenKeys.has(app.key)) {
      throw new Error('Duplicate app registry key: ' + app.key);
    }

    seenKeys.add(app.key);
  });

  return registry;
}

// 环境常量（已从 shared/constants/release-model.js 并入）
export const ENVIRONMENTS = {
  local: 'local',
  test: 'test',
  staging: 'staging',
  production: 'production',
};

// 发布模型全局元数据
export const RELEASE_MODEL = {
  appLevelRollback: true,          // 回滚粒度为单个子应用级
  supportedChannels: [ReleaseChannels.stable, ReleaseChannels.rollback],
  defaultEnvironment: ENVIRONMENTS.local,
};
