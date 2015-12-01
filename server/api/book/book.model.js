'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BookSchema = new Schema({
  name: String,
  author: String,
  thumbnailURL: String,
  bookID: String,
  owner: String,
  location: String,
  available: Boolean,
  active: Boolean
});


module.exports = mongoose.model('Book', BookSchema);


/*** THinks about my data needs

1) Store the books in the system
   i. TItle
   ii. API bookID
   iii. image url
   iv. author(s)
   v.  Should a book knows its owner???? Yes for purposes of setting up exchange
   vi. Does location of the book matter??

Actions
   Add a book to the system - duplicates should be allowed
   Remove a book from the system
   Change the owner of a book
   Sidenote: All books should be added to the system whenever they are created

   ****/

   /** What should we know about a user????
   **  1) Books they current have - stored by BookId
   **  2) location
   **  3) Requests they current have for other books (by book Id) array
   **  4) Requests from other users (store username of requester) array
   **  4) Of course ... username
   **  5) 

	Actions: 
	    1) Make a request for a book
	    2) Approve a request for one of your books
	    3) Delete corresponding requests from both users and update the ownership of the Book
	    4) Add a book to their list
	    5) Delete a book from their list


   **/