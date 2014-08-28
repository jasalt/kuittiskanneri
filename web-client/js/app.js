var login = angular.module('myLoginCheck', []).
        factory('$logincheck', function($cookies, $http, userService){
            // Runs when entering the application
            // Check user login status
            return function(){
                // Check cookies
                var user = $cookies.currentUser;
                var pwhash = $cookies.currentUserHash;

                if(!user) {
                    console.log("No login cookie found.");
                    return false;
                }

                // Validate cookie with server

                userService.setUser(user, pwhash);
                return true;
            };
        });


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',
    'myLoginCheck'
]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'partials/index.html', controller: 'IndexCtrl'});
        $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'RegisterCtrl'});
        $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
        $routeProvider.when('/upload', {templateUrl: 'partials/upload.html', controller: 'UploadCtrl'});
        $routeProvider.when('/receipt', {templateUrl: 'partials/receipt.html', controller: 'ReceiptCtrl'});
        $routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'AboutCtrl'});
        $routeProvider.otherwise({redirectTo: '/'});
    }])
    .run(function($logincheck, $location) {

        if( $logincheck())
        {
            console.log("User logged in, redirecting to home");
            $location.path('/home');
        }
        else
        {
            console.log("User not logged in, redirecting to index");
            $location.path('/');
        }
    });
