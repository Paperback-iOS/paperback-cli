import { flags } from '@oclif/command'
import { CLICommand } from '../command'

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
    
  }
}
