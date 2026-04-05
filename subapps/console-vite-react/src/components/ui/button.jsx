import React from 'react';

export function UiButton({ children, active = false, ...props }) {
  return (
    <button
      className={active ? 'subapp-ui-button subapp-ui-button--active' : 'subapp-ui-button'}
      {...props}
    >
      {children}
    </button>
  );
}
