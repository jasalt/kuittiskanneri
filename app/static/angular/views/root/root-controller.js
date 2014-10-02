"use strict";
angular.module('myApp.root', ['myApp.userAuthentication'])
  .controller('RootController', function($scope, $timeout, $location, userService) {
    $scope.login = userService.loginUser;
  });
