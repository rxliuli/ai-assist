# Chat 对话机器人

## 使用

你可以直接与它开始对话，它会以打字机模式回复。

![cover](./assets/cover.png)

## 安装

如果你希望更快捷的打开它，你可以将应用添加到屏幕。在 web 上，一般点击右上角的安装按钮即可，例如
![install-desktop](./assets/install-desktop.png)

在移动端 chrome 中，你可以点击右上角的三个点，然后选择添加到主屏幕，
![install-mobile](./assets/install-mobile.png)

## 自行部署

使用 docker 部署在美国区域的云服务器即可。

```bash
docker run -itd --name chat-server \
  -e OPENAI_API_KEY=your-api-key \
  -e DATABASE_URL=pgsql-url \
  -p 8080:8080 \
  rxliuli/chat-server:latest
```

| 环境变量         | 必填 | 说明                  |
| ---------------- | ---- | --------------------- |
| `OPENAI_API_KEY` | 是   | OpenAI API Key        |
| `DATABASE_URL`   | 是   | postgresql 数据库 url |

## 开发

1. fork && git clone
2. pnpm i # 请务必注意网络问题，不要使用 npm 的非官方镜像（例如淘宝源）

### 运行客户端

如果你只想修改客户端的一些样式或者功能，你只需要运行客户端即可，不需要运行服务端。

1. 在 packages/chat/ 目录下 pnpm dev 运行客户端
2. 打开 <http://localhost:5174/>

### 运行服务端

如果你需要涉及到数据库结构变更或服务端接口变更，则需要同时运行服务端。

1. 启动本地的 docker，使用 tsx 运行 packages/chat-server/scripts/pgsql.ts 脚本启动一个本地的 postgresql 数据库
2. 创建 packages/chat-server/.env 添加 OPENAI_API_KEY/DATABASE_URL 环境变量，DATABASE_URL 示例 `DATABASE_URL="postgres://postgres:postgrespw@localhost:5432/chat?schema=public"`
3. 配置 packages/chat/.env.local 添加 `SERVER_URL='http://localhost:8080/'` 以将服务器指向本地
4. 在 packages/chat-server/ 目录下 pnpm dev 运行服务端
