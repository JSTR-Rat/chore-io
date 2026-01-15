// src/db/schema.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { user } from './auth';

/**
 * Properties Table
 * 
 * Represents physical properties (houses, apartments, buildings) in the system.
 * A property can have multiple rooms and can be associated with multiple users
 * through the usersToProperties junction table.
 * 
 * Relationships:
 * - One-to-many with rooms
 * - Many-to-many with users (via usersToProperties)
 */
export const property = sqliteTable('property', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Rooms Table
 * 
 * Represents individual rooms within a property (e.g., kitchen, bedroom, bathroom).
 * Each room belongs to a single property and can have multiple chores assigned to it.
 * 
 * Relationships:
 * - Many-to-one with properties
 * - One-to-many with chores
 * 
 * Cascade delete: When a property is deleted, all associated rooms are deleted.
 */
export const room = sqliteTable('room', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  propertyId: integer('property_id')
    .notNull()
    .references(() => property.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Chores Table
 * 
 * Defines recurring tasks that need to be completed within a room.
 * Each chore has a schedule defined by frequency and frequencyUnit
 * (e.g., every 2 weeks, every 1 month).
 * 
 * Relationships:
 * - Many-to-one with rooms
 * - One-to-many with choreCompletions (tracks completion history)
 * 
 * Cascade delete: When a room is deleted, all associated chores are deleted.
 * 
 * Example: "Clean bathroom mirror" with frequency=1, frequencyUnit="week"
 */
export const chore = sqliteTable('chore', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  roomId: integer('room_id')
    .notNull()
    .references(() => room.id, { onDelete: 'cascade' }),
  frequency: integer('frequency').notNull(),
  frequencyUnit: text('frequency_unit', { enum: ['day', 'week', 'month', 'year'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Chore Completions Table
 * 
 * Maintains a complete history of chore completions, recording every time
 * a chore is marked as done. This enables tracking of completion patterns,
 * accountability, and calculating when the next completion is due.
 * 
 * Relationships:
 * - Many-to-one with chores (which chore was completed)
 * - Many-to-one with users (who completed it)
 * 
 * Cascade delete: When a chore or user is deleted, associated completions are deleted.
 * 
 * Indexes:
 * - choreId + completedAt: Optimizes queries for most recent completion per chore,
 *   enabling fast "last completed" lookups and "next due" calculations
 * 
 * Common queries:
 * - Get last completion for a chore
 * - Get all completions by a specific user
 * - Calculate completion frequency patterns
 */
export const choreHistory = sqliteTable('chore_history', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  choreId: integer('chore_id')
    .notNull()
    .references(() => chore.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  completedAt: integer('completed_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => [
  index('chore_completed_at_idx').on(table.choreId, table.completedAt),
]);

/**
 * Users to Properties Junction Table
 * 
 * Implements a many-to-many relationship between users and properties,
 * enabling multiple users to be associated with multiple properties.
 * This supports scenarios like roommates, property managers, or family members
 * all having access to manage the same property's chores.
 * 
 * Relationships:
 * - Many-to-one with users
 * - Many-to-one with properties
 * 
 * Cascade delete: When either a user or property is deleted, the association is removed.
 * 
 * Use cases:
 * - Grant property access to new roommates
 * - List all properties a user has access to
 * - List all users who can manage a property
 * - Track when users were granted access (via createdAt)
 */
export const userToProperty = sqliteTable('user_to_property', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  propertyId: integer('property_id')
    .notNull()
    .references(() => property.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
