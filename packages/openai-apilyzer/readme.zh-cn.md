# openai-apilyzer

一个下载 openai api 使用数据的 cli 工具，便于更进一步的分析使用情况。

> 前置条件：安装 [nodejs 18 lts](https://nodejs.org/en)

## 使用

```bash
npx i @ai-assist/openai-apilyzer --authorization '<authorization>' --organization '<organization>'
# downloaded
# written to openai-api-usage-2023-02-28-2023-03-30.csv
```

然后就可以在 excel 中查看 csv 文件了。

![csv](https://github.com/rxliuli/ai-assist/blob/master/packages/openai-apilyzer/docs/csv.png)
