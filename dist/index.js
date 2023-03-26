"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const bolt_1 = require("@slack/bolt");
const openai_1 = require("openai");
dotenv_1.default.config();
const openai = new openai_1.OpenAIApi(new openai_1.Configuration({ apiKey: process.env['OPENAI_API_KEY'] }));
async function gptResnponse(text) {
    try {
        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            max_tokens: 2048,
            prompt: text,
        });
        return completion.data.choices[0]?.text ?? "Undefined";
    }
    catch (e) {
        if (e instanceof Error) {
            return e.message;
        }
        else {
            return 'Unknown Error';
        }
    }
}
const app = new bolt_1.App({
    token: process.env['SLACK_BOT_USER_OAUTH_TOKEN'],
    signingSecret: process.env['SLACK_SIGNING_SECRET'],
    socketMode: true,
    appToken: process.env['SLACK_APP_TOKEN'],
    port: 3000
});
app.event('app_mention', async ({ say, event }) => {
    const response = await gptResnponse(event.text);
    await say(response);
});
(async () => {
    await app.start();
    console.log('ChatGPT bot is running!');
})();
//# sourceMappingURL=index.js.map