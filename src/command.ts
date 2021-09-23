/* eslint-disable no-console */
import Command from '@oclif/command'
import Utils from './utils'

export abstract class CLICommand extends Command {
  override log(message = '') {
    Utils.log(message)
  }

  time(label: string, format: string | undefined = undefined) {
    return Utils.time(label, format)
  }

  async measure(label: string, format: string | undefined = undefined, closure: () => Promise<void>) {
    const time = Utils.time(label, format)
    await closure()
    time.end()
  }
}
