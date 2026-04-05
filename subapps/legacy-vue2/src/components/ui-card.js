export function renderLegacyCard(h, title, children) {
  return h('section', { class: 'legacy-ui-card' }, [
    title
      ? h('div', { class: 'legacy-ui-card__title' }, title)
      : null,
    h('div', { class: 'legacy-ui-card__body' }, children),
  ]);
}
