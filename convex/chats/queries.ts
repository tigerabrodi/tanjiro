import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'
import { query } from '../_generated/server'

export const getUserChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new ConvexError('You must be logged in to view your chats.')
    }

    const chats = await ctx.db
      .query('chats')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()

    return chats
  },
})
