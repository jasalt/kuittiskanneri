angular.module('myApp.root', ['myApp.userAuthentication'])

    .controller('RootController', function($scope, $timeout, $location, userService) {
        console.log("index");
        $scope.login = userService.loginUser;
    });
