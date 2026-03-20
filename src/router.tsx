// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { QueryClient } from '@tanstack/react-query';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

export function getRouter() {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: {
      queryClient,
    },
    scrollRestoration: true,
  });
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

// Register the router for type inference with useNavigate, Link, etc.
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
