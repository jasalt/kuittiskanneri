'use strict';

/* Services */

var app = angular.module('myApp.services', []);
app.service('receiptService', function($http, $location) {
    /*
     * Provide receipt data between different controllers.
     */
    var receipt = null;

    var userReceipts = null;

    // this.receipt = this.mockReceipt;
    this.getReceipt = function() {
        // get current receipt or one specified by id
        return receipt;
    };

    this.getMockReceipt = function() {
        var mockReceipt = {"date":{"Y":2011,"h":21,"M":5,"m":1,"D":20},"total_sum":null,"credit_card":false,"products":[{"price":4.4,"name":"sanimiiaaapanna 1kg","$$hashKey":"012"},{"price":1.511,"name":"valio rasvaton nam 1,51","$$hashKey":"013"},{"price":1.59,"name":"elonen misevas 540g 9101","$$hashKey":"014"},{"price":0.75,"name":"pirkka banaani","$$hashKey":"015"},{"price":0.79,"name":"es mrnikalahim 105/1409 velie","$$hashKey":"016"},{"price":1.111,"name":"piri/ka naksanakkara 3009","$$hashKey":"017"},{"price":10,"name":"vhieevsli","$$hashKey":"018"},{"price":4.4,"name":"sanimiiaaapanna 1kg","$$hashKey":"019"},{"price":1.511,"name":"valio rasvaton nam 1,51","$$hashKey":"01A"},{"price":1.59,"name":"elonen misevas 540g 9101","$$hashKey":"01B"},{"price":0.75,"name":"pirkka banaani","$$hashKey":"01C"},{"price":0.79,"name":"es mrnikalahim 105/1409 velie","$$hashKey":"01D"},{"price":1.111,"name":"piri/ka naksanakkara 3009","$$hashKey":"01E"},{"price":10,"name":"vhieevsli","$$hashKey":"01F"}],"shop_name":"1101101100001 1011311101"};

        // get current receipt or one specified by id
        return mockReceipt;
    };

    this.updateReceipt = function(rcpt) {
        // Update receipt to api
        
    };

    this.setReceipt = function(rcpt) {
        receipt = rcpt;
        //    $location.path('/receipt');
    };

    this.setUserReceipts = function(receipts) {
        userReceipts = receipts;
        //    $location.path('/receipt');
    };

    this.getUserReceipts = function() {
        return userReceipts;
        //    $location.path('/receipt');
    };


    this.discardReceipt = function(rcpt) {
        receipt = null;
        $location.path('/home');
    };

    this.deleteReceipt = function(receiptid) {
        $http({method: 'DELETE', url: '/api/receipt/',
               data: receiptid}).
            success(function(data, status, headers, config) {
                console.log("Receipt saved");
                $location.path('/home');
            }).
            error(function(data, status, headers, config) {
                console.log("Something wrong with saving receipt.. duplicate maybe?");
                console.log(data);
            });
        $location.path('/home');
    };

    /*
     * Save modified receipt after upload
     */

    this.saveReceipt = function(modifiedReceipt) {
        // TODO if has id, then UPDATE
        var methodForRequest = "POST";
        if ("_id" in modifiedReceipt) {
            methodForRequest = "UPDATE";
        }
        $http({method: methodForRequest, url: '/api/receipt/',
               data: modifiedReceipt}).
            success(function(data, status, headers, config) {
                console.log("Receipt saved");
                $location.path('/home');
            }).
            error(function(data, status, headers, config) {
                console.log("Something wrong with saving receipt.. duplicate maybe?");
                console.log(data);
            });
    };
});

app.service('userService', function($http, $location, $timeout, $cookies, Base64, receiptService) {
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


            //TODO: browser still stores password somehow after logout?
            window.location.reload(true);

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
                receiptService.setUserReceipts(data['receipts']);
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
                setUser(data['username'], data['pw_hash']);
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
