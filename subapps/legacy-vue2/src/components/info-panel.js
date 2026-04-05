import { renderLegacyCard } from './ui-card';

export function renderLegacyInfoPanel(h, title, rows) {
  return renderLegacyCard(h, title, rows.map((item) =>
    h('p', { class: 'legacy-ui-card__row' }, [
      h('span', { class: 'legacy-ui-card__label' }, item.label),
      h('span', { class: 'legacy-ui-card__value' }, item.value),
    ])
  ));
}
