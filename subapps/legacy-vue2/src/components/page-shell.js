export function renderLegacyPageShell(h, title, description, children) {
  return h('section', { class: 'legacy-page-shell' }, [
    h('header', { class: 'legacy-page-shell__header' }, [
      h('h3', { class: 'legacy-page-shell__title' }, title),
      h('p', { class: 'legacy-page-shell__description' }, description),
    ]),
    h('div', { class: 'legacy-page-shell__body' }, children),
  ]);
}
