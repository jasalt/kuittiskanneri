// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'myApp.filters',
    'myApp.directives',

    // Views
    'myApp.home',
    'myApp.upload',
    'myApp.register',
    'myApp.receipt',
    'myApp.navbar',
    'myApp.root',

    'myApp.receiptService',
    // Authentication
    'myApp.userAuthentication'
]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/',
                  { templateUrl: 'angular/root/root.html',
                    controller: 'RootController'})
            .when('/register',
                  { templateUrl: 'angular/register/register.html',
                    controller: 'RegisterController'})
            .when('/home',
                  { templateUrl: 'angular/home/home.html',
                    controller: 'HomeController'})
            .when('/upload',
                  { templateUrl: 'angular/upload/upload.html',
                    controller: 'UploadController'})
            .when('/receipt',
                  { templateUrl: 'angular/receipt/receipt.html',
                    controller: 'ReceiptController'})
            .when('/about', { templateUrl: 'angular/about/about.html'})
            .otherwise({redirectTo: '/'});
    }])
    .run(function($logincheck, $location, $cookies, userService) {
        if (!$cookies.authdata) {
            console.log("User not logged in, redirecting to index");
            $location.path('/');
        } else
        {
            console.log("Cookie found, logging in");
            userService.loginUser();
            $location.path('/home');
        }
    });
