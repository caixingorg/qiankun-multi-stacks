export function joinAppPath(basePath, childPath) {
  if (!childPath) {
    return basePath;
  }

  const normalizedChildPath = childPath.startsWith('/') ? childPath : '/' + childPath;
  return basePath + normalizedChildPath;
}

export function normalizeChildPath(defaultChildPath, childPath) {
  if (typeof childPath === 'string' && childPath.trim()) {
    return childPath.startsWith('/') ? childPath : '/' + childPath;
  }

  return defaultChildPath || '';
}
