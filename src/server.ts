import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import Utils from './utils'
import chalk from 'chalk'

export default class Server {
  server?: http.Server

  port: number

  constructor(port: number) {
    this.port = port
  }

  start() {
    if (this.server) {
      Utils.error('Server already running')
      return
    }

    this.server = http.createServer(function (request, response) {
      Utils.log(`Request ${request.url}`)

      let filePath = './bundles' + request.url
      if (filePath === './') {
        filePath = './index.html'
      }

      const extname = String(path.extname(filePath)).toLowerCase()
      const mimeTypes: any = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm',
      }

      const contentType = mimeTypes[extname] || 'application/octet-stream'

      fs.readFile(filePath, function (error, content) {
        if (error) {
          if (error.code === 'ENOENT') {
            response.writeHead(404)
            response.end('Page not found: ' + error.code + ' ..\n')
          } else {
            response.writeHead(500)
            response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n')
          }
        } else {
          response.writeHead(200, {'Content-Type': contentType})
          response.end(content, 'utf-8')
        }
      })
    }).listen(this.port)
    Utils.log(`Server running at ${chalk.green(`http://127.0.0.1:${this.port}/versioning.json`)}`)
  }

  stop() {
    if (this.server === undefined) {
      Utils.error('Server not running')
      return
    }

    this.server?.close()
    this.server = undefined
  }
}
