'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.mybooks = [];
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user.profile);
  });
};


// Updates an existing book in the DB.
//router.put('/request/:requester/:owner/:bookid',auth.isAuthenticated(),controller.addRequestToUser); // requester stores request
exports.addRequestToUser = function(req, res) {
  var requester = req.params.requester;
  var bookid = req.params.bookid;
  var owner = req.params.owner;
  var request = {bookID:bookid, owner:owner};

  if(req.body._id) { delete req.body._id; }
  User.findOne({name:requester}, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.myrequests.push(request);
  user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};


//router.put('/ask/:owner/:requester/:bookid',auth.isAuthenticated(), contoller.madeRequest); 
// requester asks owner for book
// Should update the list of pending requests in owner
exports.madeRequest = function(req, res) {
  var requester = req.params.requester;
  var bookid = req.params.bookid;
  var owner = req.params.owner;
  var request = {bookID:bookid, owner:requester};

  if(req.body._id) { delete req.body._id; }
  User.findOne({name:owner}, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.requests.push(request);

    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};

exports.removeRequest = function(req, res) {
  var requester = req.params.requester;
  var bookid = req.params.bookid;
  var owner = req.params.owner;


  if(req.body._id) { delete req.body._id; }
  User.findOne({name:owner}, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    console.log(requester);
    console.log(bookid);
    console.log(user.myrequests);
     user.myrequests = _.remove(user.myrequests, function(elt) {
      return (elt.owner != requester || elt.bookID != bookid);
    });
     console.log(user.myrequests);

    if (user.myrequests==undefined) {
      console.log("Couldn't find request for " + requester + " " + bookid);
      return res.status(404).send('Not Found');
    }
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(user);
    });
  });
};


exports.removeAsk = function(req, res) {
  console.log("Do I get here");
  var requester = req.params.requester;
  var bookid = req.params.bookid;
  var owner = req.params.owner;

  console.log("Remove Ask " + requester + " " + owner);
  if(req.body._id) { delete req.body._id; }
  User.findOne({name:owner}, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.requests = _.remove(user.requests, function(elt) {
      return (elt.owner != requester || elt.bookID != bookid);
    });
    if (user.requests==undefined) {
      console.log("Couldn't find request for " + requester + " " + bookid);
      return res.status(404).send('Not Found');
    }

    user.save(function (err) {
      if (err) { 
        console.log("Err is " + err);
        return handleError(res, err); }
      return res.status(200).json(user);
    });
  });

};


/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Change a users password
 */
exports.updateAddress = function(req, res, next) {
  var userId = req.user._id;
  var city = String(req.body.city);
  var state = String(req.body.state);

  User.findById(userId, function (err, user) {
    user.city = city;
    user.state = state;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });

  });
};
 

exports.addBook = function(req, res, next) {
  var userId = req.params.user;
  var bookId = req.params.bookid;
  console.log("Book Id iS " +  req.params.bookid);
  console.log("Attempting to add book userId = " +userId);

  User.findOne({name: userId}, function (err, user) {
    if (err)
      res.status(401).send("User not found");
    console.log("User name is " + user.name);
    console.log("User books are " + user.mybooks);
    user.mybooks.push(bookId);
    console.log("book is "+bookId);
    console.log("Saved books are " + user.mybooks);
    user.save(function (err) {
      if (err) 
        res.status(405).send("Failed to add book");
      else
        res.status(200).send('OK');
      });
  });
}
/*
exports.removeRequest = function(req,res,next) {
  var userId = req.params.user;
  var bookId = req.params.bookid;
  console.log("Book Id iS " +  req.params.bookid);
  console.log("Attempting to remove book userId = " +userId);

  User.findOne({name: userId}, function (err, user) {
    if (err)
      res.status(401).send("User not found");
    console.log("User name is " + user.name);
    console.log("User books are " + user.mybooks);
    user.requests = _.remove(user.myrequests, function(elt) {elt.bookid == bookId;});
    console.log("book is "+bookId);
    console.log("Saved books are " + user.mybooks);
    user.save(function (err) {
      if (err) 
        res.status(405).send("Failed to remove book");
      else
        res.status(200).send('OK');
      });
  });
}

exports.removeAsk = function(req, res, next) {
  var userId = req.params.owner;
  var bookId = req.params.bookid;
  console.log("Book Id iS " +  req.params.bookid);
  console.log("Attempting to remove book userId = " +userId);

  User.findOne({name: userId}, function (err, user) {
    if (err)
      res.status(401).send("User not found");
    console.log("User name is " + user.name);
    console.log("User books are " + user.mybooks);
    user.requests = _.remove(user.requests, function(elt) {elt.bookid == bookId;});
    console.log("book is "+bookId);
    console.log("Saved books are " + user.mybooks);
    user.save(function (err) {
      if (err) 
        res.status(405).send("Failed to remove book");
      else
        res.status(200).send('OK');
      });
  });
}
*/
exports.removeBook = function(req, res, next) {
  var userId = req.params.user;
  var bookId = req.params.bookid;
  console.log("Book Id iS " +  req.params.bookid);
  console.log("Attempting to remove book userId = " +userId);

  User.findOne({name: userId}, function (err, user) {
    if (err)
      res.status(401).send("User not found");
    console.log("User name is " + user.name);
    console.log("User books are " + user.mybooks);
    user.mybooks = _.remove(user.mybooks, function(elt) {elt._id == bookId;});
    console.log("book is "+bookId);
    console.log("Saved books are " + user.mybooks);
    user.save(function (err) {
      if (err) 
        res.status(405).send("Failed to remove book");
      else
        res.status(200).send('OK');
      });
  });
}


/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
