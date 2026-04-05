# 子应用 Bridge 模板说明

## 一、目标

这份文档用于统一 5 个子应用 `bridge/` 目录下的文件结构和字段口径，减少重复噪音，避免后续新增子应用时又各写各的。

## 二、当前标准结构

每个子应用的 `bridge/` 当前应至少包含：

1. `micro-app.js`
2. `standalone.js`
3. `host-api.js`
4. `get-host-context.js`

## 三、职责划分

### 1. `micro-app.js`

负责：

1. qiankun 生命周期导出
2. `assertMainContract(props)` 校验
3. 组装 `buildViewModel(props)`
4. 调用 `renderApp({ container, viewModel })`

### 2. `standalone.js`

负责：

1. 子应用独立运行入口
2. 组装 `buildStandaloneViewModel()`
3. 定义跨应用跳转回主应用的最小能力

### 3. `host-api.js`

负责：

1. 读取 host props
2. 校验主应用注入字段
3. 解析 runtime vendor
4. 承接 cleanup 与 qiankun lifecycle 辅助

### 4. `get-host-context.js`

负责：

1. 从 `viewModel` 中提取主应用上下文
2. 对缺省字段给出稳定兜底值

## 四、`buildViewModel` 推荐字段顺序

统一顺序推荐如下：

1. `fromHost`
2. `appName`
3. `mode`
4. `runtimeChannel`
5. `rollbackEntryActive`
6. `sharedTime`
7. `moduleMeta`
8. `featureEnabled`
9. `policySummary`
10. `vendorVersion`
11. `vendorTenant`
12. `vendorPrice`
13. `navigationTargets`
14. `onNavigate`

## 五、最小注释规则

推荐保留两类注释：

1. `buildViewModel` 前一句，说明“把主应用注入翻译成子应用稳定消费结构”
2. 特殊兼容逻辑前一句，例如 rollback、standalone fallback、dev server 差异

## 六、边界要求

1. 子应用 `bridge/` 不直接 import `main/src/*`
2. 主应用源码路径不是子应用跨仓稳定入口
3. 子应用对主应用能力的消费统一收口在自己的 `host-api.js`
