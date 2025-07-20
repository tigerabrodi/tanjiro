import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'

import type { Doc } from '../_generated/dataModel'
import { query } from '../_generated/server'

/**
 * Get user's chats for sidebar
 */
export const getUserChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }

    const chats = await ctx.db
      .query('chats')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()

    return chats
  },
})

/**
 * Get chat details with all edits and metadata
 */
export const getChatDetail = query({
  args: { chatId: v.id('chats') },
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

    // Get all edits for this chat
    const edits = await ctx.db
      .query('edits')
      .filter((q) => q.eq(q.field('chatId'), args.chatId))
      .order('asc')
      .collect()

    // Get current edit
    const currentEdit = edits[chat.currentEditIndex]
    if (!currentEdit) {
      throw new ConvexError('Current edit not found')
    }

    const editsWithUrls: Array<
      Doc<'edits'> & { outputImageUrl: string | null }
    > = await Promise.all(
      edits.map(async (edit) => ({
        ...edit,
        outputImageUrl: await ctx.storage.getUrl(edit.outputImageId),
      }))
    )

    return {
      chat,
      edits: editsWithUrls,
      currentEdit: editsWithUrls[chat.currentEditIndex],
      metadata: {
        isOnLatest: chat.currentEditIndex === chat.editHistory.length - 1,
        position: {
          current: chat.currentEditIndex + 1,
          total: chat.editHistory.length,
        },
      },
    }
  },
})
