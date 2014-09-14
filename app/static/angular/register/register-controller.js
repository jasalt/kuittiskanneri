angular.module("myApp.register", ["myApp.services"])
    .controller('RegisterCtrl', function($scope, $timeout, $location, userService) {
        // Register dialog

        // if (userService.getUsername()){
        //     console.log("already logged in!@#");
        // }

        // TODO redirect if user already logged in
        $scope.registerOk = null; // If user registration is OK show ui feedback
        //$scope.username = null;
        //$scope.password = null;
        //var user = userService.getUser();
        $scope.submitRegisterForm = function() {
            console.log("Registering user " + $scope.username);
            userService.registerUser($scope.username, $scope.password);

            //userService.setUser($scope.user.name, $scope.user.pwhash);
        };

        // $timeout(function() {
        //     $location.path('/home');
        // }, 2000);
    })
