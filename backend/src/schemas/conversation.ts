import {z} from 'zod';

export const createConversationSchema = z.object({
    title: z.string().trim().min(1).max(120).optional(),
});

export const updateConversationSchema = z.object({
    title: z.string().trim().min(1).max(120),
});

export const createConversationMessageSchema = z.object({
    content: z.string().trim().min(1).max(8000),
});
