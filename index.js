#!/usr/bin/env node

const { resolve, relative } = require('path')
const { existsSync, readFileSync } = require('fs')
const chalk = require('chalk')
const arg = require('arg')

const args = arg({
  '--help': Boolean,
  '--version': Boolean,
  '--github-api-url': String,
  '--browser': String,
  '-h': '--help',
  '-v': '--version',
  '-b': '--browser'
})

if (args['--version']) {
  const pkg = require(resolve(__dirname, './package.json'))
  console.log(`gfm-preview v${pkg.version}`)
  process.exit(0)
}

const filename = args._[0]
if (args['--help'] || (!filename)) {
  console.log(chalk`
    {bold.cyan gfm-preview} - Preview your markdown with GitHub API in real time

    {bold USAGE}

      {bold $} {cyan preview} --help
      {bold $} {cyan preview} --version
      {bold $} {cyan preview} {underline file.md}
      {bold $} {cyan preview} {underline file.md} [--brower {underline brower_name_or_executable}]
      {bold $} {cyan preview} {underline file.md} [--github-api-url {underline github_api_url}]

    {bold OPTIONS}

      --help, -h                               shows this help message
      --version, -v                            displays the current version of gfm-preview
      --browser, -b {underline brower_name_or_executable}  sets the browser to open a preview
      --github-api-url {underline github_api_url}          sets the GitHub API URL (default: {underline https://api.github.com})
  `)
  process.exit(0)
}

const file = resolve(filename)
if (!existsSync(file)) {
  console.error(chalk.red(`Not found: ${file}`))
  process.exit(1)
}

const port = 4649
const encoding = 'utf-8'
const apiUrl = args['--github-api-url'] ? args['--github-api-url'] : 'https://api.github.com'
const axios = require('axios')
const app = require('express')()

app.get('/', async (request, reply) => {
  reply.header('Content-Type', 'text/html; charset=' + encoding)
  reply.send(readFileSync(resolve(__dirname, 'index.html'), encoding).replace(/<!--TITLE-->/, filename))
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
    console.log(chalk`> {cyan gfm-preview}: Detect changes and reloaded content`)
    responseContent()
  })

  socket.on('request content', () => {
    responseContent()
  })

  socket.on('disconnect', () => {
    if (io.sockets.server.engine.clientsCount === 0) {
      console.log(chalk`> {cyan gfm-preview}: Have a nice code!`)
      process.exit(0)
    }
  })
})

const url = `http://localhost:${port}`
const start = async () => {
  try {
    if (args['--browser']) {
      require('opn')(url, { app: args['--browser'] })
    } else {
      require('opn')(url)
    }
    await server.listen(port, () => {
      console.log(chalk`> {cyan gfm-preview}: Ready on ${url}`)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
