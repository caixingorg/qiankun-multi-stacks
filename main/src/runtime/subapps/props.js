// Host props define the stable qiankun mount payload shape available to
// subapps.
export const HostPropNames = {
  actions: 'actions',
  appName: 'appName',
  bus: 'bus',
  dependencyPolicy: 'dependencyPolicy',
  fromHost: 'fromHost',
  navigation: 'navigation',
  sharedKernel: 'sharedKernel'
};

export function getHostSharedKernel(props) {
  return props && props.sharedKernel ? props.sharedKernel : {};
}

export function getHostNavigation(props) {
  return props && props.navigation ? props.navigation : {};
}

export function getDependencyPolicy(props) {
  return props && props.dependencyPolicy ? props.dependencyPolicy : {};
}
