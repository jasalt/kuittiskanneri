'use strict';

/* Controllers */
angular.module('myApp.controllers', ['angularFileUpload'])
    .controller('HomeCtrl', ['$scope', function($scope) {
    }])
    .controller('UploadCtrl', ['$scope', '$upload', '$location', 'receiptService', function($scope, $upload, $location, receiptService) {
        $scope.onFileSelect = function($files) {
            console.log("selecting files");
            $scope.loading = true;
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: '/api/upload',
                    //method: 'POST' or 'PUT',
                    //headers: {'header-key': 'header-value'},
                    //withCredentials: true,
                    //data: {myObj: $scope.myModelObj},
                    file: file  // or list of files ($files) for html5 only
                    //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
                    // customize file formData name ('Content-Desposition'), server side file variable name.
                    //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'
                    // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
                    //formDataAppender: function(formData, key, val){}
                }).progress(function(evt) {
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    $scope.uploadPercent =  parseInt(100.0 * evt.loaded / evt.total);
                }).success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    console.log("Upload success, redirecting, response data:");
                    console.log(data);
                    receiptService.setReceipt(data);
                    $scope.loading = false;
                    $location.path("/receipt");
                }).error(function(er) {
                    console.log(er);
                    $scope.loading = false;
                });
                //.then(success, error, progress);
                // access or attach event listeners to the underlying XMLHttpRequest.
                //.xhr(function(xhr){xhr.upload.addEventListener(...)})
            }
            /* alternative way of uploading, send the file binary with the file's content-type.
             Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
             It could also be used to monitor the progress of a normal http post/put request with large data*/
            // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
        };
        /*
         * Change drop-box area css class when dragging file
         */
        $scope.dragOverClass = function($event) {
            var items = $event.dataTransfer.items;
            var hasFile = false;
            if (items != null) {
                for (var i = 0 ; i < items.length; i++) {
                    if (items[i].kind == 'file') {
                        hasFile = true;
                        break;
                    }
                }
            } else {
                hasFile = true;
            }
            return hasFile ? "upload-drop-box-dragover" : "upload-drop-box-dragover-err";
        };
    }])
    .controller('ReceiptCtrl', ['$scope', 'receiptService', function($scope, receiptService) {
        $scope.receipt = receiptService.getReceipt();

        $scope.changePaymentType = function() {
            $scope.receipt.credit_card = !$scope.receipt.credit_card;
        };
    }])
    .controller('AboutCtrl', ['$scope', function($scope) {
    }])
    .controller('IndexCtrl', function($scope, $timeout, $location, userService) {
        console.log("index");
    })
    .controller('RegisterCtrl', function($scope, $timeout, $location, userService) {
        // Register dialog

        if (userService.getUser()){
            console.log("already logged in!@#");
        }

        // TODO redirect if user already logged in
        $scope.registerOk = null; // If user registration is OK show ui feedback
        //$scope.username = null;
        //$scope.password = null;
        var user = userService.getUser();
        $scope.submitRegisterForm = function() {
            console.log("Registering user " + $scope.username);
            userService.registerUser($scope.username, $scope.password);

            //userService.setUser($scope.user.name, $scope.user.pwhash);
        };

        // $timeout(function() {
        //     $location.path('/home');
        // }, 2000);
    })
    .controller('NavbarCtrl', function($scope, $location, userService) {
        $scope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };
        // TODO get information about change from message as this value is not updated
        // listen for changes in location or messages and re-query
        
        $scope.$on("$routeChangeSuccess", function($currentRoute, $previousRoute) {
            $scope.user = userService.getUser();
            console.log("route change");
            if ($scope.user) {
                console.log("User is loggedin!");
                console.log($scope.user);
            } else {
                console.log("Not logged in.");
            }
        });
        

        $scope.logout = function() {
            alert("logging out");
            userService.logout();
        };

        
    });
