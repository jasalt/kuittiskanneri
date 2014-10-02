"use strict";
/*
 * User account operations and authentication.
 */
angular.module('myApp.userAuthentication', ['myApp.receipt',
                                            'myApp.receiptService',
                                            'myApp.authUtils'])
  .service('userService', function($http, $location, $timeout, $cookies, Base64, receiptService) {
    var user = null;
    //var userhash = null;
    if ($cookies.authdata){
      $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.authdata;
    }

    this.getUsername = function() {
      return user;
    };

    /*
     * Set user password and hash to service variable, cookie and
     * http request content for basic auth
     */
    var setUser = function(username, userhash){
      if (!username){
        console.log("Missing username. Logging out.");
        user = null;

        delete $cookies.authdata;
        document.execCommand("ClearAuthenticationCache");
        delete $http.defaults.headers.common.Authorization;


        //TODO: browser still stores password somehow after logout?
        window.location.reload(true);

      } else {
        console.log("Login verified OK, user: " + username);

        user = username;

        // If just logged in, save session as cookie.
        if (!$cookies.authdata){
          var authString = Base64.encode(username + ':' + userhash);
          $http.defaults.headers.common.Authorization = 'Basic ' + authString;
          $cookies.authdata = authString;
        }
      }
    };

    /*
     * Validate existing browser login cookie with API
     */
    this.checkCookie = function(){
      // Check that cookies exist
      if (!$cookies.authdata) {
        console.log("No login cookie found.");
        return false;
      }
      return true;
    };

    /*
     * Login user to API with credentials.
     * Open browser basic auth login dialog.
     */
    this.loginUser = function() {
      $http({method: 'GET', url: '/api/user/'}).
        success(function(data) {
          console.log("Login OK!");
          setUser(data._id, data.pw_hash);
          receiptService.setUserReceipts(data.receipts);
          $location.path('/home');
        }).
        error(function(data) {
          console.log("Login Error:");
          console.log(data);
        });
    };

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

    this.logout = function() {
      setUser();
      $location.path('/index');
    };
  });
