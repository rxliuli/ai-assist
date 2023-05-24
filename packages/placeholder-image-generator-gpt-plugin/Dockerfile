FROM --platform=linux/amd64 node:lts-alpine
RUN npm i -g pnpm
COPY ./dist/package.json ./
RUN pnpm i -P
COPY ./dist ./dist
COPY ./public ./public
CMD ["pnpm", "start"]
