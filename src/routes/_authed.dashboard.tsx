import { getSessionData } from '@/utils/auth.functions';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { DebugDateProvider } from '@/contexts/DebugDateContext';

type Session = {
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardPage,
  loader: async (ctx) => {
    // Fetch session data for the component
    const session = await getSessionData();
    const isAdmin = session?.user?.role === 'admin';
    return { session, isAdmin };
  },
});

function DashboardPage() {
  const { session, isAdmin } = Route.useLoaderData();

  // This shouldn't happen due to middleware, but add safety check
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end">
        <p className="text-text">Loading...</p>
      </div>
    );
  }

  return (
    <DebugDateProvider isAdmin={isAdmin}>
      <div className="">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* <div className="rounded-lg border border-border bg-surface p-6 shadow-lg backdrop-blur-sm"> */}
          <Outlet />
          {/* </div> */}
        </main>
      </div>
    </DebugDateProvider>
  );
}
