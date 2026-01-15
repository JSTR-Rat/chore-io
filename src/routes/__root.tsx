// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';

import appCSS from '../styles/app.css?url';

// Define the context type for routes
type RouteContext = {
  session?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  } | null;
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Chore IO',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCSS }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-950 text-white">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
