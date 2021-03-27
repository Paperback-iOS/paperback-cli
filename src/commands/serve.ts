import {flags} from '@oclif/command'
import Command from '../command'
import Bundle from './bundle'
import Server from '../server'
import cli from 'cli-ux'
import Utils from '../utils'
import chalk from 'chalk'

export default class Serve extends Command {
  static description = 'Build the sources and start a local server'

  static flags = {
    help: flags.help({char: 'h'}),
    port: flags.integer({char: 'p', default: 8080}),
    nobundle: flags.boolean({description: 'Prevent bundling when launching serve. Will use existing bundle. Make sure that it\'s present.', default: false}),
  }

  async run() {
    const {flags} = this.parse(Serve)

    // eslint-disable-next-line no-console
    console.clear()

    if (flags.nobundle) {
      this.log(chalk.underline.blue('nobundle argument detected => NOT building sources, make sure that a bundle is present.'))
    } else {
      this.log(chalk.underline.blue('Building Sources'))
      await Bundle.run([])
    }

    this.log()
    this.log(chalk.underline.blue('Starting Server on port ' + flags.port))

    const server = new Server(flags.port)

    server.start()
    this.log()
    this.log(chalk`For a list of commands do {green h} or {green help}`)

    let stopServer = false
    while (!stopServer) {
      // eslint-disable-next-line no-await-in-loop
      const input = (await cli.prompt(Utils.prefixTime(''), {required: false}) as string)?.trim() ?? ''

      if (input === 'h' || input === 'help') {
        this.log(chalk.underline.bold('Help'))
        this.log('  h, help - Display this message')
        this.log('  s, stop - Stop the server')
        this.log('  r, restart - Restart the server, also rebuilds the sources')
      }

      if (input === 's' || input === 'stop') {
        stopServer = true
      }

      if (input === 'r' || input === 'restart') {
        server.stop()

        // eslint-disable-next-line no-console
        console.clear()

        this.log(chalk.underline.blue('Building Sources'))

        if (!flags.nobundle) {
          // eslint-disable-next-line no-await-in-loop
          await Bundle.run([])
        }
        this.log()
        this.log(chalk.underline.blue('Starting Server on port ' + flags.port))

        server.start()
        this.log()
        this.log(chalk`For a list of commands do {green h} or {green help}`)
      }
    }

    // eslint-disable-next-line no-process-exit, unicorn/no-process-exit
    process.exit(0)
  }
}
'\b\u00127'
