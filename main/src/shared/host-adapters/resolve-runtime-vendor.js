export function resolveRuntimeVendor(target = window) {
  return target.HostRuntimeVendor || {};
}
