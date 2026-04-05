// ErrorPage is the shell-owned fallback page when the current route maps to a
// main page rather than a child app route.
import React from 'react';
import { Card } from '@/components/ui/card.jsx';
import { ButtonLink } from '@/components/ui/button.jsx';

const errorMessages = {
  forbidden: 'The current route maps to a registered child application, but the shell permission model does not allow access for this user context.',
  'not-found': 'The current route does not match any shell page or registered micro frontend. The host now treats it as a real 404 instead of yielding an empty child viewport.',
  'explicit-error': 'The main application routed to the explicit error page.',
  'runtime-failure': 'The main application captured a startup or runtime failure. Check host logs and runtime configuration before retrying.',
};

export function ErrorPage({ reason = 'explicit-error' }) {
  const message = errorMessages[reason] || 'The main application captured a runtime issue. You can return to the home page or continue to a child application from the navigation menu.';

  return (
    <div className="grid gap-4">
      <Card title="Error">
        {message}
      </Card>
      <div>
        <ButtonLink href="/" label="Back Home" tone="primary" />
      </div>
    </div>
  );
}
