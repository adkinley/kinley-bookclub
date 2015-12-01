'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MybooksSchema = new Schema({
  name: String,
  info: String,
  location: String,
   active: Boolean,
   // myrequests: [{bookId:String,owner:String}],
  //requests: [{bookId:String,owner:String}],
  mybooks:[{bookId:String}]
});



module.exports = mongoose.model('Mybooks', MybooksSchema);