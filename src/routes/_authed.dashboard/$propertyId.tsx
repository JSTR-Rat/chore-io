import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import z from 'zod';
import { PropertyProvider } from '@/contexts/property/provider';

const PropertyParamsSchema = z.object({
  propertyId: z.coerce.number(),
});

export const Route = createFileRoute('/_authed/dashboard/$propertyId')({
  params: PropertyParamsSchema,
  component: RouteComponent,
  errorComponent: ErrorComponent,
  pendingComponent: LoadingComponent,
});

function LoadingComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-text-muted">Loading property...</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end p-6">
      <div className="max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-text">
          Error Loading Property
        </h2>
        <p className="mb-6 text-text-muted">{error.message}</p>
        <Link
          to="/dashboard"
          className="inline-block rounded bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-hover"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { propertyId } = Route.useParams();

  return (
    <PropertyProvider propertyId={propertyId}>
      <Outlet />
    </PropertyProvider>
  );
}
