'use strict'

var colors = require('colors/safe')
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
