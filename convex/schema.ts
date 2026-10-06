import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  documents: defineTable({
    ownerId: v.string(),
    title: v.string(),
    icon: v.string(),
    content: v.string(),
    parentId: v.optional(v.string()),
    archived: v.boolean(),
    published: v.boolean(),
    publicSlug: v.optional(v.string()),
    coverStorageId: v.optional(v.id('_storage')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_owner', ['ownerId'])
    .index('by_owner_parent', ['ownerId', 'parentId'])
    .index('by_public_slug', ['publicSlug']),
});
