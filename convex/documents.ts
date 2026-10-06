import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

async function requireUserId(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthenticated');
  return identity.subject;
}

export const list = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) => q.eq('ownerId', ownerId))
      .collect();

    if (args.includeArchived) return documents;
    return documents.filter((document) => !document.archived);
  },
});

export const get = query({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const document = await ctx.db.get(args.id);

    if (!document || document.ownerId !== ownerId) return null;
    return document;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    parentId: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const now = Date.now();

    return await ctx.db.insert('documents', {
      ownerId,
      title: args.title,
      content: args.content,
      parentId: args.parentId,
      icon: args.icon ?? '·',
      archived: false,
      published: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('documents'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    parentId: v.optional(v.string()),
    icon: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const document = await ctx.db.get(args.id);

    if (!document || document.ownerId !== ownerId) {
      throw new Error('Document not found');
    }

    const { id, ...patch } = args;
    const updates = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    );

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const archive = mutation({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const document = await ctx.db.get(args.id);

    if (!document || document.ownerId !== ownerId) throw new Error('Document not found');

    await ctx.db.patch(args.id, {
      archived: true,
      published: false,
      updatedAt: Date.now(),
    });
  },
});

export const restore = mutation({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const document = await ctx.db.get(args.id);

    if (!document || document.ownerId !== ownerId) throw new Error('Document not found');

    await ctx.db.patch(args.id, {
      archived: false,
      updatedAt: Date.now(),
    });
  },
});

export const publish = mutation({
  args: {
    id: v.id('documents'),
    published: v.boolean(),
    publicSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const document = await ctx.db.get(args.id);

    if (!document || document.ownerId !== ownerId) throw new Error('Document not found');

    await ctx.db.patch(args.id, {
      published: args.published,
      publicSlug: args.published
        ? args.publicSlug ?? document.publicSlug ?? args.id
        : document.publicSlug,
      updatedAt: Date.now(),
    });
  },
});

export const getPublished = query({
  args: { publicSlug: v.string() },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query('documents')
      .withIndex('by_public_slug', (q) => q.eq('publicSlug', args.publicSlug))
      .unique();

    if (!document || document.archived || !document.published) return null;
    return document;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
