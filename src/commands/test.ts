/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import { flags } from '@oclif/command'
import { CLICommand } from '../command'
import Bundle from './bundle'
import * as path from 'path'
import * as fs from 'fs'
import chalk from 'chalk'
import { SourceTester } from '../source-tester'
import { SourceInstallRequest, SourceTestRequest, SourceTestResponse } from '../devtools/generated/typescript/PDTSourceTester_pb'
import shelljs from 'shelljs'
import Utils from '../utils'
import Server from '../server'
import { PaperbackSourceTesterClient } from '../devtools/generated/typescript/PDTSourceTester_grpc_pb'
import { credentials } from '@grpc/grpc-js'
import ip from 'ip'

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

    if (flags.ip) {
      const bundleDir = path.join(cwd, 'bundles')

      await Bundle.run([])

      const server = new Server(8000)
      server.start()

      const client = new PaperbackSourceTesterClient(`${flags.ip}:${flags.port}`, credentials.createInsecure())
      const sourcesToTest = this.getSourceIdsToTest(sourceId, bundleDir)

      // Install the sources that we need to test on the App
      for (const source of sourcesToTest) {
        this.log()
        this.log(chalk.bold.underline.bgBlue.white(`Installing ${source}`))
        const request = new SourceInstallRequest()
        request.setSourceid(source)
        request.setRepobaseurl(`http://${ip.address()}:${server.port}`)

        // Make sure the source is installed on the app
        await new Promise((resolve, reject) =>
          client.installSource(
            request,
            (error, response) =>
              (error) ? reject(error) : resolve(response)
          )
        )
      }

      server.stop()

      for (const source of sourcesToTest) {
        this.log()
        this.log(chalk.bold.underline.bgBlue.white(`Testing ${source}`))
        const request = new SourceTestRequest()
        request.setSourceid(source)
        request.setData(new SourceTestRequest.TestData())

        await new Promise((resolve, reject) =>
          client.testSource(request)
          .on('end', resolve)
          .on('error', reject)
          .on('data', this.logSourceTestReponse.bind(this))
        )
      }
    } else {
      const buildDir = path.join(cwd, 'tmp')
      this.log()
      this.log(chalk.bold.underline.bgBlue.white('Transpiling Sources'))
      await this.measure('Time', Utils.headingFormat, async () => {
        Utils.deleteFolderRecursive(buildDir)
        shelljs.exec('npx tsc --outDir tmp')
      })

      const tester = new SourceTester(buildDir)
      for (const source of this.getSourceIdsToTest(sourceId, buildDir)) {
        this.log()
        this.log(chalk.bold.underline.bgBlue.white(`Testing ${source}`))
        const request = new SourceTestRequest()
        request.setSourceid(source)
        request.setData(new SourceTestRequest.TestData())

        await tester.testSource(request, this.logSourceTestReponse.bind(this))
      }
      this.log()
    }
  }

  private async logSourceTestReponse(response: SourceTestResponse) {
    this.log(`${chalk.red.bold('#')} ${chalk.bold(response.getTestcase())}: ${chalk.green(response.getCompletetime().toFixed(0) + 'ms')}`)

    const failures = response.getFailuresList()
    failures.forEach(failure => {
      this.log(`- ${chalk.white.bgRed('[FAILURE]')} ${failure}`)
    })

    if (failures.length > 0) this.log()
  }

  private getSourceIdsToTest(sourceId: string, bundleDir: string) {
    let sourcesToTest = []
    if (sourceId) {
      sourcesToTest = fs.readdirSync(bundleDir).filter(file => {
        return file.toLowerCase() === sourceId.toLowerCase() && fs.statSync(path.join(bundleDir, file)).isDirectory()
      })
    } else {
      sourcesToTest = fs.readdirSync(bundleDir).filter(file => fs.statSync(path.join(bundleDir, file)).isDirectory())
    }
    return sourcesToTest
  }
}
