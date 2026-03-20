import { createMiddleware } from '@tanstack/react-start';
import { getSessionData } from './auth.functions';

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await getSessionData();
    if (!session?.user) {
      throw new Error('Not authenticated');
    }
    return await next({
      context: { session: session.session, user: session.user },
    });
  },
);
