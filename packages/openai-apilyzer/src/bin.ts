import chalk from 'chalk'
import { Command } from 'commander'
import dayjs from 'dayjs'
import { writeFile } from 'fs/promises'
import path from 'path'
import { version } from '../package.json'
import { downloadUsage, formats } from './download'
import { pick } from 'lodash-es'

new Command()
  .requiredOption('--authorization <authorization>', 'authorization token')
  .requiredOption('--organization <organization>', 'organization id')
  .option('--start [start]', 'start date, default is 30 days ago', dayjs().subtract(30, 'day').format('YYYY-MM-DD'))
  .option('--end [end]', 'end date, default is today', dayjs().format('YYYY-MM-DD'))
  .option('--format [format]', 'json/csv format of output, default is json', 'csv')
  .option(
    '--output [output]',
    'output file, default is openai-api-usage-{options.start}-{options.end}.{options.format}',
  )
  // other https://openai.ai-assist.moe
  .option('--baseUrl [baseUrl]', 'base url of openai api', 'https://api.openai.com')
  .option('--verbose', 'verbose output', false)
  .option('--userPublicId [userPublicId]', 'user public id')
  .action(
    async (options: {
      authorization: string
      organization: string
      start: string
      end: string
      format: 'json' | 'csv'
      output?: string
      baseUrl: string
      verbose: boolean
      userPublicId: string
    }) => {
      console.log(chalk.blue('start downloading'))
      try {
        const r = await downloadUsage({
          ...pick(options, 'authorization', 'organization', 'baseUrl', 'userPublicId', 'verbose'),
          start: dayjs(options.start),
          end: dayjs(options.end),
          callback: (date: string) => {
            console.log(chalk.blue(`downloading ${date}`))
          },
        })
        console.log(chalk.green('downloaded'))
        const output = options.output ?? `openai-api-usage-${options.start}-${options.end}.${options.format}`
        await writeFile(path.resolve(output), await formats[options.format](r))
        console.log(chalk.green(`written to ${output}`))
      } catch (err) {
        if (err instanceof Error) {
          if (options.verbose) {
            console.error(err)
          } else {
            console.error(chalk.red(err.message))
          }
          return
        }
        throw err
      }
    },
  )
  .version(version)
  .parse()
