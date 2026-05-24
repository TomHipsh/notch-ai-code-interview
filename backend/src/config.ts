import path from 'node:path';
import dotenv from 'dotenv';
import {z} from "zod";

dotenv.config({path: path.resolve(__dirname, '..', '.env')});

const configSchema = z.object({
    PORT: z.number({coerce: true}).default(3000),
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_MODEL: z.string().min(1).default('gpt-4o-mini'),
});
export const config = configSchema.parse(process.env);
