/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Mybooks = require('./mybooks.model');

exports.register = function(socket) {
  Mybooks.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Mybooks.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('mybooks:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('mybooks:remove', doc);
}