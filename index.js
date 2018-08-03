#!/usr/bin/env node

const { resolve, relative } = require('path')
const { existsSync, readFileSync } = require('fs')
const parseArgs = require('minimist')

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    v: 'version',
    h: 'help'
  },
  boolean: [
    'v',
    'h'
  ]
})

if (argv.version) {
  const pkg = require(resolve(__dirname, './package.json'))
  console.log(`gfm-preview v${pkg.version}`)
  process.exit(0)
}

if (argv.help || (!process.argv[2])) {
  console.log(`
    Description
      Preview GitHub flavored markdown

    Usage
      $ gfm-preview <markdown file> [--github-api-url <github api url>]

    Args
      <markdown file>  A markdown file which you want to preview

    Options
      --github-api-url <github api url>  GitHub API URL (default: 'https://api.github.com')
      --help, -h                         Displays this message
  `)
  process.exit(0)
}

const file = resolve(process.argv[2])
if (!existsSync(file)) {
  console.error(`Not found: ${file}`)
  process.exit(1)
}

const port = 4649
const encoding = 'utf-8'
const apiUrl = argv['github-api-url'] ? argv['github-api-url'] : 'https://api.github.com'
const axios = require('axios')
const app = require('express')()

app.get('/', async (request, reply) => {
  reply.header('Content-Type', 'text/html; charset=' + encoding)
  reply.send(readFileSync(resolve(__dirname, 'index.html'), encoding).replace(/<!--TITLE-->/, process.argv[2]))
})

app.get('/app.css', async (request, reply) => {
  reply.header('Content-Type', 'text/css; charset=' + encoding)
  reply.send(readFileSync(resolve(__dirname, 'app.css'), encoding))
})

app.get('/hl.css', async (request, reply) => {
  reply.header('Content-Type', 'text/css; charset=' + encoding)
  reply.send(readFileSync(resolve(__dirname, 'hl.css'), encoding))
})

app.get('/hl.js', async (request, reply) => {
  reply.header('Content-Type', 'text/javascript; charset=' + encoding)
  reply.send(readFileSync(resolve(__dirname, 'hl.js'), encoding))
})

app.get('/io.js', async (request, reply) => {
  reply.header('Content-Type', 'text/javascript; charset=' + encoding)
  reply.send(readFileSync(resolve(__dirname, 'node_modules/socket.io-client/dist/socket.io.js'), encoding))
})

const { watch } = require('chokidar')
const watcher = watch([file])
const server = require('http').createServer(app)
const io = require('socket.io')(server)

io.on('connection', (socket) => {
  const responseContent = async () => {
    const response = await axios.post(apiUrl + '/markdown', { text: readFileSync(file, encoding), mode: 'gfm' })
    let content = response.data
    socket.emit('response content', content)
  }

  watcher.on('change', () => {
    console.log(`> gfm-preview: Detect changes and reloaded content`)
    responseContent()
  })

  socket.on('request content', () => {
    responseContent()
  })

  socket.on('disconnect', () => {
    if (io.sockets.server.engine.clientsCount === 0) {
      console.log(`> gfm-preview: Have a nice code!`)
      process.exit(0)
    }
  })
})

const url = `http://localhost:${port}`
const start = async () => {
  try {
    require('opn')(url)
    await server.listen(port, () => {
      console.log(`> gfm-preview: Ready on ${url}`)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
