'use strict';
var apikey = 'AIzaSyCE85DXHNPzH7JtJoP6wPUh9W_XYPstnPw';

angular.module('kinleyBookclubApp')
  .controller('MainCtrl', function ($scope, $http, socket, Auth, $window, $cookies) {
    $scope.awesomeThings = [];
    $scope.books = [];
    $scope.userBooks  = [];
    $scope.currentUser = "nobody";

console.log("In Main Controller "); ;
   if (Auth.isLoggedIn()) {
    $scope.currentUser = Auth.getCurrentUser().name;
    $http.get('/api/users/me').success(function (data) {
      console.log("User info is " + JSON.stringify(data));
      var books  = data.mybooks;
      $scope.userBooks = [];
      _.forEach(books, function (element) {
       $http.get('/api/books/'+element).success(function (data) {
         console.log("Found " + JSON.stringify(data));
         $scope.userBooks.push(data);
       });
      });
    });
      console.log("User if logged in as " + Auth.getCurrentUser().name);
    }
    else
      console.log("User is not bob logged in");

/*  $http.get('https://www.googleapis.com/books/v1/volumes?q=flowers+for+algernon&printType=books&maxResults=10&key=AIzaSyCE85DXHNPzH7JtJoP6wPUh9W_XYPstnPw')
  .success(function(result) {
    console.log("Result:");
    console.log(JSON.stringify(result.items));
    $scope.books = result.items;
  });
*/
   $http.get('/api/books').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('book', $scope.awesomeThings);
    });

$scope.remove = function(bookId) {
  console.log("Called remove "+bookId);
  _.remove($scope.books, function (elt) { return elt.id == bookId;})
} ;


function createEntry(book) {
  var entry = { name: book.volumeInfo.title,
  author: book.volumeInfo.authors[0],
  thumbnailURL: book.volumeInfo.imageLinks.thumbnail,
  bookID: book.id,
  owner: Auth.getCurrentUser().name || 'adkinley',
  location: "",
  active: true};
  return entry;
}


$scope.addFromLibrary = function(bookId) {
  //console.log("In add with " + bookId + " auth = " + Auth.isLoggedIn());
 /*if (!Auth.isLoggedIn()) {
      $cookies.addBook =true;
      $cookies.bookId = bookId;
      console.log("THis is where we should authenticate");;
      */
//      $window.location.href = '/login';
      // should add cookies to redo search and complete this if successful authenticating

//       }
  //else if (Auth.isLoggedIn()) {
   var book =  _.find($scope.awesomeThings , function (book) { return book.id== bookId;} );

   // console.log("Book: " + JSON.stringify(data));
   $http.put('/api/users/add/'+Auth.getCurrentUser().name+'/'+book._id).success(function (data) {
     //     console.log("User: " + JSON.stringify(data));
    });

   if (Auth.isLoggedIn()) {
    $scope.userBooks.push(book);
   }
 //}
}

/*if ($cookies.addBook!=undefined && $cookies.addBook) {
  $scope.add($cooki<es.bookId);
  $cookies.addBook = false;
  $cookies.bookid ='';
}*/
/** Given the id of a book (from the results of a search) 
  Add the book to the database of books and to the authenticated users library **/
$scope.addFromSearch = function(bookId) {
  //console.log("In add with " + bookId + " auth = " + Auth.isLoggedIn());
 /*if (!Auth.isLoggedIn()) {
      $cookies.addBook =true;
      $cookies.bookId = bookId;
      console.log("THis is where we should authenticate");;
      */
//      $window.location.href = '/login';
      // should add cookies to redo search and complete this if successful authenticating

//       }
  //else if (Auth.isLoggedIn()) {
   var book =  _.find($scope.books , function (book) { return book.id== bookId;} );

   var entry = createEntry(book);
   if (Auth.isLoggedIn()) {
    $scope.userBooks.push(entry);
  }
    // console.log("Book is " + JSON.stringify(entry));
    $http.post('/api/books', entry).success(function (data) {
   // console.log("Book: " + JSON.stringify(data));
   $http.put('/api/users/add/'+Auth.getCurrentUser().name+'/'+data._id).success(function (data) {
     //     console.log("User: " + JSON.stringify(data));
   });
 })
  .error(function(err) {
    console.log("Error trying to /api/books probably auth failure "+ err);
  });


 //}
}

$scope.search =  function() {
  console.log("Book title is " + $scope.bookTitle)
  var searchAPI = 'https://www.googleapis.com/books/v1/volumes?q='+$scope.bookTitle+'&printType=books&maxResults=10&callback=JSON_CALLBACK';
  //key=AIzaSyCE85DXHNPzH7JtJoP6wPUh9W_XYPstnPw';
  $scope.bookTitle = '';
  $http.jsonp(searchAPI)
  .success(function(result) {
    //console.log("Result:");
    //console.log(JSON.stringify(result));
    $scope.books = result.items;
  });
  console.log("Search function complete");
}
    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
      socket.unsyncUpdates('book');
    });
  });
