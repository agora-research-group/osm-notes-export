'use strict'

var argv = require('yargs')
  // .example('node $0 --file planet-notes-latest.osn')
  .option({
    'file': {
      alias: 'f',
      describe: 'Open an OpenStreetMap Notes file',
      type: 'string',
      require: true
    }
  })
  .version(function () {
    return require('../package.json').version
  })
  .help('help')
  .argv

var path = require('path')
var fs = require('fs')
var xml2js = require('xml2js')
var colors = require('colors/safe')

if (path.extname(argv.file) !== '.osn') {
  console.error(colors.red('✗ ' + argv.file + ' must be an OpenStreetMap Notes file with ' + colors.bold('.osn') + ' extension'))
  process.exit(1)
}

function openOSN (file, callback) {
  fs.readFile(file, function (err, content) {
    if (err) {
      console.error(colors.red('✗ Problems to open: ' + file))
      process.exit(1)
    }

    if (callback && typeof callback === 'function') {
      callback(content)
    }
  })
}

function parseOSN2JSON (osn, callback) {
  var parser = new xml2js.Parser()

  parser.parseString(osn, function (err, result) {
    if (err) {
      console.error(colors.red('✗ Problems to parse : ' + argv.file))
      process.exit(1)
    }

    console.log(colors.green('✓ File ' + colors.bold(argv.file) + ' loaded'))

    if (callback && typeof callback === 'function') {
      callback(result)
    }
  })
}

openOSN(argv.file, function (content) {
  parseOSN2JSON(content, function (data) {
    console.log(data)
  })
})
