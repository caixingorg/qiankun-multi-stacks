import { h } from 'vue';
import { renderPortalCard } from './ui-card';

export function renderPortalInfoPanel(title, rows) {
  return renderPortalCard(title, rows.map((item) =>
    h('p', { class: 'portal-ui-card__row' }, [
      h('span', { class: 'portal-ui-card__label' }, item.label),
      h('span', { class: 'portal-ui-card__value' }, item.value),
    ])
  ));
}
