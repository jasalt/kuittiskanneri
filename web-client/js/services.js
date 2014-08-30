'use strict';

/* Services */

var app = angular.module('myApp.services', []);
app.service('receiptService', function() {
    /*
     * Provide receipt data between different controllers.
     */
    this.mockReceipt = {"date":{"Y":2014,"h":23,"m":15,"M":7,"D":16},"total_sum":null,"shop_name":"abc heinola","products":[{"price":2.39,"name":"hedelmäpupmijggurtti"},{"price":0.34,"name":"hakarueji"},{"price":7.29,"name":"hyvä suomi arkijuusto"},{"price":2.45,"name":"maksalaatikko"},{"price":2.49,"name":"broileripyörykät"},{"price":0.21,"name":"muovikassi 40l valio"},{"price":5.35,"name":"vmssezsn"}],"credit_card":true};

    // this.receipt = this.mockReceipt;
    this.getReceipt = function() {
        // get current receipt or one specified by id
        return this.receipt;
    };

    this.updateReceipt = function(rcpt) {
        // Update receipt to api
    };

    this.setReceipt = function(rcpt) {
        this.receipt = rcpt;
    };
});

app.service('userService', function($http, $location, $timeout, $cookies) {
    var user = null;
    var userhash = null;

    this.getUsername = function() {
        return user;
    };

    /*
     * Set user password and hash to service variable, cookie and
     * http request content for basic auth
     */
    var setUser = function(username, pwhash){
        if (!username || !pwhash){
            console.log("Missing username or pwhash. Logging out.");
            user = null;
            userhash = null;
            delete $cookies['currentUser'];
            delete $cookies['currentUserHash'];
        } else {
            console.log("Login verified OK!");
            user = username;
            userhash = pwhash;

            $cookies.currentUser = username;
            $cookies.currentUserHash = pwhash;

            //TODO http://wemadeyoulook.at/en/blog/implementing-basic-http-authentication-http-requests-angular/
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.authdata;
        }
    };

    /*
     * Validate existing browser login cookie with API
     */
    this.checkCookie = function(){
        var cookie_user = $cookies.currentUser;
        var pwhash = $cookies.currentUserHash;

        // Check that cookies exist
        if(!cookie_user || !pwhash) {
            console.log("No login cookies found.");
            return false;
        }

        // Validate with API
        $http({method: 'POST', url: '/api/verifycookie/',
               data: {'username': cookie_user, 'pwhash': pwhash}}).
            success(function(data, status, headers, config) {
                //set user
                user = cookie_user;
                userhash = pwhash;
                console.log("Login verified OK!");
                setUser(cookie_user, pwhash);
                return true;
            }).
            error(function(data, status, headers, config) {
                console.log("Cookie validation error, removing cookies.");
                setUser();
                return false;
            });
        return true;
    };

    /*
     * Login user to API with credentials.
     * Open browser basic auth login dialog.
     */
    this.loginUser = function(username, password) {
        $http({method: 'GET', url: '/api/user/'}).
            success(function(data, status, headers, config) {
                console.log("Login OK!");
                setUser(data['_id'], data['pw_hash']);
                $location.path('/home');
            }).
            error(function(data, status, headers, config) {
                console.log("Login Error:");
                console.log(data);
            });
        // HTTP Post /api/user/
        // {'username': username, 'password': password}
        // TODO create http-request function.
    };

    this.registerUser = function(username, password) {
        $http({method: 'POST', url: '/api/user/',
               data: {
                   'username': username,
                   'password': password}}).
            success(function(data, status, headers, config) {
                setUser(data['username'], data['pwhash']);
                $location.path('/home');
            }).
            error(function(data, status, headers, config) {
                console.log("something wrong with registration.. duplicate user maybe");
                console.log(data);
            });
        // HTTP Post /api/user/
        // {'username': username, 'password': password}
        // TODO create http-request function.
    };

    this.logout = function() {
        setUser();
        $location.path('/index');
    };

    // this.updatePassword = function(newPassword) {
    //     $http({method: 'UPDATE', url: '/api/user/'}).
    //         success(function(data, status, headers, config) {
    //             // this callback will be called asynchronously
    //             // when the response is available
    //         }).
    //         error(function(data, status, headers, config) {
    //             // called asynchronously if an error occurs
    //             // or server returns response with an error status.
    //         });
    //     // HTTP Post /api/user/
    //     // {'username': username, 'password': password}
    //     // TODO create http-request function.
    // };
});
