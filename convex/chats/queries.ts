import { getAuthUserId } from '@convex-dev/auth/server'
import { query } from '../_generated/server'
import { CustomConvexError } from '../error'

export const getUserChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new CustomConvexError('You must be logged in to view your chats.')
    }

    const chats = await ctx.db
      .query('chats')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()

    return chats
  },
})
