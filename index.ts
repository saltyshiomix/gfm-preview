#!/usr/bin/env node

import { resolve } from 'path'
import * as parseArgs from 'minimist'
import * as fastify from 'fastify'
import { default as axios } from 'axios'
import * as opn from 'opn'

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

if (argv.help) {
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

const port: number = 4649
const server = fastify()
const start = async () => {
  try {
    await server.listen(port)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

const apiUrl: string = argv['github-api-url'] ? argv['github-api-url'] : 'https://api.github.com'

server.get('/', async (/*request, reply*/) => {
  const response = await axios.post(apiUrl + '/markdown', {
    text: 'Hello world github/linguist#1 **cool**',
    mode: 'gfm'
  })
  return response.data
})

opn(`http://localhost:${port}`)

start()
