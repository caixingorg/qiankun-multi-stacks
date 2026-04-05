import { h } from 'vue';

export function renderPortalButton(label, options = {}) {
  const {
    active = false,
    onClick,
  } = options;

  return h('button', {
    class: active ? 'portal-ui-button portal-ui-button--active' : 'portal-ui-button',
    onClick,
  }, label);
}
