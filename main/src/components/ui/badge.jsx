// Badge is a compact status primitive used by the main shell summary panels.
import React from 'react';
import { cn } from './utils.js';

export function Badge({ children, tone = 'default' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        tone === 'default' && 'bg-slate-200 text-slate-900',
        tone === 'success' && 'bg-emerald-100 text-emerald-700',
        tone === 'warning' && 'bg-amber-100 text-amber-700'
      )}
    >
      {children}
    </span>
  );
}
