import {
    ChatCompletionMessageParam,
    ChatCompletionTool,
    ChatCompletionToolChoiceOption,
} from 'openai/resources/chat/completions';
import {z} from 'zod';
import {config} from '../config';
import {MessageEntity} from '../entities/message';
import {openaiClient} from './openaiClient';

const RATE_USER_SENTIMENT_TOOL_NAME = 'rate_user_sentiment';

const sentimentToolArgumentsSchema = z.object({
    sentimentScore: z.number().int().min(0).max(100),
});

const sentimentTools: ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: RATE_USER_SENTIMENT_TOOL_NAME,
            description: 'Rates the current sentiment of the latest user message from 0 to 100.',
            strict: true,
            parameters: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    sentimentScore: {
                        type: 'integer',
                        minimum: 0,
                        maximum: 100,
                        description: '0 is very negative, 50 is neutral, and 100 is very positive.',
                    },
                },
                required: ['sentimentScore'],
            },
        },
    },
];

const sentimentToolChoice: ChatCompletionToolChoiceOption = {
    type: 'function',
    function: {
        name: RATE_USER_SENTIMENT_TOOL_NAME,
    },
};

export const rateLatestUserSentiment = async (messages: MessageEntity[]): Promise<number> => {
    const completion = await openaiClient.chat.completions.create({
        model: config.OPENAI_MODEL,
        messages: buildSentimentPromptMessages(messages),
        tools: sentimentTools,
        tool_choice: sentimentToolChoice,
        temperature: 0,
    });

    const toolCall = completion.choices[0]?.message.tool_calls?.find(
        (call) => call.type === 'function' && call.function.name === RATE_USER_SENTIMENT_TOOL_NAME,
    );

    if (!toolCall) {
        throw new Error('Sentiment tool call was not returned');
    }

    const parsedArguments = sentimentToolArgumentsSchema.parse(
        JSON.parse(toolCall.function.arguments),
    );

    return parsedArguments.sentimentScore;
};

const buildSentimentPromptMessages = (messages: MessageEntity[]): ChatCompletionMessageParam[] => [
    {
        role: 'system',
        content: [
            '<role>',
            'You extract the current user sentiment from a chat conversation.',
            '</role>',
            '',
            '<task_description>',
            'Rate only the latest user message sentiment using the surrounding conversation as context.',
            'Return 0 for very negative, 50 for neutral, and 100 for very positive.',
            '</task_description>',
            '',
            '<guardrails>',
            'Use the required tool only.',
            'Do not rate assistant messages.',
            'Do not include explanation text.',
            '</guardrails>',
        ].join('\n'),
    },
    ...messages.map((message) => ({
        role: message.role,
        content: message.content,
    })),
];
