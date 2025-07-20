'use node'

import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'

import { api } from '../_generated/api'
import type { Doc, Id } from '../_generated/dataModel'
import { action } from '../_generated/server'

import {
  createChatWithEdits,
  editImageWithGemini,
  generateImageWithGemini,
} from './helpers'

/**
 * Create chat from uploaded image (with optional first edit)
 */
export const createChatFromUpload = action({
  args: {
    storageId: v.id('_storage'),
    prompt: v.string(), // If provided, do first edit immediately
  },
  handler: async (ctx, args): Promise<{ chatId: Id<'chats'> }> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }

    const editedResult = await editImageWithGemini({
      ctx,
      inputImageId: args.storageId,
      prompt: args.prompt,
    })

    // Create chat with both original and edited images
    const chatId = await createChatWithEdits({
      ctx,
      edits: [
        {
          userPrompt: args.prompt,
          inputImageId: args.storageId,
          outputImageId: editedResult.outputImageId,
          aiResponseText: editedResult.aiResponseText,
        },
      ],
      currentEditIndex: 0,
    })

    return { chatId }
  },
})

/**
 * Create chat from text-to-image generation
 */
export const createChatFromGeneration = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args): Promise<{ chatId: Id<'chats'> }> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }

    // Generate image with Gemini
    const result = await generateImageWithGemini({
      ctx,
      prompt: args.prompt,
    })

    // Create chat with generated image
    const chatId = await createChatWithEdits({
      ctx,
      edits: [
        {
          userPrompt: args.prompt,
          inputImageId: result.outputImageId, // For generation, input = output initially
          outputImageId: result.outputImageId,
          aiResponseText: result.aiResponseText,
        },
      ],
      currentEditIndex: 0,
    })

    return { chatId }
  },
})

/**
 * Add new edit to existing chat
 */
export const addEditToChat = action({
  args: {
    chatId: v.id('chats'),
    prompt: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ chatId: Id<'chats'>; isNewChat: boolean }> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }

    const chat = await ctx.runQuery(api.chats.queries.getChatDetail, {
      chatId: args.chatId,
    })

    const isNotOwner = chat.chat.userId !== userId

    if (isNotOwner) {
      throw new ConvexError('Not authorized')
    }

    const isOnLatestEdit = chat.metadata.isOnLatest

    if (!isOnLatestEdit) {
      // Create new chat from current point
      const { chatId } = await ctx.runAction(
        api.chats.actions.createChatFromEdit,
        {
          originalChatId: args.chatId,
          fromEditIndex: chat.chat.currentEditIndex,
          newPrompt: args.prompt,
        }
      )

      return { chatId, isNewChat: true }
    }

    // Get current image to edit
    const currentEdit = chat.currentEdit
    const editResult = await editImageWithGemini({
      ctx,
      inputImageId: currentEdit.outputImageId,
      prompt: args.prompt,
    })

    // Create new edit
    const newEditId = await ctx.runMutation(api.edits.mutations.insertEdit, {
      chatId: args.chatId,
      userPrompt: args.prompt,
      inputImageId: currentEdit.outputImageId,
      outputImageId: editResult.outputImageId,
      aiResponseText: editResult.aiResponseText,
    })

    // Add to chat history and move to latest
    await ctx.runMutation(api.chats.mutations.appendEditToChat, {
      chatId: args.chatId,
      editId: newEditId,
    })

    return { chatId: args.chatId, isNewChat: false }
  },
})

/**
 * Create new chat from historical edit (branching)
 */
export const createChatFromEdit = action({
  args: {
    originalChatId: v.id('chats'),
    fromEditIndex: v.number(),
    newPrompt: v.string(),
  },
  handler: async (ctx, args): Promise<{ chatId: Id<'chats'> }> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }

    // Get original chat details
    const originalChat = await ctx.runQuery(api.chats.queries.getChatDetail, {
      chatId: args.originalChatId,
    })

    if (originalChat.chat.userId !== userId) {
      throw new ConvexError('Not authorized')
    }

    // Get the edit we're branching from
    const branchFromEdit = originalChat.edits[args.fromEditIndex]
    if (!branchFromEdit) {
      throw new ConvexError('Edit not found')
    }

    // Generate new edit
    const editResult = await editImageWithGemini({
      ctx,
      inputImageId: branchFromEdit.outputImageId,
      prompt: args.newPrompt,
    })

    // Get history up to branch point
    const historyUpToPoint = originalChat.edits.slice(0, args.fromEditIndex + 1)

    // Create edits for new chat
    const editsForNewChat = [
      ...historyUpToPoint.map((edit: Doc<'edits'>) => ({
        userPrompt: edit.userPrompt,
        inputImageId: edit.inputImageId,
        outputImageId: edit.outputImageId,
        aiResponseText: edit.aiResponseText,
      })),
      {
        userPrompt: args.newPrompt,
        inputImageId: branchFromEdit.outputImageId,
        outputImageId: editResult.outputImageId,
        aiResponseText: editResult.aiResponseText,
      },
    ]

    const newChatId: Id<'chats'> = await createChatWithEdits({
      ctx,
      edits: editsForNewChat,
      currentEditIndex: editsForNewChat.length - 1, // Start on new edit
    })

    return { chatId: newChatId }
  },
})
