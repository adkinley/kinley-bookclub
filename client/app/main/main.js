'use strict';

angular.module('kinleyBookclubApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .when('/allbooks',{
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .when('/mybooks',{
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
      	
  });