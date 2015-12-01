'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

router.put('/add/:user/:bookid', auth.isAuthenticated(), controller.addBook);
//router.put('/request/:user/:bookid',auth.isAuthenticated(),controller.addRequestToUser); // request made to the user
//router.put('/ask/:user/:bookid',auth.isAuthenticated(), contoller.madeRequest); // user made ask for this book
//router.put('/add/:user/:bookid',auth.isAuthenticated(), controller.addBook); // add  a book to their library
module.exports = router;
