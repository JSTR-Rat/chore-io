// src/routes/index.tsx
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Logo/Brand Area */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight">
              Chore<span className="text-blue-500">.io</span>
            </h1>
            <div className="h-1 w-24 mx-auto bg-linear-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <p className="text-2xl md:text-3xl text-gray-300 font-light">
              Stay on top of your household tasks
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Track your chores with visual timelines and never forget what
              needs to be done. Simple, effective, and always accessible.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg shadow-blue-900/50 hover:shadow-blue-900/70 transition-all duration-200 transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/signin"
              className="w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-white font-medium rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Visual Timeline</h3>
              <p className="text-gray-400 text-sm">
                See at a glance when each chore was last done and when it's due
                next.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">
                Quick check-ins and updates. No complicated forms or workflows.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-400 text-sm">
                Your data is encrypted and protected. Only you have access.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            Start managing your chores smarter, not harder.
          </p>
        </div>
      </div>
    </div>
  );
}
