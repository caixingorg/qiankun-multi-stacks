(function () {
  // deploy-env.js — 部署环境标识注入
  //
  // 职责：在 runtime-config.js 之前运行，将当前部署目标固定写入
  // window.__MAIN_DEPLOY_ENV__，供 runtime-config.js 按环境选取配置。
  //
  // 加载顺序（index.html 中必须遵守）：
  //   deploy-env.js → mock-auth.js → runtime-config.js → runtime-vendor.global.js
  //
  // ─── CI/CD 使用说明 ────────────────────────────────────────────────────────
  //
  // 此文件在部署流水线中按目标环境生成（或通过 sed 替换占位符），
  // 将对应的 window.__MAIN_DEPLOY_ENV__ 赋值行解除注释。
  //
  // 示例（生产环境 CI 生成结果）：
  //   window.__MAIN_DEPLOY_ENV__ = 'production';
  //
  // 可选值：'local' | 'test' | 'staging' | 'production'
  //
  // ─── 本地开发 ──────────────────────────────────────────────────────────────
  //
  // 不注入任何值。runtime-config.js 检测到 hostname === 'localhost' 时
  // 自动将环境判定为 'local'，无需此文件介入。
  //
  // ─── 各环境占位行（CI 解注释对应行）────────────────────────────────────────
  //
  // window.__MAIN_DEPLOY_ENV__ = 'local';
  // window.__MAIN_DEPLOY_ENV__ = 'test';
  // window.__MAIN_DEPLOY_ENV__ = 'staging';
  // window.__MAIN_DEPLOY_ENV__ = 'production';
})();
