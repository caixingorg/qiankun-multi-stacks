// Navigation helpers keep target objects normalized between main and subapps.
export function createNavigationTarget(app, childPath) {
  return {
    key: app.key,
    title: app.title,
    path: app.activeRule,
    childPath: childPath || app.defaultChildPath || ''
  };
}

export function normalizeNavigationTarget(target) {
  if (typeof target === 'string') {
    return { app: target };
  }

  return target || {};
}
