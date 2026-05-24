"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: node_path_1.default.resolve(__dirname, '..', '.env') });
const configSchema = zod_1.z.object({
    PORT: zod_1.z.number({ coerce: true }).default(3000),
    OPENAI_API_KEY: zod_1.z.string().min(1),
    OPENAI_MODEL: zod_1.z.string().min(1).default('gpt-4o-mini'),
});
exports.config = configSchema.parse(process.env);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwREFBNkI7QUFDN0Isb0RBQTRCO0FBQzVCLDZCQUFzQjtBQUV0QixnQkFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxtQkFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUU3RCxNQUFNLFlBQVksR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQzFCLElBQUksRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUM1QyxjQUFjLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDakMsWUFBWSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztDQUN6RCxDQUFDLENBQUM7QUFDVSxRQUFBLE1BQU0sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyJ9