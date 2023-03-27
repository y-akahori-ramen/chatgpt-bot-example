"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const bolt_1 = require("@slack/bolt");
const openai_1 = require("openai");
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const openai = new openai_1.OpenAIApi(new openai_1.Configuration({ apiKey: process.env['OPENAI_API_KEY'] }));
const config = JSON.parse(fs_1.default.readFileSync('./config.json', 'utf8'));
config.model ??= 'gpt-3.5-turbo';
config.max_tokens ??= 2048;
config.system_message ??= 'You are a helpful assistant.';
config.port ??= 3000;
const app = new bolt_1.App({
    token: process.env['SLACK_BOT_USER_OAUTH_TOKEN'],
    signingSecret: process.env['SLACK_SIGNING_SECRET'],
    socketMode: true,
    appToken: process.env['SLACK_APP_TOKEN'],
    port: config.port
});
app.event('app_mention', async ({ say, event, client }) => {
    const ts = event.thread_ts ?? event.event_ts;
    const replies = await client.conversations.replies({ channel: event.channel, ts: ts });
    if (replies.messages === undefined) {
        await say({ text: 'Internal Error. Failed to get thread replies.', thread_ts: ts });
    }
    else {
        const messages = replies.messages.map((message) => {
            const role = message.bot_id === undefined ? openai_1.ChatCompletionRequestMessageRoleEnum.User : openai_1.ChatCompletionRequestMessageRoleEnum.Assistant;
            return { role: role, content: message.text ?? '' };
        });
        messages.unshift({ role: openai_1.ChatCompletionRequestMessageRoleEnum.System, content: config.system_message });
        const request = {
            model: config.model,
            messages: messages,
            max_tokens: config.max_tokens
        };
        try {
            const res = await openai.createChatCompletion(request);
            await say({ text: res.data.choices[0].message?.content, thread_ts: ts });
        }
        catch (e) {
            if (e instanceof Error) {
                await say({ text: `Error: ${e.message}`, thread_ts: ts });
            }
            else {
                await say({ text: 'Unknown Error.', thread_ts: ts });
            }
        }
    }
});
(async () => {
    await app.start();
    console.log('ChatGPT bot is running!');
})();
//# sourceMappingURL=index.js.map