#!/usr/bin/env node

const { resolve, relative, basename, extname } = require('path')
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

let filename = args._[0]
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

let currentFile = resolve(filename)
let existsCurrentFile = existsSync(currentFile)
const files = []
const port = 4649
const encoding = 'utf-8'
const apiUrl = args['--github-api-url'] ? args['--github-api-url'] : 'https://api.github.com'
const axios = require('axios')
const app = require('express')()
const { watch } = require('chokidar')
let watcher

app.get('/gfm/favicon.ico', async (_, res) => {
  res.header('Content-Type', 'image/x-icon')
  res.send(readFileSync(resolve(__dirname, 'favicon.ico')))
})

app.get('/gfm/favicon.png', async (_, res) => {
  res.header('Content-Type', 'image/png')
  res.send(readFileSync(resolve(__dirname, 'favicon.png')))
})

app.get('/gfm/app.css', async (_, res) => {
  res.header('Content-Type', 'text/css; charset=' + encoding)
  res.send(readFileSync(resolve(__dirname, 'app.css'), encoding))
})

app.get('/gfm/hl.css', async (_, res) => {
  res.header('Content-Type', 'text/css; charset=' + encoding)
  res.send(readFileSync(resolve(__dirname, 'hl.css'), encoding))
})

app.get('/gfm/hl.js', async (_, res) => {
  res.header('Content-Type', 'text/javascript; charset=' + encoding)
  res.send(readFileSync(resolve(__dirname, 'hl.js'), encoding))
})

app.get('/gfm/socket.io.js', async (_, res) => {
  res.header('Content-Type', 'text/javascript; charset=' + encoding)
  res.send(readFileSync(resolve(__dirname, 'node_modules/socket.io-client/dist/socket.io.js'), encoding))
})

app.get('/gfm/socket.io.js.map', async (_, res) => {
  res.header('Content-Type', 'text/plain; charset=' + encoding)
  res.send(readFileSync(resolve(__dirname, 'node_modules/socket.io-client/dist/socket.io.js.map'), encoding))
})

app.get('*', async (req, res) => {
  if (req.params[0] === '/') {
    res.send('Please select a file to preview')
    return
  }

  const file = resolve(req.params[0].slice(1))
  currentFile = file
  existsCurrentFile = existsSync(file)
  if (existsCurrentFile) {
    if (!files.includes(currentFile)) {
      files.push(currentFile)
      if (watcher) {
        watcher.close()
      }
      watcher = watch(files)
    }
    res.header('Content-Type', 'text/html; charset=' + encoding)
    res.send(readFileSync(resolve(__dirname, 'index.html'), encoding).replace(/<!--TITLE-->/, basename(currentFile)))
  } else {
    res.header('Content-Type', 'text/html; charset=' + encoding)
    res.send(readFileSync(resolve(__dirname, 'index.html'), encoding).replace(/<!--TITLE-->/, `Not found: ${basename(currentFile)}`))
  }
})

const server = require('http').createServer(app)
const io = require('socket.io')(server)

io.on('connection', (socket) => {
  const responseContent = async () => {
    let content
    const text = existsCurrentFile ? readFileSync(currentFile, encoding) : `Not found: ${currentFile}`
    const markdownExtension = /\.m(arkdown|kdn?|d(o?wn)?)(\?.*)?(#.*)?$/i
    if (markdownExtension.test(extname(currentFile))) {
      const response = await axios.post(apiUrl + '/markdown', { text, mode: 'gfm' })
      content = response.data
    } else {
      content = `<pre><code>${text}</code></pre>`
    }
    socket.emit('response content', content)
  }

  watcher.on('change', () => {
    console.log(chalk`> {cyan gfm-preview}: Detect changes and reloaded content (${basename(currentFile)})`)
    responseContent()
  })

  socket.on('request content', () => {
    responseContent()
  })

  socket.on('clicking', () => {
    clicking = true
    socket.emit('clickable')
  })

  socket.on('clicked', () => {
    clicking = false
  })

  socket.on('disconnect', () => {
    if (!clicking && io.sockets.server.engine.clientsCount === 0) {
      console.log(chalk`> {cyan gfm-preview}: Have a nice code!`)
      process.exit(0)
    }
  })
})

const url = `http://localhost:${port}`
const start = async () => {
  try {
    if (args['--browser']) {
      require('opn')(url + '/' + basename(currentFile), { app: args['--browser'] })
    } else {
      require('opn')(url + '/' + basename(currentFile))
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
