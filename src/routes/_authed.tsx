import { authClient } from '@/lib/auth-client'
import { getSessionData, requireAuth } from '@/utils/auth.functions'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    console.log('[AUTHED] beforeLoad', location.pathname)
    await requireAuth({ data: { currentPath: location.pathname } })
  },
  loader: async (ctx) => {
    // Fetch session data for the component
    const session = await getSessionData()
    const isAdmin = session?.user?.role === 'admin'
    return { session, isAdmin }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { session, isAdmin } = Route.useLoaderData()
  return (
    <>
      <nav className="sticky top-0 z-10 border-b border-border bg-surface backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-text">
              Chore<span className="text-primary">.io</span> Dashboard
            </h1>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <span className="rounded border border-yellow-500/50 bg-yellow-500/20 px-2 py-1 text-xs text-yellow-500">
                  Admin
                </span>
              )}
              <Link
                to="/signout"
                className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:border-border-hover hover:bg-surface-hover hover:text-text"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  )
}
