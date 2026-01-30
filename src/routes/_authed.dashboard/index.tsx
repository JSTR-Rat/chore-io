import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getDB } from '@/db/client'
import { property } from '@/db/schema/app'
import { useState } from 'react'

// Server function to load all properties
const loadProperties = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDB()

  const properties = await db
    .select({
      id: property.id,
      name: property.name,
      createdAt: property.createdAt,
    })
    .from(property)
    .orderBy(property.createdAt)

  return {
    properties: properties.map((p) => ({
      id: String(p.id),
      name: p.name,
      createdAt: p.createdAt,
    })),
  }
})

// Server function to add a new property
const addProperty = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const db = getDB()

    const [newProperty] = await db
      .insert(property)
      .values({
        name: data.name,
      })
      .returning()

    return {
      property: {
        id: String(newProperty.id),
        name: newProperty.name,
        createdAt: newProperty.createdAt,
      },
    }
  })

export const Route = createFileRoute('/_authed/dashboard/')({
  loader: async () => {
    return await loadProperties()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { properties } = Route.useLoaderData()
  const router = useRouter()
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [newPropertyName, setNewPropertyName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddProperty = async () => {
    if (!newPropertyName.trim() || isAdding) return

    setIsAdding(true)
    try {
      await addProperty({ data: { name: newPropertyName } })
      setNewPropertyName('')
      setShowAddProperty(false)
      // Invalidate and reload the route data
      await router.invalidate()
    } catch (error) {
      console.error('Failed to add property:', error)
      alert('Failed to add property. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Properties Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Properties</h3>
          <button
            onClick={() => setShowAddProperty(!showAddProperty)}
            className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-hover"
          >
            Add Property
          </button>
        </div>

        {/* Add Property Form */}
        {showAddProperty && (
          <div className="mb-4 rounded-lg border border-border bg-surface-elevated p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder="Property name..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder-text-muted focus:border-primary focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddProperty()
                  if (e.key === 'Escape') setShowAddProperty(false)
                }}
              />
              <button
                onClick={handleAddProperty}
                disabled={isAdding}
                className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAdding ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setShowAddProperty(false)
                  setNewPropertyName('')
                }}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-text transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Properties List */}
        {properties.length === 0 ? (
          <div className="py-8 text-center text-text-muted">
            <p>No properties yet. Click "Add Property" to create one.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Link
                key={property.id}
                to="/dashboard/$propertyId"
                params={{ propertyId: property.id }}
                className="rounded-lg border border-border bg-surface-elevated p-4 transition-all hover:border-primary hover:shadow-md"
              >
                <h4 className="mb-1 font-medium text-text">{property.name}</h4>
                <p className="text-xs text-text-muted">
                  Created {new Date(property.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Chores Section - Placeholder for future */}
      <div className="border-t border-border pt-6">
        <h3 className="mb-4 text-lg font-semibold text-text">Chores</h3>
        <p className="text-sm text-text-muted">
          Chores functionality coming soon...
        </p>
      </div>
    </div>
  )
}
