angular.module('myApp.navbar', ['myApp.services'])

    .controller('NavbarController', function($scope, $location, userService) {
        $scope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.login = userService.loginUser;

        // TODO get information about change from message as this value is not updated
        // listen for changes in location or messages and re-query

        $scope.$on("$routeChangeSuccess", function($currentRoute, $previousRoute) {
            $scope.user = userService.getUsername();
            //console.log("route change");
            if ($scope.user) {
                //  console.log("User is loggedin!");
                console.log($scope.user);
            } else {
                //console.log("Not logged in.");
            }
        });


        $scope.logout = function() {
            alert("logging out");
            userService.logout();
        };


    })
