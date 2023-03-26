import dotenv from 'dotenv'
import { App } from '@slack/bolt'
import { Configuration, OpenAIApi, CreateChatCompletionRequest, ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';

dotenv.config()

const openai = new OpenAIApi(new Configuration({ apiKey: process.env['OPENAI_API_KEY'] }));

const app = new App({
  token: process.env['SLACK_BOT_USER_OAUTH_TOKEN'],
  signingSecret: process.env['SLACK_SIGNING_SECRET'],
  socketMode: true,
  appToken: process.env['SLACK_APP_TOKEN'],
  port: 3000
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

    const request: CreateChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 2048
    }

    const res = await openai.createChatCompletion(request);
    await say({ text: res.data.choices[0].message?.content, thread_ts: ts });
  }
});

(async () => {
  await app.start();
  console.log('ChatGPT bot is running!')
})();
