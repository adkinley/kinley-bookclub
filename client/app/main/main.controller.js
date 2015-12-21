'use strict';
//var apikey = 'AIzaSyCE85DXHNPzH7JtJoP6wPUh9W_XYPstnPw';

angular.module('kinleyBookclubApp')
  .controller('MainCtrl', function ($scope, $http, socket, Auth, $window, $cookies, $location) {
    $scope.awesomeThings = [];
    $scope.books = [];
    $scope.userBooks  = [];
    $scope.currentUser = "nobody";
    $scope.user = undefined;

    $scope.showMyBooks = false;
    $scope.showLibrary = true;
    $scope.showRequests = true;
    $scope.searchBar = false;
    $scope.showRequests = true;
    $scope.showMyRequests = false;
    $scope.showPendingRequests = false;
    $scope.loggedIn = Auth.isLoggedIn();

    // could have done this way better, but ngRoute allows this so it will 
    // stay this way but i could have angular-fullstack:route newroute on this
    if ($location.path()==='/mybooks') {
      $scope.showMyBooks = true;
      $scope.searchBar = true;
      $scope.showLibrary = false;
    }

    if ($location.path()==='/allbooks') {
      $scope.showLibrary = true;
      $scope.searchBar = false;
      $scope.showMyBooks = false;
    }
    // Always load up the current library -- I have some issues of scale on this. I would not want to load and 
    // store 10000 books if the library contained that many. Perhaps there is another way....
    loadLibrary();
    
    // These two methods are obviously poorly named but are meant to allows up to focus on either
    // The requests made to us or the requests we have made
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

          var booklist  = data.mybooks;
         // console.log("User data is " + JSON.stringify($scope.user));
          var booklist  = $scope.awesomeThings;
          $scope.userBooks = [];
          _.forEach(booklist, function (element) {
            $http.get("/api/books/"+element._id).success(function (entry) {
             $scope.userBooks.push(entry);
           });
         });

      });
    }
  }


function loadLibrary() {
   $http.get('/api/books').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      loadCurrentUser();
      socket.syncUpdates('book', $scope.awesomeThings, function() {loadCurrentUser();});
    });
 }

$scope.clearSearchResults = function() {
  $scope.books = [];
}
$scope.remove = function(bookId) {
  _.remove($scope.books, function (elt) { return elt.id == bookId;})
} ;


function createEntry(book) {
  var entry = { name: book.volumeInfo.title,
  author: book.volumeInfo.authors[0],
  thumbnailURL: book.volumeInfo.imageLinks.thumbnail,
  bookID: book.id,
  owner: Auth.getCurrentUser().nameXS,
  available: true,
  location: "",
  active: true};
  return entry;
}



function removeRequest(bookid, requester, owner) {
  // remove bookid from requester myrequests list
  // remove bookid from owner requests list

  $http.put('/api/users/remove/ask/'+owner+'/'+requester+'/'+bookid).success(function(data) {
    $http.put('/api/users/remove/request/'+requester+'/'+owner+'/'+bookid).success(function(data2) {
      loadCurrentUser();
    });
  });


}

function makeAvailable(bookid) {
     var book =  _.find($scope.awesomeThings , function (book) { return book._id== bookid;} );
   book.available = true;
   $http.put('/api/books/'+book._id, book); // make book unavailable
}

$scope.rejectRequest = function(bookid, requester) {
  // Remove requester from requester and owner
  // book should be made available again
  removeRequest(bookid, requester, Auth.getCurrentUser().name);
  makeAvailable(bookid);

}
$scope.acceptRequest = function(bookid, requester) {

  // remove request from requester and owner
  removeRequest(bookid, requester, Auth.getCurrentUser().name);
  makeAvailable(bookid);
  var book =  _.find($scope.awesomeThings , function (book) { return book._id== bookid;} );

  // also have to change ownership in booklist of each person, this is more problematic
  book.owner = requester;
   $http.put('/api/books/'+book._id, book).success(function (data) {
   }); // make book unavailable  var book = 

  // remove book from owner library and add to requester library, this is just changing owner of book
}

$scope.deleteRequest = function(bookid, owner) {
  // remove request from requster and owner
    removeRequest(bookid, Auth.getCurrentUser().name, owner);
    makeAvailable(bookid);
  // book should be made available again

}



$scope.request = function(bookId) {

   var book =  _.find($scope.awesomeThings , function (book) { return book._id== bookId;} );
   book.available = false;
   
   $http.put('/api/books/'+book._id, book).success(function (data) { // make book unavailable
   $http.put('/api/users/ask/' + book.owner +'/'+ Auth.getCurrentUser().name +'/'+book._id).success(function (data2) {
   $http.put('/api/users/request/' + Auth.getCurrentUser().name + '/' +book.owner+'/'+book._id).success(function (data3){
     $scope.user = data3;
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
  
   var book =  _.find($scope.awesomeThings , function (book) { return book.id== bookId;} );
   $http.put('/api/users/add/'+Auth.getCurrentUser().name+'/'+book._id).success(function (data) {

    });
  // console.log("Certainly got to here");
   if (Auth.isLoggedIn()) {
    //console.log("Added to book to user list")
    $scope.userBooks.push(book);
   }
 //}
}

/** Given the id of a book (from the results of a search) 
  Add the book to the database of books and to the authenticated users library **/
$scope.addFromSearch = function(bookId) {
   var book =  _.find($scope.books , function (book) { return book.id== bookId;} );
   var entry = createEntry(book);

   if (Auth.isLoggedIn()) {
    //console.log("Adding book from serach list");
//    $scope.userBooks.push(entry);
  //  console.log("Added: " + JSON.stringify($scope.userBooks));
  }

    $http.post('/api/books', entry).success(function (data) {
     $http.put('/api/users/add/'+Auth.getCurrentUser().name+'/'+data._id).success(function (data2) {
      _.remove($scope.books , function (book) { return book.id== bookId;} );
    //  console.log("Successfull added: " +JSON.stringify(data));
      //console.log("and: " + JSON.stringify(data2));
     //console.log("UserBooks: " + JSON.stringify($scope.userBooks));
           loadCurrentUser();
      loadLibrary();
      //console.log("can we reload everything");
     //console.log("UserBooks: " + JSON.stringify($scope.userBooks));
     });
   })
  .error(function(err) {

  });


 //}
}

$scope.search =  function() {

  var searchAPI = 'https://www.googleapis.com/books/v1/volumes?q='+$scope.bookTitle+'&printType=books&maxResults=10&callback=JSON_CALLBACK';
  //key=AIzaSyCE85DXHNPzH7JtJoP6wPUh9W_XYPstnPw';
  $scope.bookTitle = '';
  $http.jsonp(searchAPI)
  .success(function(result) {

    $scope.books = result.items;
  });

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
      socket.unsyncUpdates('book');
    });
  });
