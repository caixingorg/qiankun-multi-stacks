// Host runtime vendor is attached globally because child apps may still run
// outside qiankun and need the same browser-global contract shape.
export function attachRuntimeVendorToWindow(runtimeVendor, target = window) {
  target.HostRuntimeVendor = runtimeVendor;
  return runtimeVendor;
}
