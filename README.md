# qiankun 多技术栈微前端基座

一个以 `main` 主应用为中心的微前端基座仓库，当前同时接入：

- Vue2 历史子应用
- Vue3 子应用
- React 子应用
- Vite / Webpack 混合构建链路

这个仓库现在的重点不是“做很多子应用页面效果”，而是把 **主应用基座** 做成可长期承载的生产级能力：

1. 子应用注册与入口解析
2. 主子应用契约
3. 导航与权限边界
4. 运行时配置与环境配置
5. 错误上报与回滚治理
6. 子应用接入基线

## 先看哪里

第一次接手仓库，按这个顺序：

1. [文档总入口](./docs/README.md)
2. [架构文档索引](./docs/architecture/README.md)
3. [主应用基座与接入基线说明](./docs/architecture/主应用基座与接入基线说明.md)
4. [main 应用文件夹说明](./docs/architecture/main-应用文件夹说明.md)
5. [当前架构图与挂载流程](./docs/architecture/2026-04-04-当前架构图与挂载流程.md)

如果你只关心 `main` 主应用代码，直接看：

1. [main/src 阅读说明](./main/src/README.md)

## 目录结构

```text
.
├── main/                    # 主应用基座
├── subapps/                 # 子应用目录
├── scripts/                 # 根级启动、校验、smoke 脚本
├── tests/                   # 合同与结构校验
├── docs/                    # 永久基线文档 + 过程文档 + 历史归档
└── package.json
```

子应用当前包括：

- `subapps/legacy-vue2`
- `subapps/wms-vue3`
- `subapps/ops-react`
- `subapps/portal-vite-vue`
- `subapps/console-vite-react`

## 快速开始

### 安装依赖

在仓库根目录执行：

```bash
npm install
```

### 启动主应用联调矩阵

```bash
npm run dev:matrix:qiankun
```

这会启动：

1. `main`
2. `subapps/legacy-vue2`
3. `subapps/wms-vue3`
4. `subapps/ops-react`
5. `subapps/portal-vite-vue`
6. `subapps/console-vite-react`

### 常用命令

- `npm run dev`: 启动 stable 矩阵
- `npm run dev:matrix:qiankun`: 启动主应用联调矩阵
- `npm run dev:matrix:rollback`: 启动包含 rollback 入口的联调矩阵
- `npm run dev:main`: 只启动主应用
- `npm run dev:app:legacy`: 只启动 Vue2 子应用
- `npm run dev:app:wms`: 只启动 Vue3 子应用
- `npm run dev:app:ops`: 只启动 React 子应用
- `npm run dev:app:vite-vue`: 只启动 Vite Vue 子应用
- `npm run dev:app:vite-react`: 只启动 Vite React 子应用
- `npm run lint`: 运行架构约束校验
- `npm run test`: 运行合同验证
- `npm run smoke`: 运行根级 smoke 验证

### 访问地址

- `main`: [http://localhost:7200](http://localhost:7200)
- `legacy-vue2`: [http://localhost:7201](http://localhost:7201)
- `legacy-vue2 rollback`: [http://localhost:7211](http://localhost:7211)
- `wms-vue3`: [http://localhost:7202](http://localhost:7202)
- `ops-react`: [http://localhost:7203](http://localhost:7203)
- `ops-react rollback`: [http://localhost:7213](http://localhost:7213)
- `portal-vite-vue`: [http://localhost:7301](http://localhost:7301)
- `console-vite-react`: [http://localhost:7302](http://localhost:7302)
- `console-vite-react rollback`: [http://localhost:7312](http://localhost:7312)

## 主应用基座现在负责什么

`main` 当前承担的平台职责：

1. 应用壳
2. 子应用注册与入口解析
3. 主路由激活规则
4. 全局上下文注入
5. 一级菜单与导航
6. 主子应用最小通信通道
7. 运行时配置读取
8. 错误上报与回滚决策

主应用核心入口：

- `main/src/main.js`
- `main/src/app-registry.mjs`
- `main/src/runtime/`
- `main/src/layout/`
- `main/src/navigation/`
- `main/src/shared/`

## 子应用如何接入主应用

未来新增子应用时，不应该先看其他子应用页面壳怎么写，而应该先看主应用提供的接入基线：

- [子应用接入短清单](./docs/architecture/子应用接入短清单.md)
- [主应用基座与接入基线说明](./docs/architecture/主应用基座与接入基线说明.md)
- [主子应用契约说明](./docs/architecture/主子应用契约说明.md)
- [子应用 bridge 模板说明](./docs/architecture/子应用%20bridge%20模板说明.md)

当前子应用建议统一通过自己的 bridge 目录接入：

1. `src/bridge/micro-app.js`
2. `src/bridge/standalone.js`
3. `src/bridge/host-api.js`
4. `src/bridge/get-host-context.js`

禁止从子应用直接 import `main/src/*`。

主应用通过 qiankun `props` 下发的最小能力包括：

- `actions`
- `bus`
- `sharedKernel`
- `userContext`
- `envContext`
- `permissionContext`
- `navigation`
- `dependencyPolicy`
- `contractVersion`

## 运行时配置与 manifest

`main/public` 当前按 3 层组织：

```text
main/public/
├── runtime/
│   ├── runtime-config.js
│   └── runtime-vendor.global.js
└── config/
    ├── env/
    └── apps/
```

含义：

1. `runtime/`：浏览器启动即加载的 host runtime 资源
2. `config/env/`：环境级 host 配置
3. `config/apps/`：子应用 manifest

主应用会优先读取运行时 manifest；读取失败时，回退到 `main/src/app-registry.mjs` 中的默认注册表。

## 回滚与调试

当前回滚模型区分两类子应用：

### dedicated-entry

有独立 rollback 入口：

- `legacy`
- `ops`
- `viteReact`

### shared-entry

stable 与 rollback 复用同一个入口：

- `wms`
- `viteVue`

### 调试规则

现在本地手动切换以下运行时参数，必须显式带上 `debug=1`：

- `channel=rollback`
- `failApp=...`
- `rollbackApp=...`

例如：

- `http://localhost:7200/ops?debug=1&failApp=ops`

自动回滚仍由主应用自身在加载失败后触发，不依赖手动 debug 参数。

## 共享能力与兼容方案

当前仍保留一套兼容型共享接入方式：

1. `main/index.html` 预注入 host runtime 脚本
2. webpack 子应用通过 `externals` 使用 `@host/runtime-vendor`
3. 子应用独立运行时由各自 fallback 兜底

这部分是当前兼容方案，不是未来要继续扩张成大而全 SDK 的方向。

## 当前边界

为了避免继续过度设计，当前仓库有几个明确边界：

1. `main/` 承担平台壳、注册、路由、上下文、导航、通信、运行保障
2. `subapps/*` 承担业务页面、业务模块、自身状态和对接层
3. `main/src/shared/` 只保留主应用真正需要暴露给子应用的最小共享能力
4. 重点持续放在主应用基座，而不是继续把每个子应用页面打磨成完整业务系统

## 当前阶段判断

这套仓库已经具备：

1. 可运行
2. 可联调
3. 可验证
4. 可作为主应用基座继续收敛

但还没有进入最终平台态，后续重点仍然是：

1. 主应用运行治理
2. 配置与发布治理
3. 主应用可观测性
4. 子应用接入规范持续收紧
