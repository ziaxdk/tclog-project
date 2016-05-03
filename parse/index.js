const fs = require('fs');
const path = require('path');
const inspect = require('util').inspect;
const async = require('async');
const eventstream = require('event-stream');
const log = require('bunyan').createLogger({ name: "docker-tc-log" });
const logger = require('fluent-logger');
// The 2nd argument can be omitted. Here is a defualt value for options.


var buffer = [];
var counter = 0;
var messageCounter = 1;

var importPath = process.env.FD_FILES_PATH || '/usr/src/logs';
log.info('Using log path to read from: %s', importPath);


configureOutput();
async.series([ processFiles ], function() {
  log.info('Done. Inserted %s entries', counter);
  logger.end();
});



function processFiles(cb) {
  var files = fs.readdirSync(importPath);
  log.info('Getting files from \'%s\' - found %s file(s)', importPath, files.length);
  async.eachSeries(files, processFile, cb);
}

function processFile(file, cb) {
  log.info('Processing \'%s\'', file);
  messageCounter = 1;

  fs.createReadStream(path.join(importPath, file))
    .pipe(eventstream.split())
    .pipe(eventstream.map(map))
    .on('end', () => {
      cb();
    })
    .pipe(eventstream.map(fluentLogger))
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

// function post(data, _cb) {
//   request.post({ url:'http://192.168.99.100:8888/docker.log', form: { json: JSON.stringify(data) } }, (err, httpResponse, body) => {
//     log.info('Uploaded object %s', messageCounter++);
//     if (err) throw err;
//     _cb(null, data);
//   });

// }
// function postRaw(data, _cb) {
//   console.log(msgpack.encode(data).toString('hex'));
//   _cb(null, data);
//   // request.post({ url:'http://fd:24224/docker.log', form: {json: JSON.stringify(data)} }, (err, httpResponse, body) => {
//   //   if (err) throw err;
//   //   _cb(null, data);
//   // });
// }

function configureOutput() {
  var uri = process.env.FD_PATH || 'fd';
  logger.configure('docker', {
     host: uri,
     port: 24224,
     timeout: 3.0,
     reconnectInterval: 600000 // 10 minutes
  });
  log.info('Using output uri to fluentd: %s', uri);
}

function fluentLogger(data, _cb) {
  logger.emit('log', data);
  if (messageCounter++ % 100 === 0) {
    log.info('Emitting data: %s', messageCounter);
  }
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

