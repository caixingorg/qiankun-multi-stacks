import { h } from 'vue';

export function renderWmsButton(label, options = {}) {
  const {
    active = false,
    onClick,
  } = options;

  return h('button', {
    class: active ? 'wms-ui-button wms-ui-button--active' : 'wms-ui-button',
    onClick,
  }, label);
}
