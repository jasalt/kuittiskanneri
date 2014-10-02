"use strict";
/*
 * User account operations and authentication.
 * HTTP Simple authentication, session stored to cookies.
 */
angular.module('myApp.userAuthentication', ['myApp.receipt',
                                            'myApp.receiptService',
                                            'myApp.authUtils'])
  .service('userService', function($http, $location, $timeout, $cookies, Base64, receiptService) {
    var user = null;

    this.registerUser = function(username, password) {
      $http({method: 'POST', url: '/api/user/',
             data: {
               'username': username,
               'password': password}}).
        success(function(data) {
          setUser(data.username, data.pw_hash);
          $location.path('/home');
        }).
        error(function(data) {
          console.log("something wrong with registration.. duplicate user maybe");
          console.log(data);
        });
    };


    /*
     * Login user to API with credentials.
     * Open browser basic auth login dialog.
     */
    this.loginUser = function() {
      $http({method: 'GET', url: '/api/user/'}).
        success(function(data) {
          console.log("Login OK.");
          setUser(data._id, data.pw_hash);
          $location.path('/home');
        }).
        error(function(data) {
          console.log("Login Error:");
          console.log(data);
        });
    };


    /*
     * Set login cookie for successfully logged in user
     */
    var setUser = function(username, userhash){
      if (!username){
        console.log("Missing login information.");
        this.logoutUser();

      } else {
        console.log("Storing login cookie for user: " + username);

        user = username;

        if (!$cookies.authdata){
          var authString = Base64.encode(username + ':' + userhash);
          $http.defaults.headers.common.Authorization = 'Basic ' + authString;
          $cookies.authdata = authString;
        }
      }
    };


    /*
     * Return username for currently logged in user
     */
    this.getUser = function() {
      return user;
    };


    /*
     * TODO properly
     */
    this.logoutUser = function() {
      console.log("Clearing authentication data");

      user = null;

      delete $cookies.authdata;
      document.execCommand("ClearAuthenticationCache");
      delete $http.defaults.headers.common.Authorization;

      //TODO BUG: browser still stores password somehow after logout?
      window.location.reload(true);
      $location.path('/index');
    };
  });
