import { requireAuth } from '@/utils/auth.functions';
import { auth } from '@/lib/auth';
import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { useMemo, useState } from 'react';
import { ChoresBoard } from '../components/ChoresBoard';

type Session = {
  user: {
    id: string;
    email: string;
    name: string;
  };
};

interface Chore {
  id: string;
  name: string;
  lastDone: Date;
  maxDaysBetweenChores: number;
}

// Server function to get session data
const getSessionData = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return session;
});

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  beforeLoad: async () => {
    await requireAuth({ data: { currentPath: '/dashboard' } });
  },
  loader: async (ctx) => {
    console.log(ctx);
    // Fetch session data for the component
    const session = await getSessionData();
    return { session };
  },
});

function DashboardPage() {
  const { session } = Route.useLoaderData();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [chores, setChores] = useState<Chore[]>([
    {
      id: '1',
      name: 'Clean shower',
      lastDone: new Date(),
      maxDaysBetweenChores: 14,
    },
    {
      id: '2',
      name: 'Clean sink',
      lastDone: new Date(),
      maxDaysBetweenChores: 7,
    },
    {
      id: '3',
      name: 'Clean toilet',
      lastDone: new Date(),
      maxDaysBetweenChores: 12,
    },
    {
      id: '4',
      name: 'Mop floor',
      lastDone: new Date(),
      maxDaysBetweenChores: 9,
    },
  ]);

  const displayChores: (Chore & { daysSinceLastDone: number })[] =
    useMemo(() => {
      return chores.map((chore) => {
        return {
          ...chore,
          daysSinceLastDone: Math.floor(
            (currentDate.getTime() - chore.lastDone.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        };
      });
    }, [chores, currentDate]);

  const goToPreviousDay = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToNextDay = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleChoreClick = (choreId: string) => {
    setChores((prevChores) =>
      prevChores.map((chore) =>
        chore.id === choreId
          ? { ...chore, lastDone: new Date(currentDate) }
          : chore
      )
    );
  };

  // This shouldn't happen due to middleware, but add safety check
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Chore.io Dashboard
            </h1>
            <Link
              to="/signout"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome back, {session.user.name}!
            </h2>
            <p className="text-sm text-gray-600">{session.user.email}</p>
          </div>
          <ChoresBoard
            currentDate={currentDate}
            chores={displayChores}
            onPreviousDay={goToPreviousDay}
            onNextDay={goToNextDay}
            onChoreClick={handleChoreClick}
            formatDate={formatDate}
          />
        </div>
      </main>
    </div>
  );
}
