"use strict";
/*
 * Load app modules
 */
angular.module('myApp', [
  'ngRoute',
  'ngCookies',
  'ngAnimate',

  // Controller for navbar declared in ../index.html
  'myApp.navbar',

  // Partial views
  'myApp.root',
  'myApp.register',
  'myApp.home',
  'myApp.upload',
  'myApp.stats',

  'myApp.authUtils',
  // Loading bar for AJAX requests
  'cfp.loadingBarInterceptor'
])
/*
 * Set url routings
 */
  .config(function($routeProvider, cfpLoadingBarProvider) {
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

    // Disable loading bar spinner
    cfpLoadingBarProvider.includeSpinner = false;
  })
/*
 * Check that user is authenticated, redirect otherwise.
 * TODO: cookies are not removed with logout
 */
  .run(function($location, $cookies, userService) {
    if (!$cookies.authdata) {
      console.log("User not logged in, redirecting to index");
      $location.path('/');
    } else {
      console.log("Cookie found, logging in");
      userService.loginUser();
      $location.path('/home');
    }
  });
