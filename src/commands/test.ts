/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import { flags } from '@oclif/command'
import { CLICommand } from '../command'
import Bundle from './bundle'
import * as path from 'path'
import * as fs from 'fs'
import chalk from 'chalk'
import { SourceTester } from '../source-tester'
import { SourceTestRequest } from '../devtools/generated/typescript/PDTSourceTester_pb'

export default class Test extends CLICommand {
  static override description = 'describe the command here'

  static override flags = {
    ip: flags.string({ name: 'ip', default: undefined }),
    port: flags.integer({ name: 'port', default: 27015 }),
  }

  static override args = [
    {
      name: 'source',
      required: false,
      description: '(optional) The source to test',
      default: undefined,
    },
  ]

  async run() {
    const { flags, args } = this.parse(Test)

    const sourceId = args.source
    const cwd = process.cwd()
    const bundleDir = path.join(cwd, 'bundles')

    await Bundle.run([])

    let sourcesToTest: string[] = []
    if (sourceId) {
      sourcesToTest = fs.readdirSync(bundleDir).filter(file => {
        return file.toLowerCase() === sourceId.toLowerCase() && fs.statSync(path.join(bundleDir, file)).isDirectory()
      })
    } else {
      sourcesToTest = fs.readdirSync(bundleDir).filter(file => fs.statSync(path.join(bundleDir, file)).isDirectory())
    }

    if (flags.ip) {
      // connect to the app here
    } else {
      console.clear()
      const tester = new SourceTester(bundleDir)
      for (const source of sourcesToTest) {
        this.log()
        this.log(chalk.bold.underline.bgBlue.white(`Testing ${source}`))
        const request = new SourceTestRequest()
        request.setSourceid(source)
        request.setData(new SourceTestRequest.TestData())

        await tester.testSource(request, async response => {
          this.log(`${chalk.red.bold('#')} ${chalk.bold(response.getTestcase())}: ${chalk.green(response.getCompletetime().toFixed(0) + 'ms')}`)

          const failures = response.getFailuresList()
          failures.forEach(failure => {
            this.log(`- ${chalk.white.bgRed('[FAILURE]')} ${failure}`)
          })

          if (failures.length > 0) this.log()
        })
      }
      this.log()
    }
  }
}
