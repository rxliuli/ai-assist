# openai-apilyzer

A CLI tool for downloading data from the OpenAI API to facilitate further analysis of usage.

## Usage

> Prerequisite: Install [nodejs 18 lts](https://nodejs.org/en)

```bash
npx @ai-assist/openai-apilyzer --authorization '<authorization>' --organization '<organization>'
# downloaded
# written to openai-api-usage-2023-02-28-2023-03-30.csv
```

The CSV file can then be viewed in Excel.

![csv](https://github.com/rxliuli/ai-assist/blob/master/packages/openai-apilyzer/docs/csv.png)

## Options

```bash
npx @ai-assist/openai-apilyzer -h
Usage: openai-apilyzer [options]

Options:
  --authorization <authorization>    authorization token
  --organization <organization>      organization id
  --start [start]                    start date, default is 30 days ago (default: "2023-03-14")
  --end [end]                        end date, default is today (default: "2023-04-13")
  --format [format]                  json/csv format of output, default is json (default: "csv")
  --output [output]                  output file, default is openai-api-usage-{options.start}-{options.end}.{options.format}
  --baseUrl [baseUrl]                base url of openai api (default: "https://api.openai.com")
  --verbose                          verbose output (default: false)
  --user_public_id [user_public_id]  user public id
  -V, --version                      output the version number
  -h, --help                         display help for command
```

**Note** that if you are in China or other regions where access to the openai API is not possible, you can use the `--baseUrl` parameter to specify a mirror address, such as <https://openai.ai-assist.moe>, which can be deployed to a Cloudflare Worker at zero cost through the open source project [openai-proxy](https://github.com/fuergaosi233/openai-proxy).
