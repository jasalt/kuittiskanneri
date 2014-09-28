"use strict";
angular.module('myApp.navbar', ['myApp.userAuthentication'])

  .controller('NavbarController', function($scope, $location, userService) {
    $scope.isActive = function(viewLocation) {
      return viewLocation === $location.path();
    };

    $scope.login = userService.loginUser;

    // TODO get information about change from message as this value is not updated
    // listen for changes in location or messages and re-query

    $scope.$on("$routeChangeSuccess", function() {
      $scope.user = userService.getUsername();
      if (!$scope.user) {
        console.log("Not logged in.");
      }
    });

    $scope.logout = function() {
      alert("logging out");
      userService.logout();
    };
  });
