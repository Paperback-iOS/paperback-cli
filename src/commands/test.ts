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
  static description = 'describe the command here'

  static flags = {
    ip: flags.string({ name: 'ip', default: undefined }),
    port: flags.integer({ name: 'port', default: 27015 }),
  }

  static args = [
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
      sourcesToTest = [sourceId]
    } else {
      sourcesToTest = fs.readdirSync(bundleDir).filter(file => fs.statSync(path.join(bundleDir, file)).isDirectory())
    }

    if (flags.ip) {
      // connect to the app here
    } else {
      const tester = new SourceTester(bundleDir)
      for (const source of sourcesToTest) {
        const request = new SourceTestRequest()
        request.setSourceid(source)
        request.setData(new SourceTestRequest.TestData())

        await tester.testSource(request, async response => {
          this.log()
          this.log(`${chalk.red.bold('#')} ${chalk.bold(response.getTestcase())}: ${chalk.green(response.getCompletetime().toFixed(0) + 'ms')}`)

          response.getFailuresList().forEach(failure => {
            this.log(`${chalk.bold.white.bgRed('[FAILURE]')} ${failure}`)
          })
        })
      }
    }
  }
}
