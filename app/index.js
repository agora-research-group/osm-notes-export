'use strict'

var argv = require('yargs')
  .usage('npm start --file <planet-notes-latest.osn> [--initial-creation-timestamp <2015-04-10>] [--final-timestamp <2015-05-25>]')
  .option({
    'file': {
      alias: 'f',
      describe: 'Open an OpenStreetMap Notes file',
      require: true
    },
    'initial-creation-timestamp': {
      describe: 'Filter notes by creation date (YYYY-MM-DD)'
    },
    'final-timestamp': {
      describe: 'Filter notes by creation, modification or closing date'
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
var _ = require('lodash')
var colors = require('colors/safe')

if (path.extname(argv.file) !== '.osn') {
  console.error(colors.red('✗ ' + argv.file + ' must be an OpenStreetMap Notes file with ' + colors.bold('.osn') + ' extension'))
  process.exit(1)
}

openOSN(argv.file, function (content) {
  parseOSN2JSON(content, function (notes) {
    filterNotes(notes)
  })
})

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

function filterNotes (notes) {
  var notes = notes['osm-notes']['note'] || []

  if (!notes.length) {
    console.log(colors.yellow('✗ Empty notes collection'))
    process.exit(0)
  }

  notes = filterByCreationDate(notes)

  console.log(notes)
}

function filterByCreationDate (notes) {
  if (!argv['initial-creation-timestamp']) {
    console.error(colors.red('✗ ' + colors.bold('Initial Creation Timestamp') + ' is not specified'))
    process.exit(1)
  }

  var initialCreationTimestamp = new Date(argv['initial-creation-timestamp']),
    result

  if (isNaN(initialCreationTimestamp.getTime())) {
    console.error(colors.red('✗ ' + colors.bold('Initial Creation Timestamp') + ' invalid'))
    process.exit(1)
  }

  result = _.filter(notes, function (note) {
    var createdAt = new Date(note.$.created_at)

    return createdAt.getTime() >= initialCreationTimestamp
  })

  return result
}
