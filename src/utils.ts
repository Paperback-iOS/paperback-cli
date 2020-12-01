import * as fs from 'fs'
import * as path from 'path'

export default class Utils {
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
