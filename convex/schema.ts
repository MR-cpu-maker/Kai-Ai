// Updated convex/schema.ts
import { v } from "convex/values";
import { defineTable, defineSchema } from "convex/server";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    createdAt: v.string(),
    credits: v.optional(v.number()),
    uid: v.string(), // Google Auth UID
  })
    .index("by_email", ["email"])
    .index("by_uid", ["uid"])
    .index("by_email_uid", ["email", "uid"]),

  userAiAssistants: defineTable({
    uid: v.id("users"),
    name: v.string(),
    title: v.string(),
    image: v.string(),
    instruction: v.string(),
    userInstruction: v.string(),
    sampleQuestions: v.array(v.string()),
    activatedAt: v.string(),
    createdAt: v.string(),
    assistantId: v.number(),
    userUid: v.string(),
  })
    .index("by_user", ["uid"])
    .index("by_user_uid", ["userUid"]),

  // Add these missing tables:
  chatSessions: defineTable({
    title: v.string(),
    userId: v.id("users"),
    assistantId: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    pinned: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    settings: v.optional(v.object({
      temperature: v.number(),
      maxTokens: v.number(),
      systemPrompt: v.optional(v.string()),
       assistantName: v.string(),
  assistantTitle: v.string(), 
  assistantIcon: v.string(),
  assistantAccent: v.string(),
  messageCount: v.number(),
  lastMessageAt: v.optional(v.string()),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_assistant", ["assistantId"])
    .index("by_created", ["createdAt"]),

  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    createdAt: v.number(),
    liked: v.optional(v.boolean()),
    metadata: v.optional(v.object({
      tokens: v.optional(v.number()),
      model: v.optional(v.string()),
      temperature: v.optional(v.number()),
    })),
  })
    .index("by_session", ["sessionId"])
    .index("by_created", ["createdAt"]),
});