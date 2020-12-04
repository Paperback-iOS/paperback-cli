import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

export default class Utils {
  static fixedWidth(number: number, width: number) {
    return (new Array(width).join('0') + number).substr(-width)
  }

  static prefixTime(message = '') {
    const date = new Date()

    const time = `${this.fixedWidth(date.getHours(), 2)}:${Utils.fixedWidth(date.getMinutes(), 2)}:${Utils.fixedWidth(date.getSeconds(), 2)}:${Utils.fixedWidth(date.getMilliseconds(), 4)}`
    return chalk`[{gray ${time}}] ${message}`
  }

  static log(message = '') {
    const cursorTo = (process.stdout as any).cursorTo
    if (cursorTo) {
      cursorTo(0)
    }
    process.stdout.write(this.prefixTime(message) + '\n')
  }

  static error(message = '') {
    this.log(chalk`{red ${message}}`)
  }

  static time(label: string) {
    const startTime = process.hrtime.bigint()

    return {
      end: () => {
        const hrend = process.hrtime.bigint() - startTime
        // eslint-disable-next-line new-cap
        this.log(`${label}: ${chalk.green((hrend / BigInt(1000000)) + 'ms')}`)
      },
    }
  }

  static deleteFolderRecursive(folderPath: string) {
    folderPath = folderPath.trim()
    if (folderPath.length === 0 || folderPath === '/') return

    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach(file => {
        const curPath = path.join(folderPath, file)
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          this.deleteFolderRecursive(curPath)
        } else { // delete file
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(folderPath)
    }
  }

  static copyFolderRecursive(source: string, target: string) {
    source = source.trim()
    if (source.length === 0 || source === '/') return

    target = target.trim()
    if (target.length === 0 || target === '/') return

    if (!fs.existsSync(source)) return

    let files = []
    // check if folder needs to be created or integrated
    const targetFolder = path.join(target, path.basename(source))
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder)
    }

    // copy
    if (fs.lstatSync(source).isDirectory()) {
      files = fs.readdirSync(source)
      files.forEach(file => {
        const curSource = path.join(source, file)
        if (fs.lstatSync(curSource).isDirectory()) {
          this.copyFolderRecursive(curSource, targetFolder)
        } else {
          fs.copyFileSync(curSource, path.join(targetFolder, file))
        }
      })
    }
  }
}
