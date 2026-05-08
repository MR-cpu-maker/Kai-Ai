import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const createUser = mutation({
  args: {
    uid: v.string(), // This should be the Google UID
    name: v.string(),
    email: v.string(),
    picture: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log('CreateUser mutation called with:', args);
      
      // Validate required fields
      if (!args.uid || !args.email || !args.name) {
        throw new Error('Missing required fields: uid, email, or name');
      }

      // First check if user exists by Google UID
      let existingUser = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('uid'), args.uid))
        .first();

      console.log('User lookup by UID result:', existingUser ? 'Found' : 'Not found');

      // If not found by UID, check by email as fallback
      if (!existingUser) {
        console.log('Checking by email fallback...');
        existingUser = await ctx.db
          .query('users')
          .filter((q) => q.eq(q.field('email'), args.email.toLowerCase()))
          .first();
        
        console.log('User lookup by email result:', existingUser ? 'Found' : 'Not found');
      }

      if (existingUser) {
        console.log('User already exists with ID:', existingUser._id);
        // Update existing user's info in case something changed
        await ctx.db.patch(existingUser._id, {
          name: args.name,
          picture: args.picture,
          uid: args.uid, // Ensure UID is set if it was missing
        });
        
        console.log('Updated existing user');
        return { 
          created: false, 
          id: existingUser._id,
          user: {
            ...existingUser,
            name: args.name,
            picture: args.picture,
            uid: args.uid,
          }
        };
      }

      // Create new user
      console.log('Creating new user...');
      const newUserData = {
        uid: args.uid,
        name: args.name,
        email: args.email.toLowerCase(),
        picture: args.picture,
        createdAt: new Date().toISOString(),
        credits: 1000, // Give new users some starting credits
      };

      const id = await ctx.db.insert('users', newUserData);

      console.log('New user created with ID:', id);
      
      // Return the complete user data
      return { 
        created: true, 
        id,
        user: {
          _id: id,
          ...newUserData,
        }
      };
    } catch (error) {
      console.error('Error in createUser mutation:', error);
      // Re-throw with more context
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Helper query to get user by ID
export const getUserById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    console.log('getUserById result:', user ? 'Found' : 'Not found');
    return user;
  },
});

// Helper query to get user by Google UID
export const getUserByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('uid'), args.uid))
      .first();
    
    console.log('getUserByUid result for UID:', args.uid, user ? 'Found' : 'Not found');
    return user;
  },
});

// Helper query to get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email.toLowerCase()))
      .first();
    
    console.log('getUserByEmail result for email:', args.email, user ? 'Found' : 'Not found');
    return user;
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    try {
      console.log('Deleting user with ID:', args.userId);

      // First, delete all related chat sessions
      const sessions = await ctx.db
        .query('chatSessions')
        .filter((q) => q.eq(q.field('userId'), args.userId))
        .collect();

      console.log('Found', sessions.length, 'chat sessions to delete');

      for (const session of sessions) {
        // Delete all messages in the session
        const messages = await ctx.db
          .query('chatMessages')
          .filter((q) => q.eq(q.field('sessionId'), session._id))
          .collect();

        console.log('Deleting', messages.length, 'messages for session', session._id);

        for (const message of messages) {
          await ctx.db.delete(message._id);
        }

        // Delete the session
        await ctx.db.delete(session._id);
      }

      // Delete all user AI assistants
      const userAssistants = await ctx.db
        .query('userAiAssistants')
        .filter((q) => q.eq(q.field('uid'), args.userId))
        .collect();

      console.log('Found', userAssistants.length, 'user assistants to delete');

      for (const assistant of userAssistants) {
        await ctx.db.delete(assistant._id);
      }

      // Finally, delete the user
      await ctx.db.delete(args.userId);

      console.log('User deletion completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});