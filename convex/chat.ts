import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// ── CREATE SESSION ─────────────────────────────────────────────────────────
export const createSession = mutation({
  args: {
    userId: v.id('users'),
    assistantId: v.optional(v.number()),
    assistantName: v.string(),
    assistantTitle: v.string(),
    assistantIcon: v.string(),
    assistantAccent: v.string(),
    firstMessage: v.optional(v.string()), // used to auto-generate title
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Auto-generate a title from the first message (first 50 chars)
    const title = args.firstMessage
      ? args.firstMessage.slice(0, 50) + (args.firstMessage.length > 50 ? '…' : '')
      : `${args.assistantName} Chat`;

    const sessionId = await ctx.db.insert('chatSessions', {
      title,
      userId: args.userId,
      assistantId: args.assistantId,
      createdAt: now,
      updatedAt: now,
      settings: {
        temperature: 0.7,
        maxTokens: 1000,
        assistantName: args.assistantName,
        assistantTitle: args.assistantTitle,
        assistantIcon: args.assistantIcon,
        assistantAccent: args.assistantAccent,
        messageCount: 0,
      },
    });

    return sessionId;
  },
});

// ── SAVE MESSAGE ───────────────────────────────────────────────────────────
export const saveMessage = mutation({
  args: {
    sessionId: v.id('chatSessions'),
    content: v.string(),
    role: v.union(v.literal('user'), v.literal('assistant')),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const msgId = await ctx.db.insert('chatMessages', {
      sessionId: args.sessionId,
      content: args.content,
      role: args.role,
      createdAt: now,
      metadata: args.model ? { model: args.model } : undefined,
    });

    // Update session updatedAt and increment messageCount
    const session = await ctx.db.get(args.sessionId);
    if (session?.settings) {
      await ctx.db.patch(args.sessionId, {
        updatedAt: now,
        settings: {
          ...session.settings,
          messageCount: (session.settings.messageCount ?? 0) + 1,
          lastMessageAt: new Date(now).toISOString(),
        },
      });
    }

    return msgId;
  },
});

// ── SAVE PAIR (user + assistant in one call) ───────────────────────────────
// Reduces round-trips: call once after AI responds
export const saveMessagePair = mutation({
  args: {
    sessionId: v.id('chatSessions'),
    userContent: v.string(),
    assistantContent: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const userMsgId = await ctx.db.insert('chatMessages', {
      sessionId: args.sessionId,
      content: args.userContent,
      role: 'user',
      createdAt: now - 1, // ensure ordering
    });

    const assistantMsgId = await ctx.db.insert('chatMessages', {
      sessionId: args.sessionId,
      content: args.assistantContent,
      role: 'assistant',
      createdAt: now,
      metadata: args.model ? { model: args.model } : undefined,
    });

    // Update session in one patch
    const session = await ctx.db.get(args.sessionId);
    if (session?.settings) {
      await ctx.db.patch(args.sessionId, {
        updatedAt: now,
        settings: {
          ...session.settings,
          messageCount: (session.settings.messageCount ?? 0) + 2,
          lastMessageAt: new Date(now).toISOString(),
        },
      });
    }

    return { userMsgId, assistantMsgId };
  },
});

// ── GET USER SESSIONS ──────────────────────────────────────────────────────
export const getUserSessions = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('chatSessions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(50); // last 50 sessions

    return sessions.filter((s) => !s.archived);
  },
});

// ── GET SESSION MESSAGES ───────────────────────────────────────────────────
export const getSessionMessages = query({
  args: { sessionId: v.id('chatSessions') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('chatMessages')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('asc')
      .collect();
  },
});

// ── GET SESSION ────────────────────────────────────────────────────────────
export const getSession = query({
  args: { sessionId: v.id('chatSessions') },
  handler: async (ctx, args) => {
    return ctx.db.get(args.sessionId);
  },
});

// ── UPDATE SESSION TITLE ───────────────────────────────────────────────────
export const updateSessionTitle = mutation({
  args: {
    sessionId: v.id('chatSessions'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { title: args.title });
  },
});

// ── ARCHIVE SESSION ────────────────────────────────────────────────────────
export const archiveSession = mutation({
  args: { sessionId: v.id('chatSessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { archived: true });
  },
});

// ── DELETE SESSION (cascade) ───────────────────────────────────────────────
export const deleteSession = mutation({
  args: { sessionId: v.id('chatSessions') },
  handler: async (ctx, args) => {
    // Delete all messages first
    const messages = await ctx.db
      .query('chatMessages')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .collect();

    await Promise.all(messages.map((m) => ctx.db.delete(m._id)));
    await ctx.db.delete(args.sessionId);
  },
});

// ── LIKE / UNLIKE MESSAGE ──────────────────────────────────────────────────
export const toggleMessageLike = mutation({
  args: {
    messageId: v.id('chatMessages'),
    liked: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { liked: args.liked });
  },
});

// ── GET USER STATS ─────────────────────────────────────────────────────────
export const getUserStats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('chatSessions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce(
      (acc, s) => acc + (s.settings?.messageCount ?? 0),
      0
    );

    // Most used assistant
    const assistantCounts: Record<string, number> = {};
    for (const s of sessions) {
      const name = s.settings?.assistantName ?? 'Unknown';
      assistantCounts[name] = (assistantCounts[name] ?? 0) + 1;
    }
    const topAssistant = Object.entries(assistantCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return { totalSessions, totalMessages, topAssistant };
  },
});