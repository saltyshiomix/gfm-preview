#!/usr/bin/env node

const { resolve } = require('path')
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
const fastify = require('fastify')()
const start = async () => {
  try {
    await fastify.listen(port)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

fastify.get('/', async (request, reply) => {
  const response = await axios.post(apiUrl + '/markdown', { text: readFileSync(file, encoding), mode: 'gfm' })
  const content = response.data
  reply.header('Content-Type', 'text/html; charset=' + encoding)
  reply.send(readFileSync(resolve(__dirname, 'index.html'), encoding).replace(/<!--TITLE-->/, process.argv[2]).replace(/<!--CONTENT-->/, content))
})

fastify.get('/hljs', async (request, reply) => {
  reply.send(readFileSync(resolve(__dirname, 'hl.js'), encoding))
})

require('opn')(`http://localhost:${port}`)

start()
