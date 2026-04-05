// These are the only platform-level event names that main and subapps should
// emit directly.
export const HostEvents = {
  hostBroadcast: 'host:broadcast',
  hostNavigation: 'host:navigation',
  hostNavigationGuard: 'host:navigation:guard',
  subappNotify: 'subapp:notify'
};

export const SubappEvents = {
  mounted: 'subapp:notify',
  runtimeError: 'subapp:runtime-error',
  navigationRequest: 'subapp:navigation-request',
};
