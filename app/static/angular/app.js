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
            { templateUrl: 'angular/views/root/root.html',
              controller: 'RootController'})
      .when('/register',
            { templateUrl: 'angular/views/register/register.html',
              controller: 'RegisterController'})
      .when('/home',
            { templateUrl: 'angular/views/home/home.html',
              controller: 'HomeController'})
      .when('/upload',
            { templateUrl: 'angular/views/upload/upload.html',
              controller: 'UploadController'})
      .when('/stats',
            { templateUrl: 'angular/views/stats/stats.html',
              controller: 'StatsController'})
      .when('/receipt',
            { templateUrl: 'angular/views/receipt/receipt.html',
              controller: 'ReceiptController'})
      .when('/about', { templateUrl: 'angular/views/about/about.html'})
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
