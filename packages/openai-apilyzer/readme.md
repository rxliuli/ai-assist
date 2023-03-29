# openai-apilyzer

A CLI tool for downloading data from the OpenAI API to facilitate further analysis of usage.

## Usage

> Prerequisite: Install [nodejs 18 lts](https://nodejs.org/en)

```bash
npx i @ai-assist/openai-apilyzer --authorization '<authorization>' --organization '<organization>'
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
