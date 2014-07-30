'use strict';

/* Controllers */

angular.module('myApp.controllers', ['angularFileUpload'])
    .controller('HomeCtrl', ['$scope', function($scope, $upload) {
        console.log("welcome home");
        
    }])
    .controller('ReceiptCtrl', ['$scope', function($scope) {

    }]);
