FROM node:19-alpine3.16

WORKDIR /usr/app
COPY ./config.json .
COPY ./package.json .
COPY ./package-lock.json .
COPY ./dist/ ./dist/

RUN npm install --production
ENV NODE_ENV production

CMD ["node", "./dist/index.js"]
