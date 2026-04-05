// Button is the shared clickable primitive for the main shell. It follows the
// same variant style as the rest of the shadcn-like UI layer.
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from './utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
  {
  variants: {
    tone: {
        default: 'border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100',
        primary: 'bg-slate-950 text-white hover:bg-slate-800',
        ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6',
        icon: 'h-9 w-9',
      },
    },
  defaultVariants: {
      tone: 'default',
      size: 'default',
    },
  }
);

export function Button({ className, tone, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ tone, size }), className)} {...props} />;
}

export function ButtonLink({ href = '#', label, tone = 'default', size = 'default', className }) {
  return (
    <Button asChild tone={tone} size={size} className={cn(className)}>
      <a href={href}>{label}</a>
    </Button>
  );
}
