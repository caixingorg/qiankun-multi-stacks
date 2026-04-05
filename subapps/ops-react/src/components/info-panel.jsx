import React from 'react';
import { UiCard } from './ui/card.jsx';

export function InfoPanel({ title, rows }) {
  return (
    <UiCard title={title}>
      <div className="subapp-info-panel__rows">
        {rows.map((item) => (
          <p key={item.label} className="subapp-info-panel__row">
            <span className="subapp-info-panel__label">{item.label}</span>
            <span className="subapp-info-panel__value">{item.value}</span>
          </p>
        ))}
      </div>
    </UiCard>
  );
}
