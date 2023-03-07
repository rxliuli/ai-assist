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
  -p 8080:8080 \
  rxliuli/chat-server:latest
```

| 环境变量                 | 必填 | 说明                   |
| ------------------------ | ---- | ---------------------- |
| `OPENAI_API_KEY`         | 是   | OpenAI API Key         |
| `AZURE_COGNITIVE_REGION` | 否   | Azure 语音识别区域配置 |
| `AZURE_COGNITIVE_KEY`    | 否   | Azure 语音识别密钥配置 |

> 语音识别功能需要 Azure 语音识别服务，需要自行申请，申请后需要配置区域和密钥，但不是必填项，因为语音模式是单独的。
