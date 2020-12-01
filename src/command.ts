/* eslint-disable no-console */
import Command from '@oclif/command'
import chalk from 'chalk'

export default abstract class extends Command {
  log(message = '') {
    const date = new Date()

    const fixedWidth = (number: number, width: number) => {
      return (new Array(width).join('0') + number).substr(-width)
    }

    const time = `${fixedWidth(date.getHours(), 2)}:${fixedWidth(date.getMinutes(), 2)}:${fixedWidth(date.getSeconds(), 2)}:${fixedWidth(date.getMilliseconds(), 4)}`
    super.log(chalk`[{gray ${time}}] ${message}`)
  }

  time(label: string) {
    const startTime = process.hrtime.bigint()

    return {
      end: () => {
        const hrend = process.hrtime.bigint() - startTime
        // eslint-disable-next-line new-cap
        this.log(`${label}: ${chalk.green((hrend / BigInt(1000000)) + 'ms')}`)
      },
    }
  }
}
