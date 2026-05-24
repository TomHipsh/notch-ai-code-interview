import express from "express";
import {z} from 'zod';
import {
  createConversation,
  createUserMessageAndAssistantReply,
  getConversationWithMessages,
  updateConversationTitle,
} from '../services/chatService';
import {
  createConversationMessageSchema,
  createConversationSchema,
  updateConversationSchema,
} from '../schemas/conversation';
import {dataManager} from '../data_store/memoryDataManager';
import {SignatureEmojiPoolExhaustedError} from '../services/signatureEmojiPool';

const router = express.Router();
router.get('/healthCheck', (_req, res) => {
  res.send('Hello world!');
});

router.get('/api/conversations', (_req, res) => {
  res.json({
    conversations: dataManager.getConversations(),
  });
});

router.post('/api/conversations', async (req, res, next) => {
  try {
    const body = createConversationSchema.parse(req.body);
    const conversation = await createConversation(body.title);

    res.status(201).json({
      conversation,
      messages: [],
    });
  } catch (error) {
    next(error);
  }
});

router.get('/api/conversations/:conversationId', (req, res) => {
  const conversationWithMessages = getConversationWithMessages(req.params.conversationId);

  if (!conversationWithMessages) {
    res.status(404).json({message: 'Conversation was not found'});
    return;
  }

  res.json(conversationWithMessages);
});

router.patch('/api/conversations/:conversationId', async (req, res, next) => {
  try {
    if (!dataManager.getConversation(req.params.conversationId)) {
      res.status(404).json({message: 'Conversation was not found'});
      return;
    }

    const body = updateConversationSchema.parse(req.body);
    const conversation = await updateConversationTitle(req.params.conversationId, body.title);

    res.json({conversation});
  } catch (error) {
    next(error);
  }
});

router.get('/api/conversations/:conversationId/messages', (req, res) => {
  const conversation = dataManager.getConversation(req.params.conversationId);

  if (!conversation) {
    res.status(404).json({message: 'Conversation was not found'});
    return;
  }

  res.json({
    messages: dataManager.getConversationMessages(conversation.id),
  });
});

router.post('/api/conversations/:conversationId/messages', async (req, res, next) => {
  try {
    if (!dataManager.getConversation(req.params.conversationId)) {
      res.status(404).json({message: 'Conversation was not found'});
      return;
    }

    const body = createConversationMessageSchema.parse(req.body);
    const result = await createUserMessageAndAssistantReply(
      req.params.conversationId,
      body.content,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof z.ZodError) {
    res.status(400).json({
      message: 'Invalid request body',
      issues: error.issues,
    });
    return;
  }

  if (error instanceof SignatureEmojiPoolExhaustedError) {
    res.status(409).json({
      message: error.message,
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    message: 'Unexpected server error',
  });
});

export default router;
