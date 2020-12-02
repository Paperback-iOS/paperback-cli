/* eslint-disable no-console */
import Command from '@oclif/command'
import Utils from './utils'

export default abstract class extends Command {
  log(message = '') {
    Utils.log(message)
  }

  time(label: string) {
    return Utils.time(label)
  }
}
