import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authed/dashboard/$propertyId/room/$roomId/new',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/dashboard/$propertyId/room/$roomId/new"!</div>
}
