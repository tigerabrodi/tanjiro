import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'

import type { Id } from '../_generated/dataModel'
import { mutation } from '../_generated/server'

/**
 * Generate upload URL for file uploads
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Navigate within current chat (back/forward)
 */
export const navigateInChat = mutation({
  args: {
    chatId: v.id('chats'),
    direction: v.union(v.literal('back'), v.literal('forward')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }

    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new ConvexError('Chat not found')
    }

    // Ensure user owns the chat
    if (chat.userId !== userId) {
      throw new ConvexError('Not authorized')
    }

    let newIndex = chat.currentEditIndex

    if (args.direction === 'back' && newIndex > 0) {
      newIndex--
    } else if (
      args.direction === 'forward' &&
      newIndex < chat.editHistory.length - 1
    ) {
      newIndex++
    } else {
      return null // Can't navigate in that direction
    }

    await ctx.db.patch(args.chatId, { currentEditIndex: newIndex })
    return newIndex
  },
})

/**
 * Update chat title
 */
export const updateChatTitle = mutation({
  args: {
    chatId: v.id('chats'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }

    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new ConvexError('Chat not found')
    }

    // Ensure user owns the chat
    if (chat.userId !== userId) {
      throw new ConvexError('Not authorized')
    }

    await ctx.db.patch(args.chatId, { title: args.title.trim() })
    return true
  },
})

/**
 * Create chat (called from actions)
 */
export const createChat = mutation({
  args: {
    title: v.string(),
    currentEditIndex: v.number(),
  },
  handler: async (ctx, args): Promise<Id<'chats'>> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }

    return await ctx.db.insert('chats', {
      title: args.title,
      userId,
      editHistory: [],
      currentEditIndex: args.currentEditIndex,
      createdAt: Date.now(),
      isGenerating: false,
    })
  },
})

/**
 * Set edit history (called from actions)
 */
export const setEditHistory = mutation({
  args: {
    chatId: v.id('chats'),
    editHistory: v.array(v.id('edits')),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.chatId, {
      editHistory: args.editHistory,
    })
  },
})

/**
 * Append edit to chat (called from actions)
 */
export const appendEditToChat = mutation({
  args: {
    chatId: v.id('chats'),
    editId: v.id('edits'),
  },
  handler: async (ctx, args): Promise<void> => {
    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new ConvexError('Chat not found')
    }

    await ctx.db.patch(args.chatId, {
      editHistory: [...chat.editHistory, args.editId],
      currentEditIndex: chat.editHistory.length, // Move to new edit
    })
  },
})
