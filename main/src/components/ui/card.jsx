// Card is the default content container used by shell pages and runtime
// summary blocks.
import React from 'react';
import { cn } from './utils.js';

export function Card({ title, children, className }) {
  return (
    <section
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
        className
      )}
    >
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">{title}</div>
      <div className="text-sm leading-6 text-slate-900">
        {children}
      </div>
    </section>
  );
}
