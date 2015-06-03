'use strict'

// Constants
var FILE = 'file',
  INITIAL_CREATION_TIMESTAMP = 'initial-creation-timestamp',
  FINAL_CREATION_TIMESTAMP = 'final-creation-timestamp',
  BOUNDING_BOX = 'bounding-box'

// Arguments
var options = {},
  usage = 'npm start ' +
    '--' + FILE + ' <planet-notes-latest.osn> ' +
    '[--' + INITIAL_CREATION_TIMESTAMP + ' <YYYY-MM-DD>] ' +
    '[--' + FINAL_CREATION_TIMESTAMP + ' <YYYY-MM-DD>]' +
    '[--' + BOUNDING_BOX + ' <lon_min,lat_min,lon_max,lat_max>]'

options[FILE] = {
  describe: 'Open an OpenStreetMap Notes file',
  require: true
}

options[INITIAL_CREATION_TIMESTAMP] = {
  describe: 'Filter notes by initial creation date'
}

options[FINAL_CREATION_TIMESTAMP] = {
  describe: 'Filter notes by final creation date'
}

options[BOUNDING_BOX] = {
  describe: 'Filter notes by bounding box'
}

var argv = require('yargs')
  .usage(usage)
  .option(options)
  .version(function () {
    return require('../package.json').version
  })
  .help('help')
  .argv

// Imports

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
    var result = filterNotes(notes)
    console.log(result)
  })
})

/**
 * Read OpenStreetMap Notes file
 * @param  {string}   file
 * @param  {Function} callback
 * @return {void}
 */
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

/**
 * Parse OpenStreetMap XML to JSON
 * @param  {object}   osn
 * @param  {Function} callback
 * @return {void}
 */
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

/**
 * Filter Notes
 * @param  {object} notes
 * @return {void}
 */
function filterNotes (notes) {
  var notes = notes['osm-notes']['note'] || []

  if (!notes.length) {
    console.log(colors.yellow('✗ Empty notes collection'))
    process.exit(0)
  }

  notes = filterByInitialCreationTimestamp(notes)
  notes = filterByFinalCreationTimestamp(notes)
  notes = filterByBoundingBox(notes)

  return notes
}

/**
 * Filter Notes by argument INITIAL_CREATION_TIMESTAMP
 * @param  {object} notes
 * @return {void}
 */
function filterByInitialCreationTimestamp (notes) {
  if (!argv[INITIAL_CREATION_TIMESTAMP]) {
    return notes
  }

  var date = new Date(argv[INITIAL_CREATION_TIMESTAMP])

  if (isNaN(date.getTime())) {
    console.error(colors.red('✗ ' + colors.bold('Initial Creation Timestamp') + ' invalid'))
    process.exit(1)
  }

  function filter (note) {
    var createdAt = new Date(note.$.created_at)
    return createdAt.getTime() >= date.getTime()
  }

  return _.filter(notes, filter)
}

/**
 * Filter Notes by argument FINAL_CREATION_TIMESTAMP
 * @param  {object} notes
 * @return {void}
 */
function filterByFinalCreationTimestamp (notes) {
  if (!argv[FINAL_CREATION_TIMESTAMP]) {
    return notes
  }

  var date = new Date(argv[FINAL_CREATION_TIMESTAMP])

  if (isNaN(date.getTime())) {
    console.error(colors.red('✗ ' + colors.bold('Final Creation Timestamp') + ' invalid'))
    process.exit(1)
  }

  function filter (note) {
    var createdAt = new Date(note.$.created_at)
    return createdAt.getTime() < date.getTime()
  }

  return _.filter(notes, filter)
}

/**
 * Filter Notes by argument BOUNDING_BOX
 * @param  {object} notes
 * @return {void}
 */
function filterByBoundingBox (notes) {
  if (!argv[BOUNDING_BOX]) {
    return notes
  }

  var bbox = argv[BOUNDING_BOX].split(',')

  if (bbox.length !== 4) {
    console.error(colors.red('✗ ' + colors.bold('Bounding Box') + ' invalid'))
    process.exit(1)
  }

  function filter (note) {
    var lonMin = parseFloat(bbox[0]),
      latMin = parseFloat(bbox[1]),
      lonMax = parseFloat(bbox[2]),
      latMax = parseFloat(bbox[3]),
      lat = parseFloat(note.$.lat),
      lon = parseFloat(note.$.lon)

    console.log([lonMin, latMin, lonMax, lonMin, lat, lon])

    var innerLatitude = lat >= latMin && lat <= latMax,
      innerLongitude = lon >= lonMin && lon <= lonMax

    return innerLatitude && innerLongitude
  }

  return _.filter(notes, filter)
}
