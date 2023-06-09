import dotenv from 'dotenv'
import { App } from '@slack/bolt'
import { Configuration, OpenAIApi, CreateChatCompletionRequest, ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';
import fs from 'fs';

dotenv.config()

const openai = new OpenAIApi(new Configuration({ apiKey: process.env['OPENAI_API_KEY'] }));

type Config = {
  model: string,
  max_tokens: number,
  system_message: string,
  port: number
}
const config: Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
config.model ??= 'gpt-3.5-turbo';
config.max_tokens ??= 2048;
config.system_message ??= 'You are a helpful assistant.';
config.port ??= 3000;

const app = new App({
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
  } else {
    const messages = replies.messages.map((message): ChatCompletionRequestMessage => {
      const role = message.bot_id === undefined ? ChatCompletionRequestMessageRoleEnum.User : ChatCompletionRequestMessageRoleEnum.Assistant
      return { role: role, content: message.text ?? '' }
    });
    messages.unshift({ role: ChatCompletionRequestMessageRoleEnum.System, content: config.system_message });

    const request: CreateChatCompletionRequest = {
      model: config.model,
      messages: messages,
      max_tokens: config.max_tokens
    };

    try {
      const res = await openai.createChatCompletion(request);
      await say({ text: res.data.choices[0].message?.content, thread_ts: ts });
    } catch (e) {
      if (e instanceof Error) {
        await say({ text: `Error: ${e.message}`, thread_ts: ts });
      } else {
        await say({ text: 'Unknown Error.', thread_ts: ts });
      }
    }
  }
});

(async () => {
  await app.start();
  console.log('ChatGPT bot is running!')

  const stop = () => {
    console.log('Stopping bot...');
    app.stop()
    console.log('Stopped.');
  }
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
})();
