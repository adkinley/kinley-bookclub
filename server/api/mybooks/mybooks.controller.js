'use strict';

var _ = require('lodash');
var Mybooks = require('./mybooks.model');

// Get list of mybookss
exports.index = function(req, res) {
  Mybooks.find(function (err, mybookss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(mybookss);
  });
};

// Get a single mybooks
exports.show = function(req, res) {
  Mybooks.findById(req.params.id, function (err, mybooks) {
    if(err) { return handleError(res, err); }
    if(!mybooks) { return res.status(404).send('Not Found'); }
    return res.json(mybooks);
  });
};

// Creates a new mybooks in the DB.
exports.create = function(req, res) {
  Mybooks.create(req.body, function(err, mybooks) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(mybooks);
  });
};

// Updates an existing mybooks in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Mybooks.findById(req.params.id, function (err, mybooks) {
    if (err) { return handleError(res, err); }
    if(!mybooks) { return res.status(404).send('Not Found'); }
    var updated = _.merge(mybooks, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(mybooks);
    });
  });
};



// Deletes a mybooks from the DB.
exports.destroy = function(req, res) {
  Mybooks.findById(req.params.id, function (err, mybooks) {
    if(err) { return handleError(res, err); }
    if(!mybooks) { return res.status(404).send('Not Found'); }
    mybooks.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}