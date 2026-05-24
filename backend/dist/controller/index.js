"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const chatService_1 = require("../services/chatService");
const conversation_1 = require("../schemas/conversation");
const memoryDataManager_1 = require("../data_store/memoryDataManager");
const signatureEmojiPool_1 = require("../services/signatureEmojiPool");
const router = express_1.default.Router();
router.get('/healthCheck', (_req, res) => {
    res.send('Hello world!');
});
router.get('/api/conversations', (_req, res) => {
    res.json({
        conversations: memoryDataManager_1.dataManager.getConversations(),
    });
});
router.post('/api/conversations', async (req, res, next) => {
    try {
        const body = conversation_1.createConversationSchema.parse(req.body);
        const conversation = await (0, chatService_1.createConversation)(body.title);
        res.status(201).json({
            conversation,
            messages: [],
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/api/conversations/:conversationId', (req, res) => {
    const conversationWithMessages = (0, chatService_1.getConversationWithMessages)(req.params.conversationId);
    if (!conversationWithMessages) {
        res.status(404).json({ message: 'Conversation was not found' });
        return;
    }
    res.json(conversationWithMessages);
});
router.patch('/api/conversations/:conversationId', async (req, res, next) => {
    try {
        if (!memoryDataManager_1.dataManager.getConversation(req.params.conversationId)) {
            res.status(404).json({ message: 'Conversation was not found' });
            return;
        }
        const body = conversation_1.updateConversationSchema.parse(req.body);
        const conversation = await (0, chatService_1.updateConversationTitle)(req.params.conversationId, body.title);
        res.json({ conversation });
    }
    catch (error) {
        next(error);
    }
});
router.get('/api/conversations/:conversationId/messages', (req, res) => {
    const conversation = memoryDataManager_1.dataManager.getConversation(req.params.conversationId);
    if (!conversation) {
        res.status(404).json({ message: 'Conversation was not found' });
        return;
    }
    res.json({
        messages: memoryDataManager_1.dataManager.getConversationMessages(conversation.id),
    });
});
router.post('/api/conversations/:conversationId/messages', async (req, res, next) => {
    try {
        if (!memoryDataManager_1.dataManager.getConversation(req.params.conversationId)) {
            res.status(404).json({ message: 'Conversation was not found' });
            return;
        }
        const body = conversation_1.createConversationMessageSchema.parse(req.body);
        const result = await (0, chatService_1.createUserMessageAndAssistantReply)(req.params.conversationId, body.content);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
router.use((error, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }
    if (error instanceof zod_1.z.ZodError) {
        res.status(400).json({
            message: 'Invalid request body',
            issues: error.issues,
        });
        return;
    }
    if (error instanceof signatureEmojiPool_1.SignatureEmojiPoolExhaustedError) {
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
exports.default = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJvbGxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUE4QjtBQUM5Qiw2QkFBc0I7QUFDdEIseURBS2lDO0FBQ2pDLDBEQUlpQztBQUNqQyx1RUFBNEQ7QUFDNUQsdUVBQWdGO0FBRWhGLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDaEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDdkMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDN0MsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNQLGFBQWEsRUFBRSwrQkFBVyxDQUFDLGdCQUFnQixFQUFFO0tBQzlDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUN6RCxJQUFJLENBQUM7UUFDSCxNQUFNLElBQUksR0FBRyx1Q0FBd0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBQSxnQ0FBa0IsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFMUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkIsWUFBWTtZQUNaLFFBQVEsRUFBRSxFQUFFO1NBQ2IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENB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