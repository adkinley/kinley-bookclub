'use strict';
var apikey = 'AIzaSyCE85DXHNPzH7JtJoP6wPUh9W_XYPstnPw';

angular.module('kinleyBookclubApp')
  .controller('MainCtrl', function ($scope, $http, socket, Auth, $window, $cookies, $location) {
    $scope.awesomeThings = [];
    $scope.books = [];
    $scope.userBooks  = [];
    $scope.currentUser = "nobody";
    $scope.user = undefined;

    $scope.showMyBooks = false;
    $scope.showLibrary = false;
    $scope.showRequests = true;
    $scope.searchBar = false;
    $scope.showRequests = true;
    $scope.showMyRequests = false;
    $scope.showPendingRequests = false;
    console.log("In Main Controller "); 

    if ($location.path()==='/mybooks') {
      $scope.showMyBooks = true;
      $scope.searchBar = true;
    }

    if ($location.path()==='/allbooks')
      $scope.showLibrary = true;

    loadLibrary();
    
    $scope.toggleMyRequests = function() {
      $scope.showPendingRequests = false;
      $scope.showMyRequests = true;
    }

    $scope.toggleRequests = function() {
      $scope.showPendingRequests = true;
      $scope.showMyRequests = false;
    }

    function loadCurrentUser() {
      if (Auth.isLoggedIn()) {
        $scope.currentUser = Auth.getCurrentUser().name;
        $http.get('/api/users/me').success(function (data) {
          console.log("User info is " + JSON.stringify(data));
          $scope.user = data;
          var books  = $scope.awesomeThings;
          $scope.userBooks = [];
          _.forEach(books, function (element) {
            if (element.owner == $scope.user.name)
             $scope.userBooks.push(element);
         });

      });
    }
  }

/*  $http.get('https://www.googleapis.com/books/v1/volumes?q=flowers+for+algernon&printType=books&maxResults=10&key=AIzaSyCE85DXHNPzH7JtJoP6wPUh9W_XYPstnPw')
  .success(function(result) {
    console.log("Result:");
    console.log(JSON.stringify(result.items));
    $scope.books = result.items;
  });
*/
function loadLibrary() {
   $http.get('/api/books').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('book', $scope.awesomeThings);
      loadCurrentUser();
    });
 }

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
  available: true,
  location: "",
  active: true};
  return entry;
}



function removeRequest(bookid, requester, owner) {
  // remove bookid from requester myrequests list
  // remove bookid from owner requests list
  
  $http.put('/api/users/remove/ask/'+owner+'/'+requester+'/'+bookid).success(function(data) {
    if (data.name == Auth.getCurrentUser().name)
      $scope.user = data;

    $http.put('/api/users/remove/request/'+requester+'/'+owner+'/'+bookid).success(function(data) {
      if (data.name == Auth.getCurrentUser().name)
        $scope.user = data;
    });
  });

    console.log("General remove request method");
}

function makeAvailable(bookid) {
  console.log("Make book available");
     var book =  _.find($scope.awesomeThings , function (book) { return book._id== bookid;} );
   book.available = true;
   $http.put('/api/books/'+book._id, book); // make book unavailable
}

$scope.rejectRequest = function(bookid, requester) {
  // Remove requester from requester and owner
  // book should be made available again
  removeRequest(bookid, requester, Auth.getCurrentUser().name);
  makeAvailable(bookid);
  console.log("Reject request");
}
$scope.acceptRequest = function(bookid, requester) {
  console.log("Accept request");
  // remove request from requester and owner
  removeRequest(bookid, requester, Auth.getCurrentUser().name);
  makeAvailable(bookid);
  var book =  _.find($scope.awesomeThings , function (book) { return book._id== bookid;} );
  console.log("Changing owner from : "+book.owner + " to " + requester); 
  // also have to change ownership in booklist of each person, this is more problematic
  book.owner = requester;
   $http.put('/api/books/'+book._id, book).success(function (data) {
    console.log("Successfully changed ownership of book");
   }); // make book unavailable  var book = 

  // remove book from owner library and add to requester library, this is just changing owner of book
}

$scope.deleteRequest = function(bookid, owner) {
  // remove request from requster and owner
    removeRequest(bookid, Auth.getCurrentUser().name, owner);
    makeAvailable(bookid);
  // book should be made available again
  console.log("Delete request");
}



$scope.request = function(bookId) {
  console.log("Making request");
   var book =  _.find($scope.awesomeThings , function (book) { return book._id== bookId;} );
   book.available = false;
   $http.put('/api/books/'+book._id, book).success(function (data) { // make book unavailable
    console.log("Book request success");
   $http.put('/api/users/ask/' + book.owner +'/'+ Auth.getCurrentUser().name +'/'+book._id).success(function (data2) {
   $http.put('/api/users/request/' + Auth.getCurrentUser().name + '/' +book.owner+'/'+book._id).success(function (data3){
    $scope.user = data3;
    console.log("After request " + JSON.stringify(data3));
   }); // mark that I have a current ask

    // add the request to the current User and the owner of the book
   });
   }) ; //   ask user for book

}

$scope.getTitle = function(bookid, owner) {
  
    var  book = _.find($scope.awesomeThings, function(elt) { 
      return (elt._id == bookid && elt.owner==owner);});
    if (book == undefined) 
      return "Don't have a title yet";

    return book.name;
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
