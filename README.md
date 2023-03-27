# chatgpt-bot-example
This is an example of creating a ChatGPT SlackBot.

# Usage
1. Create a SlackApp based on slackAppManifest.yml.
2. Create an .env file and specify the OpenAI and SlackApp key information.

Node.js

3. Install the libraries with `npm install`.
4. Start the bot with `node ./dist/index.js`.

Docker

3. Start the bot with `docker compose up`.

.env file example
```
OPENAI_API_KEY=123456
SLACK_SIGNING_SECRET=123456
SLACK_BOT_USER_OAUTH_TOKEN=123456
SLACK_APP_TOKEN=123456
```
