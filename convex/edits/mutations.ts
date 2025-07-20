import { v } from 'convex/values'

import { mutation } from '../_generated/server'

/**
 * Insert edit (called from actions)
 */
export const insertEdit = mutation({
  args: {
    chatId: v.id('chats'),
    userPrompt: v.string(),
    inputImageId: v.id('_storage'),
    outputImageId: v.id('_storage'),
    aiResponseText: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('edits', {
      chatId: args.chatId,
      userPrompt: args.userPrompt,
      inputImageId: args.inputImageId,
      outputImageId: args.outputImageId,
      aiResponseText: args.aiResponseText,
      createdAt: Date.now(),
    })
  },
})
