'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.put('/add/:user/:bookid', auth.isAuthenticated(), controller.addBook);
router.put('/request/:requester/:owner/:bookid',auth.isAuthenticated(),controller.addRequestToUser); // requester stores request
router.put('/ask/:owner/:requester/:bookid',auth.isAuthenticated(), controller.madeRequest); // requester asks owner for book

router.put('/remove/ask/:owner/:requester/:bookid',auth.isAuthenticated(), controller.removeAsk); // requester asks owner for book
router.put('/remove/request/:owner/:requester/:bookid',auth.isAuthenticated(), controller.removeRequest); // requester asks owner for booka


router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/address', auth.isAuthenticated(), controller.updateAddress);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);



//router.put('/add/:user/:bookid',auth.isAuthenticated(), controller.addBook); // requester asks owner for bookid
module.exports = router;
