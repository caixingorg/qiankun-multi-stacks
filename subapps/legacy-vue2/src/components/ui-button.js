export function renderLegacyButton(h, label, options = {}) {
  const {
    active = false,
    onClick,
  } = options;

  return h('button', {
    class: active ? 'legacy-ui-button legacy-ui-button--active' : 'legacy-ui-button',
    on: {
      click: onClick,
    },
  }, label);
}
