import {nativeMath, sample} from 'random-js';
import {search} from 'node-emoji';
import {MessageEntity} from '../entities/message';

export class SignatureEmojiPoolExhaustedError extends Error {
    constructor() {
        super('No unused signature emojis are available for this conversation');
    }
}

const signatureEmojiPool = Array.from(
    new Set(search('').map(({emoji}) => emoji)),
);

export const selectUnusedSignatureEmoji = (messages: MessageEntity[]): string => {
    const usedEmojis = new Set(
        messages
            .map((message) => message.signatureEmoji)
            .filter((signatureEmoji): signatureEmoji is string => Boolean(signatureEmoji)),
    );

    const availableEmojis = signatureEmojiPool.filter((emoji) => !usedEmojis.has(emoji));

    if (availableEmojis.length === 0) {
        throw new SignatureEmojiPoolExhaustedError();
    }

    const selectedEmoji = sample(nativeMath, availableEmojis, 1)[0];

    if (!selectedEmoji) {
        throw new SignatureEmojiPoolExhaustedError();
    }

    return selectedEmoji;
};
