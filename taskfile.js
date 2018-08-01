module.exports = {
  *tsc(task) {
    yield task.source('*.ts').typescript().target('.', { mode: '0755' })
  },
  *toUnixFormat(task) {
    const isWindows = /^win/.test(process.platform)
    const isMac = process.platform === 'darwin'
    if (isWindows) {
      yield task.source('index.js').shell('.\\bin\\dos2unix.exe $file && echo [dos2unix] $file')
    }
    if (isMac) {
      yield task.source('index.js').shell('dos2unix -c Mac $file && echo [mac2unix] $file')
    }
  },
  *build(task) {
    yield task.serial(['tsc', 'toUnixFormat'])
  }
}
