// const path = './files';
const fs = require('fs');
const path = require('path');
const inspect = require('util').inspect;
const async = require('async');
const eventstream = require('event-stream');
const log = require('bunyan').createLogger({ name: "docker-tc-log" });
const request = require('request');


// var importPath = process.env.DOCKLOG_PATH || './files';
var importPath = '/usr/src/logs';

async.series([ processFiles ], function() {
  log.info('Done. Inserted %s entries', counter);
});



function processFiles(cb) {
  var files = fs.readdirSync(importPath);
  log.info('Getting files from \'%s\' - found %s file(s)', importPath, files.length);
  async.eachSeries(files, processFile, cb);
}

function processFile(file, cb) {
  log.info('Processing \'%s\'', path.join(importPath, file));

  fs.createReadStream(path.join(importPath, file))
    .pipe(eventstream.split())
    .pipe(eventstream.map(map))
    .pipe(eventstream.map(post))

   // .pipe(eventstream.map(function(data, _cb) { console.log(data);  _cb(null, inspect(JSON.parse(data))); }))
   .pipe(eventstream.map((data, _cb) => { _cb(null, inspect(JSON.stringify(data))) }))
   // .pipe(process.stdout);
}

var labels = [ { 'Timestamp': lineParseFn },
               { 'Message': lineParseFn },
               { 'Category': lineParseFn },
               { 'Machine': lineParseFn },
               { 'App Domain': lineParseFn },
               { 'ProcessId': lineParseFn },
               { 'Process Name': lineParseFn },
               { 'Thread Name': lineParseFn },
               { 'Win32 ThreadId': lineParseFn },
               { 'Extended Properties': lineParseFn },
               { 'typeName': lineParseFn },
               { 'typeMemberName': lineParseFn },
               { 'threadPrincipal': lineParseFn },
               { 'processUser': lineParseFn }
              ];

var buffer = [];
var counter = 0;

function post(data, _cb) {
  request.post({ url:'http://fd:8888/docker.log', form: {json: JSON.stringify(data)} }, (err, httpResponse, body) => {
    if (err) throw err;
    _cb(null, data);
  })
}

function map(data, cb) {
  if (!data) {
    var logItem = {};
    
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var name = Object.keys(label)[0];
      var fn = label[name];
      logItem[name.toLowerCase()] = fn(name, buffer[i]);
    }
    buffer = [];
    ++counter;
    log.debug('logItem: %s', logItem);
    return cb(null, logItem);
  }
  buffer.push(data);
  cb();
}

function lineParseFn(k, v) {
  var expr = '(' + k + ': )|(' + k + ' - )';
  return v && v.replace(new RegExp(expr, 'i'), '');
}

