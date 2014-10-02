"use strict";
angular.module('myApp.home', ['myApp.userAuthentication',
                              'myApp.receiptService',
                              'myApp.receipt'])
  .controller('HomeController', function($scope, receiptService, userService, $location, $timeout) {
    $scope.currentPage = 0;
    $scope.pageSize = 10;

    console.log("Getting receipts for " + userService.getUser());

    // Minimum animation delay
    $timeout(function() {
      $scope.delaySpent = true;
    },500);

    receiptService.getUserReceipts().then(function(result) {
      var receipts = result.data.receipts;
      if (receipts.length === 0){
        return;
      }
      else {
        $scope.receipts = receipts.reverse();

        $scope.numberOfPages = function(){
          return Math.ceil($scope.receipts.length/$scope.pageSize);
        };
      }
    });

    /*
     * When selecting a receipt from history, set it as current and redirect to receipt view
     */
    $scope.selectReceipt = function(receipt) {
      receiptService.setReceipt(receipt);
      $location.path('/receipt');
    };

    $scope.deleteReceipt = function(receiptid) {
      receiptService.deleteReceipt(receiptid).success(function() {
        // After successful delete, remove from scope also
        $scope.receipts = _.without($scope.receipts, _.findWhere(
          $scope.receipts, {'_id': receiptid}));
      });
    };
  })
  .filter('startFrom', function() {
    /*
     * For home page pagination. Used with builtin LimitTo filter.
     */
    return function(input, start) {
      // HACKFIX missing input
      var input0 = input || "";
      start = +start; //parse to int
      return input0.slice(start);
    };
  });
