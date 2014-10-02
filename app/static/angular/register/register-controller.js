"use strict";
angular.module("myApp.register", ["myApp.userAuthentication"])
    .controller('RegisterController', function($scope, $timeout, $location, userService) {
      $scope.registerOk = null; // If user registration is OK show ui feedback
        $scope.submitRegisterForm = function() {
            console.log("Registering user " + $scope.username);
            userService.registerUser($scope.username, $scope.password);
        };
    });
