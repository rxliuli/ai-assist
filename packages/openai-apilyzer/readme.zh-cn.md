# openai-apilyzer

一个下载 openai api 使用数据的 cli 工具，便于更进一步的分析使用情况。

> 前置条件：安装 [nodejs 18 lts](https://nodejs.org/en)

## 使用

```bash
npx @ai-assist/openai-apilyzer --authorization '<authorization>' --organization '<organization>'
# downloaded
# written to openai-api-usage-2023-02-28-2023-03-30.csv
```

然后就可以在 excel 中查看 csv 文件了。

![csv](https://github.com/rxliuli/ai-assist/blob/master/packages/openai-apilyzer/docs/csv.png)

## 选项

```bash
npx @ai-assist/openai-apilyzer -h
Usage: openai-apilyzer [options]

Options:
  --authorization <authorization>  authorization token
  --organization <organization>    organization id
  --start [start]                  start date, default is 30 days ago (default:
                                   "2023-02-28")
  --end [end]                      end date, default is today (default:
                                   "2023-03-30")
  --format [format]                json/csv format of output, default is json
                                   (default: "csv")
  --output [output]                output file, default is usage.[format]
  -V, --version                    output the version number
  -h, --help                       display help for command
```
