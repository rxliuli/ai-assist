FROM --platform=linux/amd64 node:lts-alpine
COPY ./package.json ./
RUN npm i -g pnpm
RUN pnpm i -P
COPY ./dist ./
CMD ["node", "main.cjs"]
