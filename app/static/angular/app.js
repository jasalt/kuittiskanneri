"use strict";
// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'ngAnimate',

    // Views
    'myApp.home',
    'myApp.upload',
    'myApp.register',
    'myApp.receipt',
    'myApp.navbar',
    'myApp.root',
    'myApp.stats',

    'myApp.receiptService',
    // Authentication
    'myApp.userAuthentication',
    'datehistogram',
    'autocomplete'
]).
    config(function($routeProvider, $httpProvider) {
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
            .when('/stats',
                  { templateUrl: 'angular/stats/stats.html',
                    controller: 'StatsController'})
            .when('/receipt',
                  { templateUrl: 'angular/receipt/receipt.html',
                    controller: 'ReceiptController'})
            .when('/about', { templateUrl: 'angular/about/about.html'})
            .otherwise({redirectTo: '/'});

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/json; charset=utf-8';
    })
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
