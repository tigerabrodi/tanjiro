import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// Define the schema for the application
export default defineSchema({
  // Include Convex Auth tables
  ...authTables,

  // Users table (extends the auth user)
  users: defineTable({
    email: v.string(),
    updatedAt: v.number(),
    geminiApiKey: v.optional(
      v.object({
        encryptedKey: v.array(v.number()), // For encrypted Hume.ai API key storage
        initializationVector: v.array(v.number()), // IV for encryption
      })
    ),
  }).index('by_email', ['email']),

  chats: defineTable({
    title: v.string(), // defaults to "Untitled", user can edit
    userId: v.id('users'),
    editHistory: v.array(v.id('edits')), // linear sequence of edits
    currentEditIndex: v.number(), // which edit user is viewing (0, 1, 2...)
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  edits: defineTable({
    chatId: v.id('chats'),
    userPrompt: v.string(),
    inputImageId: v.id('_storage'), // the image that was edited
    outputImageId: v.id('_storage'), // the result from Gemini
    aiResponseText: v.string(), // Gemini's explanation
    createdAt: v.number(),
  }),
})
