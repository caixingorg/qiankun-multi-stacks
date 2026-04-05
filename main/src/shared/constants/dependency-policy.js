// Dependency policy documents which capabilities stay owned by main and which
// remain local to subapps.
export const dependencyPolicy = {
  summary: 'With Vue2 + Vue3 + React together, do not share framework runtimes globally. Share only stable platform capabilities and optionally share same-stack vendors within a local technology cluster.',
  notSharedAcrossAllApps: [
    'vue@2.x',
    'vue@3.x',
    'react',
    'react-dom',
    'vue-router',
    'react-router-dom',
  ],
  sharedByHostKernel: [
    'request-client',
    'auth-context',
    'monitoring',
    'time-format',
    'feature-flags',
  ],
  optionalSameStackShared: [
    'axios (only when version is unified)',
    'dayjs (only when version is unified)',
    'design-tokens',
  ],
  rules: [
    'Framework runtimes stay inside each subapp to avoid cross-stack coupling.',
    'Cross-app shared dependencies must be stable, low-frequency, and easy to version-govern.',
    'Business UI libraries should be shared only inside the same framework cluster, not across all apps.',
    'Any shared capability must have a rollback path owned by the host platform.',
  ],
};
