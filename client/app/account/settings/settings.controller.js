'use strict';

angular.module('kinleyBookclubApp')
  .controller('SettingsCtrl', function ($scope, User, Auth) {
    $scope.errors = {};

    $scope.updateAddress = function (form) {
      Auth.updateAddress($scope.city, $scope.state).then(function() {
        $scope.message = 'Address Updated';
        $scope.city = '';
        $scope.state = '';
      }).catch(function() {
        $scope.mesasage = 'Problem Updating Address';
      });
    }

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
		};
  });
