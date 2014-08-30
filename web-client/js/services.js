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

app.service('userService', function($http, $location, $timeout, $cookies, Base64) {
    var user = null;
    //var userhash = null;
    if ($cookies.authdata){
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.authdata;
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
            
            delete $cookies['authdata'];
            document.execCommand("ClearAuthenticationCache");
            delete $http.defaults.headers.common['Authorization'];

        } else {
            console.log("Login verified OK!");
            user = username;

            // If just logged in, save session as cookie.
            if (!$cookies.authdata){
                var authString = Base64.encode(username + ':' + userhash);
                $http.defaults.headers.common['Authorization'] = 'Basic ' + authString;
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
        //TODO unnecessary
        // // Validate with API
        // $http({method: 'POST', url: '/api/verifycookie/',
        //        data: {'username': cookie_user, 'pwhash': pwhash}}).
        //     success(function(data, status, headers, config) {
        //         //set user
        //         user = cookie_user;
        //         userhash = pwhash;
        //         console.log("Login verified OK!");
        //         setUser(cookie_user, pwhash);
        //         return true;
        //     }).
        //     error(function(data, status, headers, config) {
        //         console.log("Cookie validation error, removing cookies.");
        //         setUser();
        //         return false;
        //     });
        // return true;
    };

    /*
     * Login user to API with credentials.
     * Open browser basic auth login dialog.
     */
    this.loginUser = function() {
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
app.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };
});;
