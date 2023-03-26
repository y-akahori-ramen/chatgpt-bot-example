import dotenv from 'dotenv'
import { App } from '@slack/bolt'
import { Configuration, OpenAIApi } from 'openai';

dotenv.config()

const openai = new OpenAIApi(new Configuration({ apiKey: process.env['OPENAI_API_KEY'] }));

async function gptResnponse(text: string): Promise<string> {
  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      max_tokens: 2048,
      prompt: text,
    });
    return completion.data.choices[0]?.text ?? "Undefined";
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    } else {
      return 'Unknown Error'
    }
  }
}

const app = new App({
  token: process.env['SLACK_BOT_USER_OAUTH_TOKEN'],
  signingSecret: process.env['SLACK_SIGNING_SECRET'],
  socketMode: true,
  appToken: process.env['SLACK_APP_TOKEN'],
  port: 3000
});

app.event('app_mention', async ({ say, event }) => {
  const response = await gptResnponse(event.text);
  await say(response)
});

(async () => {
  await app.start();
  console.log('ChatGPT bot is running!')
})();
