import { getSessionData } from '@/utils/auth.functions';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { retainSearchParams } from '@tanstack/react-router';
import z from 'zod';

const dateSearchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

type Session = {
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export const Route = createFileRoute('/_authed/dashboard')({
  validateSearch: dateSearchSchema,
  search: {
    middlewares: [retainSearchParams(['date'])],
  },
  component: DashboardPage,
  loader: async (ctx) => {
    // Fetch session data for the component
    const session = await getSessionData();
    const isAdmin = session?.user?.role === 'admin';
    return { session, isAdmin };
  },
});

function DashboardPage() {
  const { session } = Route.useLoaderData();

  // This shouldn't happen due to middleware, but add safety check
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end">
        <p className="text-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
