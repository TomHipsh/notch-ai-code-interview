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
const openAIResponseValidationError_1 = require("../services/openAIResponseValidationError");
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
    if (error instanceof openAIResponseValidationError_1.OpenAIResponseValidationError) {
        res.status(502).json({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJvbGxlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUE4QjtBQUM5Qiw2QkFBc0I7QUFDdEIseURBS2lDO0FBQ2pDLDBEQUlpQztBQUNqQyx1RUFBNEQ7QUFDNUQsdUVBQWdGO0FBQ2hGLDZGQUF3RjtBQUV4RixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3ZDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQzdDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDUCxhQUFhLEVBQUUsK0JBQVcsQ0FBQyxnQkFBZ0IsRUFBRTtLQUM5QyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDekQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxJQUFJLEdBQUcsdUNBQXdCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUEsZ0NBQWtCLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTFELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLFlBQVk7WUFDWixRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM1RCxNQUFNLHdCQUF3QixHQUFHLElBQUEseUNBQTJCLEVBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUV4RixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUM5QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSw0QkFBNEIsRUFBQyxDQUFDLENBQUM7UUFDOUQsT0FBTztJQUNULENBQUM7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQzFFLElBQUksQ0FBQztRQUNILElBQUksQ0FBQywrQkFBVyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7WUFDNUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsNEJBQTRCLEVBQUMsQ0FBQyxDQUFDO1lBQzlELE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsdUNBQXdCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUEscUNBQXVCLEVBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTFGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUNyRSxNQUFNLFlBQVksR0FBRywrQkFBVyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRTVFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSw0QkFBNEIsRUFBQyxDQUFDLENBQUM7UUFDOUQsT0FBTztJQUNULENBQUM7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1AsUUFBUSxFQUFFLCtCQUFXLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztLQUMvRCxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsNkNBQTZDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDbEYsSUFBSSxDQUFDO1FBQ0gsSUFBSSxDQUFDLCtCQUFXLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUM1RCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSw0QkFBNEIsRUFBQyxDQUFDLENBQUM7WUFDOUQsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyw4Q0FBK0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxnREFBa0MsRUFDckQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQ3pCLElBQUksQ0FBQyxPQUFPLENBQ2IsQ0FBQztRQUVGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQWMsRUFBRSxJQUFxQixFQUFFLEdBQXFCLEVBQUUsSUFBMEIsRUFBRSxFQUFFO0lBQ3RHLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNaLE9BQU87SUFDVCxDQUFDO0lBRUQsSUFBSSxLQUFLLFlBQVksT0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sRUFBRSxzQkFBc0I7WUFDL0IsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO1NBQ3JCLENBQUMsQ0FBQztRQUNILE9BQU87SUFDVCxDQUFDO0lBRUQsSUFBSSxLQUFLLFlBQVkscURBQWdDLEVBQUUsQ0FBQztRQUN0RCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87U0FDdkIsQ0FBQyxDQUFDO1FBQ0gsT0FBTztJQUNULENBQUM7SUFFRCxJQUFJLEtBQUssWUFBWSw2REFBNkIsRUFBRSxDQUFDO1FBQ25ELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztTQUN2QixDQUFDLENBQUM7UUFDSCxPQUFPO0lBQ1QsQ0FBQztJQUVELE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbkIsT0FBTyxFQUFFLHlCQUF5QjtLQUNuQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILGtCQUFlLE1BQU0sQ0FBQyJ9