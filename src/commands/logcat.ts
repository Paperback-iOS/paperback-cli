import {credentials} from '@grpc/grpc-js'
import {Command, flags} from '@oclif/command'
import {PaperbackLoggerClient} from '../devtools/generated/typescript/pdt_grpc_pb'
import {LogFilter, LogLine} from '../devtools/generated/typescript/pdt_pb'
import chalk from 'chalk'

export default class Logcat extends Command {
  static description = 'describe the command here'

  static flags = {
    ip: flags.string({name: 'ip', default: 'localhost'}),
    port: flags.integer({name: 'port', default: 27015}),
  }

  async run() {
    const {flags} = this.parse(Logcat)

    await new Promise((resolve, reject) => {
      const test = new PaperbackLoggerClient(`${flags.ip}:${flags.port}`, credentials.createInsecure())
      test.streamLogs(new LogFilter()).on('data', (response: unknown) => {
        const logLine = response as LogLine

        let level

        switch (logLine.getLevel()) {
        case LogLine.LogLevel.INFO:
          level = chalk.bold.bgGreenBright.hsv(0, 0, 0)`[DEBUG]`
          break
        case LogLine.LogLevel.ERROR:
          level = chalk.bold.hsv(0, 0, 0).bgRed`[ERROR]`
          break
        case LogLine.LogLevel.WARN:
          level = chalk.bold.hsv(0, 0, 0).bgYellow`[WARN]`
          break
        default:
          level = chalk.bold.whiteBright.hsv(0, 0, 0)`[UNKWN]`
          break
        }

        // eslint-disable-next-line no-console
        console.log(`${level} [${logLine.getDate()?.toDate().getTime()}] [${logLine.getTag()}] ${logLine.getMessage()}`)
      })
      .on('error', reject)
      .on('close', resolve)
    })
  }
}
