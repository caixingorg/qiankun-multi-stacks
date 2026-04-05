// mainRoutes contains only shell-owned paths that are not part of any subapp.
// Subapp activation paths live in app-registry.mjs alongside their other metadata.
export const mainRoutes = {
  home: '/',
  error: '/error',
};
